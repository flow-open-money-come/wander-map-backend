const db = require('../db')

const articleModel = {
  add: (article, cb) => {
    db.query(
      `INSERT INTO test.articles(author_id, title, content, 
        location, coordinate, altitude, length, departure_time, 
        end_time, time_spent, cover_picture_url, gpx_url)
      VALUES (?, ?, ?, ?, ST_PointFromText("POINT(? ?)"), ?, ?, ?, ?, ?, ?, ?)`,
      [
        article.author, article.title, article.content, article.location,
        Number(article.coordinateX), Number(article.coordinateY), article.altitude, article.length, article.departure_time,
        article.end_time, article.time_spent, article.cover_picture, article.gpx
      ],
      (err, results) => {
        if (err) return cb(err)
        cb(null, results)
      }
    )
  },

  findAll: (cb) => {
    db.query(
      'SELECT * FROM test.articles',
      (err, results) => { 
        if (err) return cb(err);
        cb(null, results)
      }
    )
  },

  findByViews: (cb) => {
    db.query(
      'SELECT * FROM test.articles ORDER BY views DESC LIMIT 5',
      (err, results) => {
        if (err) return cb(err)
        cb(null, results)
      }
    )
  },

  findById: (id, cb) => {
    db.query(
      'SELECT * FROM test.articles WHERE article_id = ?',
      [id],
      (err, results) => {
        if (err) return cb(err)
        cb(null, results)
      }
    )
  },

  update: (id, article, cb) => {
    db.query(
      `UPDATE test.articles SET author_id = ?, title = ?, content = ?, 
      location = ?, coordinate = ST_pointfromtext("POINT(? ?)"), altitude = ?, length = ?, departure_time = ?, 
      end_time = ?, time_spent = ?, cover_picture_url = ?, gpx_url  = ?
      WHERE article_id = ?`,
      [
        article.author, article.title, article.content, article.location,
        Number(article.coordinateX), Number(article.coordinateY), article.altitude, article.length, article.departure_time,
        article.end_time, article.time_spent, article.cover_picture, article.gpx, id
      ],
      (err, results) => {
        if (err) return cb(err)
        cb(null, results)
      }
    )
  },

  delete: (id, cb) => {
    db.query(
      `UPDATE test.articles SET is_deleted = ? WHERE article_id = ?`,
      [1, id],
      (err, results) => {
        if (err) return cb(err)
        cb(null, results)
      }
    )
  },

  findCommentsById: (id, author, cb) => {
    db.query(
      `SELECT * FROM test.messages WHERE article_id = ? AND author_id = ?`,
      [id, author],
      (err, results) => {
        if (err) return cb(err)
        cb(null, results)
      }
    )
  }
}

module.exports = articleModel