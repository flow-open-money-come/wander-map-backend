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
    let sql = `SELECT A.*, GROUP_CONCAT(T.tag_name SEPARATOR ', ') AS tag_names
                FROM final_project_dev.articles AS A
                LEFT JOIN final_project_dev.article_tag_map AS M
                USING(article_id)
                LEFT JOIN final_project_dev.tags AS T
                USING(tag_id)
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

  findByLikes: (options, cb) => {
    let sql = `SELECT A.*, GROUP_CONCAT(T.tag_name SEPARATOR ', ') AS tag_names
                FROM (
                  SELECT article_id, COUNT(article_id) AS count
                    FROM final_project_dev.likes
                    GROUP BY article_id
                    ORDER BY count DESC LIMIT 5
                    ) AS L
                LEFT JOIN final_project_dev.articles AS A
                USING(article_id)
                LEFT JOIN final_project_dev.article_tag_map AS M
                USING(article_id)
                LEFT JOIN final_project_dev.tags AS T
                USING(tag_id)
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
    const sql = `SELECT A.*, GROUP_CONCAT(T.tag_name SEPARATOR ', ') AS tag_names
                FROM articles AS A
                LEFT JOIN article_tag_map AS M
                USING(article_id)
                LEFT JOIN tags AS T
                USING(tag_id)
                WHERE A.article_id = ?
                AND A.is_deleted = 0
                GROUP BY A.article_id`
    const values = [articleId]
    sendQuery(sql, values, cb)
  },

  update: (articleId, article, cb) => {
    if (Object.keys(article).length === 0) return cb(null, [])

    let values = []
    let sql = `UPDATE articles SET `
    const columnNames = Object.keys(article).filter((data) => data !== 'coordinate')

    sql += columnNames.join(' = ?, ') + ` = ? `
    values = Object.values(article).filter((data) => data !== article.coordinate)

    if ((article.coordinate?.x || article.coordinate?.x === 0) && (article.coordinate?.y || article.coordinate?.y === 0)) {
      sql += `, coordinate = ST_PointFromText("POINT(? ?)")`
      values = values.concat([Number(article.coordinate.x), Number(article.coordinate.y)])
    } else {
      if (columnNames.length === 0) return cb(null, 'nothing to update')
    }

    sql += `WHERE article_id = ?;`
    values.push(articleId)

    sendQuery(sql, values, cb)
  },

  delete: (articleId, cb) => {
    const sql = `UPDATE articles SET is_deleted = ? WHERE article_id = ?`
    const values = [1, articleId]
    sendQuery(sql, values, cb)
  },

  findMessagesById: (articleId, author, cb) => {
    const sql = `SELECT * FROM messages WHERE article_id = ? AND is_deleted = 0`
    const values = [articleId, author]
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

    let sql = `SELECT A.*, GROUP_CONCAT(T.tag_name SEPARATOR ', ') AS tag_names
              FROM likes AS L
              LEFT JOIN articles AS A
              USING(article_id)
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
                  WHERE user_id = ? AND article_id = ? AND is_deleted = 0);`
    const values = [userId, articleId, userId, articleId]
    sendQuery(sql, values, cb)
  },

  deleteLikeAssociation: (userId, articleId, cb) => {
    const sql = `DELETE FROM likes
                WHERE user_id = ? AND article_id = ?;`
    const values = [userId, articleId]
    sendQuery(sql, values, cb)
  },

  getAuthorId: (articleId, cb) => {
    const sql = `SELECT author_id FROM articles WHERE article_id = ?`
    const values = [articleId]
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

      if (tagIdArray.length > 0) sql += `AND tag_id NOT IN (${Array(tagIdArray.length).fill('?').join(', ')})`
      sql += ';'
      sendQuery(sql, values, cb)
    })
  },
}

module.exports = articleModel
