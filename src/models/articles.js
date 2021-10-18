const db = require('../db')
const { generalLogger: logger } = require('../logger')

function sendQuery(sql, values, cb) {
  logger.debug(sql)
  db.query(sql, values, (err, results) => {
    if (err) return cb(err)
    cb(null, results)
  })
}

function getTagId(tags, cb) {
  if (!tags || tags.length === 0) return cb(null, [])
  const sql = `SELECT tag_id FROM tags WHERE tag_name IN(${Array(tags.length).fill('?').join(', ')});`
  sendQuery(sql, tags, cb)
}

function getArticlePaginationSuffix(options) {
  let sql = ''
  const values = []

  if (!options) return false

  if (options.limit) {
    if (options.cursor) {
      sql += ` AND article_id >= ?
              GROUP BY A.article_id
              LIMIT ?`
      values.push(options.cursor)
      values.push(options.limit)
    } else if (options.offset || options.offset === 0) {
      sql += ' LIMIT ? OFFSET ?'
      values.push(options.limit)
      values.push(options.offset)
    } else {
      sql += ' LIMIT ?'
      values.push(options.limit)
    }
  }

  return { sql, values }
}

function getTagSearchingSuffix(tags = []) {
  if (tags.length === 0) return false
  const sql = ` HAVING GROUP_CONCAT(T.tag_name SEPARATOR ', ') REGEXP ?`
  const value = tags.join('|')

  return { sql, value }
}

function combineTagAndPaginationSuffix(originQuery = { sql: '', values: [] }, tagSuffix = false, paginationSuffix = false) {
  if (tagSuffix) {
    originQuery.sql += tagSuffix.sql
    originQuery.values.push(tagSuffix.value)
  }

  if (paginationSuffix && /GROUP BY A.article_id/.test(paginationSuffix.sql)) {
    originQuery.sql = originQuery.sql.replace('GROUP BY A.article_id', '')
    if (tagSuffix) {
      originQuery.sql = originQuery.sql.replace(`HAVING GROUP_CONCAT(T.tag_name SEPARATOR ', ') REGEXP ?`, '')
      const tagValue = originQuery.values.pop()

      paginationSuffix.sql = paginationSuffix.sql.replace('GROUP BY A.article_id', `GROUP BY A.article_id HAVING GROUP_CONCAT(T.tag_name SEPARATOR ', ') REGEXP ?`)
      const limitValue = paginationSuffix.values.pop()

      originQuery.sql += paginationSuffix.sql
      originQuery.values = originQuery.values.concat([...paginationSuffix.values, tagValue, limitValue])
    } else {
      originQuery.sql += paginationSuffix.sql
      originQuery.values = originQuery.values.concat(paginationSuffix.values)
    }
  } else if (paginationSuffix) {
    originQuery.sql += paginationSuffix.sql
    originQuery.values = originQuery.values.concat(paginationSuffix.values)
  }

  return originQuery
}

function getArticleCount(sql, values, tagSuffix, cb) {
  let countSql
  if (tagSuffix) {
    countSql = `SELECT COUNT(*) AS count FROM (${(sql + tagSuffix.sql).replace(`GROUP_CONCAT(T.tag_name SEPARATOR ', ')`, `ARTICLEwithTAGS.tag_names`)}) AS tmp;`
    values = values.concat(tagSuffix.value)
  } else {
    countSql = `SELECT COUNT(*) AS count FROM (${sql.replace(`GROUP_CONCAT(T.tag_name SEPARATOR ', ')`, `ARTICLEwithTAGS.tag_names`)}) AS tmp;`
  }
  sendQuery(countSql, values, cb)
}

