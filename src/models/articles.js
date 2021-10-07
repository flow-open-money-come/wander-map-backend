const db = require('../db')
const { generalLogger: logger } = require('../logger')

function sendQuery(sql, values, cb) {
  logger.debug(sql)
  db.query(sql, values, (err, results) => {
    if (err) return cb(err)
    cb(null, results)
  })
}

function getArticlePaginationSuffix(options) {
  let sql = ''
  const values = []

  if (options.search) {
    sql += ' AND title LIKE ?'
    values.push(`%${options.search}%`)
  }

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

    const coordinatePattern = /[ ]?coordinate[, ]?/
    if ((coordinate?.x || coordinate?.x) === 0 && (coordinate?.y || coordinate?.y === 0)) {
      sql = sql
        .replace(coordinatePattern, '')
        .replace(')', ', coordinate)')
        .replace('?)', '?, ST_PointFromText("POINT(? ?)"))')
      values = values.concat([Number(coordinate.x), Number(coordinate.y)])
    }
    sql += ';'
    sendQuery(sql, values, cb)
  },

  findAll: (options, cb) => {
    let sql = 'SELECT * FROM articles WHERE is_deleted = 0'

    let values = []
    const suffix = getArticlePaginationSuffix(options)
    sql += suffix.sql + ';'
    values = values.concat(suffix.values)

    sendQuery(sql, values, cb)
  },

  findByLikes: (cb) => {
    const sql = `SELECT A.*
                FROM (
                  SELECT article_id, COUNT(article_id) AS count
                    FROM final_project_dev.likes
                    GROUP BY article_id
                    ORDER BY count DESC LIMIT 5
                    ) AS L
                LEFT JOIN final_project_dev.articles AS A
                USING(article_id);`
    sendQuery(sql, cb)
  },

  findById: (id, cb) => {
    const sql = `SELECT A.*, M.trail_id, T.title AS trail_title
                  FROM articles AS A 
                  LEFT JOIN article_trail_map AS M
                    ON (A.article_id = M.article_id)
                  LEFT JOIN trails AS T
                    ON (M.trail_id = T.trail_id)
                  WHERE A.article_id = ? 
                  AND A.is_deleted = 0`
    const values = [id]
    sendQuery(sql, values, cb)
  },

  update: (id, article, cb) => {
    let values = []
    let sql = `UPDATE articles SET `
    sql +=
      Object.keys(article)
        .filter((data) => data !== 'coordinate')
        .join(' = ?, ') + ` = ? `
    values = Object.values(article).filter((data) => data !== article.coordinate)

    if (
      (article.coordinate?.x || article.coordinate?.x === 0) &&
      (article.coordinate?.y || article.coordinate?.y === 0)
    ) {
      sql += `, coordinate = ST_PointFromText("POINT(? ?)") WHERE article_id = ?`
      values = values.concat([Number(article.coordinate.x), Number(article.coordinate.y)])
      values.push(id)
    } else {
      sql += `WHERE article_id = ?`
      values.push(id)
    }

    sendQuery(sql, values, cb)
  },

  delete: (id, cb) => {
    const sql = `UPDATE articles SET is_deleted = ? WHERE article_id = ?`
    const values = [1, id]
    sendQuery(sql, values, cb)
  },

  findCommentsById: (id, author, cb) => {
    const sql = `SELECT * FROM messages WHERE article_id = ? AND is_deleted = 0`
    const values = [id, author]
    sendQuery(sql, values, cb)
  },

  findByUserId: (userId, options, cb) => {
    if (options instanceof Function) {
      cb = options
      options = undefined
    }

    let sql = `SELECT * FROM articles WHERE author_id = ?`
    let values = [userId]

    if (options.tag) {
      const tagNameClause = Array(options.tag.length).fill('?').join(' OR T.tag_name = ')
      sql = `SELECT A.*
            FROM articles AS A
            LEFT JOIN article_tag_map AS M
            USING(article_id)
            LEFT JOIN tags AS T
            USING(tag_id)
            WHERE A.author_id = ?
            AND (T.tag_name = ${tagNameClause})
            GROUP BY A.article_id`
      options.tag.forEach((value) => values.push(value))
    }

    const suffix = getArticlePaginationSuffix(options)
    if (/GROUP BY A.article_id/.test(suffix.sql)) sql = sql.replace('GROUP BY A.article_id', '')
    sql += suffix.sql + ';'
    values = values.concat(suffix.values)

    sendQuery(sql, values, cb)
  },

  findByUserLike: (userId, options, cb) => {
    if (options instanceof Function) {
      cb = options
      options = undefined
    }

    let sql = `SELECT A.*
              FROM likes AS L
              LEFT JOIN articles AS A
              USING(article_id)
              WHERE L.user_id = ?
              GROUP BY A.article_id`
    let values = [userId]

    if (options.tag) {
      const tagNameClause = Array(options.tag.length).fill('?').join(' OR T.tag_name = ')
      sql = sql.replace('WHERE L.user_id = ?', '').replace('GROUP BY A.article_id', '')
      sql += `LEFT JOIN article_tag_map AS M
              USING(article_id)
              LEFT JOIN tags AS T
              USING(tag_id)
              WHERE L.user_id = ?
              AND (T.tag_name = ${tagNameClause})
              GROUP BY A.article_id`
      options.tag.forEach((value) => values.push(value))
    }

    const suffix = getArticlePaginationSuffix(options)
    if (/GROUP BY A.article_id/.test(suffix.sql)) sql = sql.replace('GROUP BY A.article_id', '')
    sql += suffix.sql + ';'
    values = values.concat(suffix.values)

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

  findByTrailId: (trailId, cb) => {
    let sql = `SELECT A.*
               FROM articles AS A
               LEFT JOIN article_trail_map AS M
               USING(article_id)
               WHERE M.trail_id = ?`
    sendQuery(sql, trailId, cb)
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
  }
}

module.exports = articleModel
