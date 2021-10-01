const db = require('../db')
const { generalLogger: logger } = require('../logger')

function sendQuery(sql, values, cb) {
  logger.debug(sql)
  db.query(sql, values, (err, results) => {
    if (err) return cb(err)
    cb(null, results)
  })
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

  findByUserId: (userId, cb) => {
    const sql = `SELECT * FROM articles WHERE author_id = ?`
    const values = [userId]
    sendQuery(sql, values, cb)
  },

  findByUserLike: (userId, cb) => {
    const sql = `SELECT * 
                FROM articles 
                WHERE article_id IN (
                  SELECT article_id 
                  FROM likes 
                  WHERE user_id = ?);`
    const values = [userId]
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