const articleModel = {
  add: (article, cb) => {
    // author_id, title, content, location, coordinate, altitude, length, departure_time, end_time, time_spent, cover_picture_url, gpx_url
    let coordinate

    if (article.coordinate) {
      coordinate = article.coordinate
      delete article.coordinate
    }

    const articlePropertyNames = Object.keys(article)
    let sql = `INSERT INTO articles(${articlePropertyNames.join(', ')})
                VALUES (${Array(articlePropertyNames.length).fill('?').join(', ')})`
    let values = Object.values(article)

    if ((coordinate?.x || coordinate?.x === 0) && (coordinate?.y || coordinate?.y === 0)) {
      sql = sql.replace(')', ', coordinate)').replace('?)', '?, ST_PointFromText("POINT(? ?)"))')
      values = values.concat([Number(coordinate.x), Number(coordinate.y)])
    }
    sql += ';'
    sendQuery(sql, values, cb)
  },

  findAll: (options, cb) => {
    let sql = `SELECT ARTICLEwithTAGS.*, U.nickname, U.icon_url AS user_icon
                  FROM (
                    SELECT A.*, GROUP_CONCAT(TA.tag_name SEPARATOR ', ') AS tag_names
                    FROM articles AS A 
                    LEFT JOIN article_tag_map AS TAM
                      ON (A.article_id = TAM.article_id)
                    LEFT JOIN tags AS TA
                      ON (TAM.tag_id = TA.tag_id)
                    WHERE A.is_deleted = 0
                    GROUP BY A.article_id
                  ) AS ARTICLEwithTAGS
              LEFT JOIN users AS U 
                ON ARTICLEwithTAGS.author_id = U.user_id
              WHERE ARTICLEwithTAGS.is_deleted = 0`
    let values = []

    if (options.search) {
      sql += ` AND title LIKE ?`
      values.push(`%${options?.search}%`)
    }

    sql += ` GROUP BY ARTICLEwithTAGS.article_id`

    const tagSuffix = getTagSearchingSuffix(options.tag)

    getArticleCount(sql, values, tagSuffix, (err, articleCount) => {
      if (err) return cb(err)

      const paginationSuffix = getArticlePaginationSuffix(options)
      const query = combineTagAndPaginationSuffix({ sql, values }, tagSuffix, paginationSuffix)

      sql = query.sql.replace(`GROUP_CONCAT(T.tag_name SEPARATOR ', ')`, `ARTICLEwithTAGS.tag_names`) + ';'
      values = query.values

      logger.debug(sql)
      db.query(sql, values, (err, result) => {
        if (err) cb(err)

        cb(null, { result, count: articleCount[0].count })
      })
    })
  },

  findByLikes: (options, cb) => {
    let sql = `SELECT A.*, GROUP_CONCAT(T.tag_name SEPARATOR ', ') AS tag_names, U.nickname, U.icon_url, count
                FROM (
                  SELECT article_id, COUNT(article_id) AS count
                    FROM likes
                    GROUP BY article_id
                    ORDER BY count DESC LIMIT 5
                    ) AS L
                LEFT JOIN articles AS A
                USING(article_id)
                LEFT JOIN article_tag_map AS M
                USING(article_id)
                LEFT JOIN tags AS T
                USING(tag_id)
                LEFT JOIN users AS U
                ON U.user_id = A.author_id
                WHERE A.is_deleted = 0
                GROUP BY A.article_id`
    let values = []

    const tagSuffix = getTagSearchingSuffix(options.tag)
    const paginationSuffix = getArticlePaginationSuffix(options)
    const query = combineTagAndPaginationSuffix({ sql, values }, tagSuffix, paginationSuffix)

    sql = query.sql + ';'
    values = query.values
    sendQuery(sql, values, cb)
  },

  findById: (articleId, cb) => {
    const sql = `SELECT C.count, ARTICLEwithTAGS.*, TR.title AS trail_title, U.nickname, U.icon_url
                  FROM (
                    SELECT A.*, GROUP_CONCAT(TA.tag_name SEPARATOR ', ') AS tag_names
                    FROM articles AS A
                    LEFT JOIN article_tag_map AS TAM
                      ON (A.article_id = TAM.article_id)
                    LEFT JOIN tags AS TA
                      ON (TAM.tag_id = TA.tag_id)
                    WHERE A.article_id = 1
                    AND A.is_deleted = 0
                    GROUP BY A.article_id
                  ) AS ARTICLEwithTAGS
                  LEFT JOIN article_trail_map AS TRM
                    USING(article_id)
                  LEFT JOIN trails AS TR
                    USING(trail_id)
                    LEFT JOIN (SELECT article_id, COUNT(article_id) AS count
								  FROM likes
								  GROUP BY article_id) AS C
				        	USING(article_id)
                  LEFT JOIN users AS U
                  ON U.user_id = ARTICLEwithTAGS.author_id
                  WHERE ARTICLEwithTAGS.article_id = ?
                  AND ARTICLEwithTAGS.is_deleted = 0;`
    const values = [articleId, articleId, 1]
    sendQuery(sql, values, cb)
  },

  update: (articleId, article, cb) => {
    if (Object.keys(article).length === 0) return cb(null, [])

    let values = []
    let sql = `UPDATE articles SET `
    const columnNames = Object.keys(article).filter((data) => data !== 'coordinate')

    values = Object.values(article).filter((data) => data !== article.coordinate)
    if (values.length > 0) sql += columnNames.join(' = ?, ') + ` = ? `

    if ((article.coordinate?.x || article.coordinate?.x === 0) && (article.coordinate?.y || article.coordinate?.y === 0)) {
      if (values !== 0) sql += ','
      sql += ` coordinate = ST_PointFromText("POINT(? ?)")`
      values = values.concat([Number(article.coordinate.x), Number(article.coordinate.y)])
    } else {
      if (columnNames.length === 0) return cb(null, 'nothing to update')
    }

    sql += ` WHERE article_id = ?;`
    values.push(articleId)

    sendQuery(sql, values, cb)
  },

  delete: (articleId, cb) => {
    const sql = `UPDATE articles SET is_deleted = ? WHERE article_id = ?`
    const values = [1, articleId]
    sendQuery(sql, values, cb)
  },

  findMessagesById: (articleId, options, cb) => {
    let sql = `SELECT * FROM messages as M 
                LEFT JOIN (SELECT user_id, nickname, icon_url FROM users) AS U 
                on M.author_id = U.user_id
                WHERE article_id = ?`
    let values = [articleId]
    if (options.limit) {
      if (options.cursor) {
        sql += ' AND message_id >= ? LIMIT ?'
        values.push(Number(options.cursor))
        values.push(Number(options.limit))
      } else if (options.offset || options.offset === 0) {
        sql += ' LIMIT ? OFFSET ?'
        values.push(Number(options.limit))
        values.push(Number(options.offset))
      } else {
        sql += ' LIMIT ?'
        values.push(Number(options.limit))
      }
    }
    sendQuery(sql, values, cb)
  },

  findByUserId: (userId, options, cb) => {
    if (options instanceof Function) {
      cb = options
      options = undefined
    }

    let sql = `SELECT A.*, GROUP_CONCAT(T.tag_name SEPARATOR ', ') AS tag_names
              FROM articles AS A
              LEFT JOIN article_tag_map AS M
              USING(article_id)
              LEFT JOIN tags AS T
              USING(tag_id)
              WHERE author_id = ?
              AND A.is_deleted = 0
              GROUP BY A.article_id`
    let values = [userId]

    const tagSuffix = getTagSearchingSuffix(options.tag)
    const paginationSuffix = getArticlePaginationSuffix(options)
    const query = combineTagAndPaginationSuffix({ sql, values }, tagSuffix, paginationSuffix)

    sql = query.sql + ';'
    values = query.values
    sendQuery(sql, values, cb)
  },

  findByUserLike: (userId, options, cb) => {
    if (options instanceof Function) {
      cb = options
      options = undefined
    }

    let sql = `SELECT U.nickname, U.icon_url, A.*, GROUP_CONCAT(T.tag_name SEPARATOR ', ') AS tag_names
              FROM likes AS L
              LEFT JOIN articles AS A
              USING(article_id)
              LEFT JOIN users AS U
              ON A.author_id = U.user_id
              LEFT JOIN article_tag_map AS M
              USING(article_id)
              LEFT JOIN tags AS T
              USING(tag_id)
              WHERE L.user_id = ?
              AND A.is_deleted = 0
              GROUP BY A.article_id`
    let values = [userId]

    const tagSuffix = getTagSearchingSuffix(options.tag)
    const paginationSuffix = getArticlePaginationSuffix(options)
    const query = combineTagAndPaginationSuffix({ sql, values }, tagSuffix, paginationSuffix)

    sql = query.sql + ';'
    values = query.values

    sendQuery(sql, values, cb)
  },

  createLikeAssociation: (userId, articleId, cb) => {
    const sql = `INSERT INTO likes(user_id, article_id)
                SELECT * FROM (SELECT ?, ?) as tmp
                WHERE NOT EXISTS (
                  SELECT user_id FROM likes
                  WHERE user_id = ? AND article_id = ?);`
    const values = [userId, articleId, userId, articleId]
    sendQuery(sql, values, cb)
  },

  deleteLikeAssociation: (userId, articleId, cb) => {
    const sql = `DELETE FROM likes
                WHERE user_id = ? AND article_id = ?;`
    const values = [userId, articleId]
    sendQuery(sql, values, cb)
  },

  addMessage: (articleId, authorId, content, cb) => {
    const sql = `INSERT INTO messages(author_id, content, article_id) VALUES (?, ?, ?)`
    const values = [authorId, content, articleId]
    sendQuery(sql, values, cb)
  },

  deleteMessage: (messageId, cb) => {
    const sql = `DELETE FROM messages WHERE message_id = ?`
    const values = [messageId]
    sendQuery(sql, values, cb)
  },

  updateMessage: (messageId, content, cb) => {
    const sql = `UPDATE messages SET content = ? WHERE message_id = ?`
    const values = [content, messageId]
    sendQuery(sql, values, cb)
  },

  findByTrailId: (trailId, options, cb) => {
    let sql = `SELECT GROUP_CONCAT(T.tag_name SEPARATOR ', ') AS tag_names, U.nickname AS author_name, U.icon_url, A.*
              FROM articles AS A
              LEFT JOIN article_trail_map AS M
              USING(article_id)
              LEFT JOIN users AS U
              ON U.user_id = A.author_id
              LEFT JOIN article_tag_map AS TM
              USING(article_id)
              LEFT JOIN tags AS T
              USING(tag_id)
              WHERE M.trail_id = ?
              GROUP BY A.article_id`
    const paginationSuffix = getArticlePaginationSuffix(options)
    const values = [trailId, ...paginationSuffix.values]

    if (/GROUP BY A.article_id/.test(paginationSuffix.sql)) sql = sql.replace('GROUP BY A.article_id', '')
    sql += paginationSuffix.sql + ';'
    sendQuery(sql, values, cb)
  },

  createTrailAssociation: (articleId, trailId, cb) => {
    const sql = `INSERT INTO article_trail_map(article_id, trail_id) VALUE (?, ?) `
    const values = [articleId, trailId]
    sendQuery(sql, values, cb)
  },

  cancelTrailAssociation: (articleId, trailId, cb) => {
    const sql = `DELETE FROM article_trail_map WHERE article_id = ? AND trail_id = ? `
    const values = [articleId, trailId]
    sendQuery(sql, values, cb)
  },

  getAuthorId: (articleId, cb) => {
    const sql = `SELECT author_id FROM articles WHERE article_id = ?`
    const values = [articleId]
    sendQuery(sql, values, cb)
  },

  getMessageAuthorId: (messageId, cb) => {
    const sql = `SELECT author_id FROM messages WHERE message_id = ?`
    const values = [messageId]
    sendQuery(sql, values, cb)
  },

  createTagAssociation: (articleId, tags, cb) => {
    getTagId(tags, (err, tagIdArray) => {
      if (err) return cb(err)
      if (tagIdArray.length === 0) return cb(null, [])

      const sql = `INSERT IGNORE INTO article_tag_map (article_id, tag_id)
                    VALUES ${Array(tagIdArray.length).fill('(?, ?)').join(', ')};`
      const values = tagIdArray.reduce((accu, curr) => accu.concat([articleId, curr.tag_id]), [])

      sendQuery(sql, values, cb)
    })
  },

  deleteTagAssociationNotInList: (articleId, tags, cb) => {
    getTagId(tags, (err, tagIdArray) => {
      if (err) return cb(err)

      let sql = `DELETE FROM article_tag_map
                    WHERE article_id = ?`
      const values = [articleId].concat(tagIdArray.map((obj) => obj.tag_id))

      if (tagIdArray.length > 0) sql += ` AND tag_id NOT IN (${Array(tagIdArray.length).fill('?').join(', ')})`

      sql += ';'
      sendQuery(sql, values, cb)
    })
  },

  findAllDeleted: (options, cb) => {
    let sql = `SELECT A.*, GROUP_CONCAT(T.tag_name SEPARATOR ', ') AS tag_names
                FROM articles AS A
                LEFT JOIN article_tag_map AS M
                USING(article_id)
                LEFT JOIN tags AS T
                USING(tag_id)
                WHERE A.is_deleted = 1`
    let values = []

    if (options.search) {
      sql += ` AND title LIKE ?`
      values.push(`%${options?.search}%`)
    }

    sql += ` GROUP BY A.article_id`

    const tagSuffix = getTagSearchingSuffix(options.tag)
    const paginationSuffix = getArticlePaginationSuffix(options)
    const query = combineTagAndPaginationSuffix({ sql, values }, tagSuffix, paginationSuffix)

    sql = query.sql + ';'
    values = query.values
    sendQuery(sql, values, cb)
  },

  recoverDeleted: (articleId, cb) => {
    const sql = `UPDATE articles SET is_deleted = ? WHERE article_id = ?`
    const values = [0, articleId]
    sendQuery(sql, values, cb)
  },
}

module.exports = articleModel
