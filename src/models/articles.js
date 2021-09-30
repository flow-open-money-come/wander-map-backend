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
    db.query(
      `INSERT INTO articles(author_id, title, content, 
        location, coordinate, altitude, length, departure_time, 
        end_time, time_spent, cover_picture_url, gpx_url)
      VALUES (?, ?, ?, ?, ST_PointFromText("POINT(? ?)"), ?, ?, ?, ?, ?, ?, ?)`,
      [article.author, article.title, article.content, article.location, Number(article.coordinateX), Number(article.coordinateY), article.altitude, article.length, article.departure_time, article.end_time, article.time_spent, article.cover_picture, article.gpx],
      (err, results) => {
        if (err) return cb(err)
        cb(null, results)
      }
    )
  },

  findAll: (cb) => {
    db.query('SELECT * FROM articles', (err, results) => {
      if (err) return cb(err)
      cb(null, results)
    })
  },

  findByViews: (cb) => {
    db.query('SELECT * FROM articles ORDER BY views DESC LIMIT 5', (err, results) => {
      if (err) return cb(err)
      cb(null, results)
    })
  },

  findById: (id, cb) => {
    db.query('SELECT * FROM articles WHERE article_id = ?', [id], (err, results) => {
      if (err) return cb(err)
      cb(null, results)
    })
  },

  update: (id, article, cb) => {
    db.query(
      `UPDATE articles SET author_id = ?, title = ?, content = ?, 
      location = ?, coordinate = ST_pointfromtext("POINT(? ?)"), altitude = ?, length = ?, departure_time = ?, 
      end_time = ?, time_spent = ?, cover_picture_url = ?, gpx_url  = ?
      WHERE article_id = ?`,
      [article.author, article.title, article.content, article.location, Number(article.coordinateX), Number(article.coordinateY), article.altitude, article.length, article.departure_time, article.end_time, article.time_spent, article.cover_picture, article.gpx, id],
      (err, results) => {
        if (err) return cb(err)
        cb(null, results)
      }
    )
  },

  delete: (id, cb) => {
    db.query(`UPDATE articles SET is_deleted = ? WHERE article_id = ?`, [1, id], (err, results) => {
      if (err) return cb(err)
      cb(null, results)
    })
  },

  findCommentsById: (id, author, cb) => {
    db.query(`SELECT * FROM messages WHERE article_id = ? AND author_id = ?`, [id, author], (err, results) => {
      if (err) return cb(err)
      cb(null, results)
    })
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
