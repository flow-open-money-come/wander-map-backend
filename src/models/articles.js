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
    const sql = `INSERT INTO articles(author_id, title, content, 
        location, coordinate, altitude, length, departure_time, 
        end_time, time_spent, cover_picture_url, gpx_url)
      VALUES (?, ?, ?, ?, ST_PointFromText("POINT(? ?)"), ?, ?, ?, ?, ?, ?, ?)`
    const values = [
      article.author_id,
      article.title,
      article.content,
      article.location,
      Number(article.coordinateX),
      Number(article.coordinateY),
      article.altitude,
      article.length,
      article.departure_time,
      article.end_time,
      article.time_spent,
      article.cover_picture_url,
      article.gpx_url,
    ]
    sendQuery(sql, values, cb)
  },

  findAll: (cb) => {
    const sql = 'SELECT * FROM articles WHERE is_deleted = 0'
    sendQuery(sql, cb)
  },

  findByLikes: (cb) => {
    const sql =
      'SELECT article_id, COUNT (article_id) FROM likes GROUP BY article_id ORDER BY COUNT (article_id) DESC LIMIT 5'
    sendQuery(sql, cb)
  },

  findById: (id, cb) => {
    const sql = 'SELECT * FROM articles WHERE is_deleted = 0 AND article_id = ?'
    const values = [id]
    sendQuery(sql, values, cb)
  },

  update: (id, article, cb) => {
    let values = []
    let sql = `UPDATE articles SET `
    sql +=
      Object.keys(article)
        .filter((data) => (data !== 'coordinateX') & (data !== 'coordinateY'))
        .join(' = ?, ') + ` = ? `

    if (article.coordinateX && article.coordinateY) {
      sql +=
        `, coordinate = ST_pointfromtext("POINT(? ?)")` +
        ` WHERE article_id = ?`
      values = Object.values(article).filter(
        (data) => data !== article.coordinateX && data !== article.coordinateY
      )
      values.push(Number(article.coordinateX))
      values.push(Number(article.coordinateY))
      values.push(id)
    } else {
      sql += `WHERE article_id = ?`
      values = Object.values(article).filter(
        (data) => data !== article.coordinateX && data !== article.coordinateY
      )
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
    const sql = `SELECT * FROM messages WHERE article_id = ? AND author_id = ? AND is_deleted = 0`
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
}

module.exports = articleModel
