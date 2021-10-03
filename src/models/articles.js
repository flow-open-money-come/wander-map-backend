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
