const pool = require('../db').promise()
const { generalLogger: logger } = require('../logger')

function appendFilterSuffix(mode = 'AND', injectValues, columnName, { sql, values }) {
  let clause = ''
  for (let literalOperator in injectValues) {
    if (!injectValues[literalOperator] && injectValues[literalOperator] !== 0) continue
    let operator
    switch (literalOperator) {
      case 'like':
        operator = 'LIKE'
        break
      case 'eq':
        operator = '='
        break
      case 'gt':
        operator = '>'
        break
      case 'lt':
        operator = '<'
        break
      default:
        return
    }
    if (clause.length > 0) clause += ` ${mode} `
    clause += `${columnName} ${operator} `
    clause += Array(injectValues[literalOperator].length).fill('?').join(` ${mode} ${columnName} ${operator} `)
    values = values.concat(injectValues[literalOperator])
  }
  if (clause.length > 0) sql += ` AND (${clause})`
  return { sql, values }
}

function getPaginationAndFilterSuffix(options) {
  let sql = ''
  let values = []
  const { cursor, offset, difficult, altitude, length, location, limit, search } = options
  if (cursor) {
    sql += ' AND trail_id >= ?'
    values.push(cursor)
  } else if (offset) {
    sql += ' AND trail_id >= (SELECT trail_id FROM trails LIMIT 1 OFFSET ?)'
    values.push(offset)
  }

  let suffix = appendFilterSuffix('OR', { eq: difficult }, 'difficulty', { sql, values })
  suffix = appendFilterSuffix('OR', { like: location?.map((loc) => `%${loc}%`) }, 'location', suffix)
  suffix = appendFilterSuffix('OR', altitude, 'altitude', suffix)
  suffix = appendFilterSuffix('OR', length, 'length', suffix)

  if (search) {
    suffix.sql += ' AND title LIKE ?'
    suffix.values.push(`%${search}%`)
  }

  if (limit) {
    suffix.sql += ' LIMIT ?'
    suffix.values.push(limit)
  }

  return suffix
}

const trailModel = {
  findAll: async (options) => {
    const sql = `SELECT * FROM trails WHERE is_deleted = 0`
    const values = []

    const suffix = getPaginationAndFilterSuffix(options)
    const findAllSql = sql + suffix.sql + ';'
    const findAllValues = values.concat(suffix.values)

    for (prop of ['limit', 'offset', 'cursor']) {
      delete options[prop]
    }

    delete options.cursor
    delete options.limit
    delete options.offset
    const countSuffix = getPaginationAndFilterSuffix(options)
    const countSql = `SELECT COUNT(*) AS count FROM (${sql + countSuffix.sql}) AS tmp;`
    const countValues = values.concat(countSuffix.values)

    try {
      logger.debug(findAllSql)
      const [rows, findAllFields] = await pool.query(findAllSql, findAllValues)

      logger.debug(countSql)
      const [count, countFields] = await pool.query(countSql, countValues)

      return { result: rows, count: count[0]['count'] }
    } catch (err) {
      throw err
    }
  },

  findById: async (id) => {
    const sql = 'SELECT * FROM trails WHERE trail_id = ? AND is_deleted = 0'
    logger.debug(sql)
    try {
      const [rows, fields] = await pool.query(sql, id)
      return rows
    } catch (err) {
      throw err
    }
  },

  add: async (trailInfo, authorId) => {
    const sql = `INSERT INTO trails(author_id, title, description, location, altitude, length, situation, season, difficulty, coordinate, cover_picture_url, map_picture_url) VALUE (?, ?, ?, ?, ?, ?, ?, ?, ?, ST_PointFromText("POINT(? ?)"), ?, ?)`
    logger.debug(sql)
    try {
      const [rows, fields] = await pool.query(sql, [
        authorId,
        trailInfo.title,
        trailInfo.description,
        trailInfo.location,
        trailInfo.altitude,
        trailInfo.length,
        trailInfo.situation,
        trailInfo.season,
        trailInfo.difficulty,
        Number(trailInfo.coordinateX),
        Number(trailInfo.coordinateY),
        trailInfo.cover_picture_url,
        trailInfo.map_picture_url,
      ])
      return rows
    } catch (err) {
      throw err
    }
  },

  update: async (id, trailInfo, authorId) => {
    const sql = `UPDATE trails SET author_id = ?, title = ?, description = ?, 
      location = ?, altitude = ?,  length = ?, situation = ? , season = ? , difficulty = ?, coordinate = ST_PointFromText("POINT(? ?)"), cover_picture_url = ?, map_picture_url  = ?
      WHERE trail_id = ?`
    logger.debug(sql)
    try {
      const [rows, fields] = await pool.query(sql, [
        authorId,
        trailInfo.title,
        trailInfo.description,
        trailInfo.location,
        trailInfo.altitude,
        trailInfo.length,
        trailInfo.situation,
        trailInfo.season,
        trailInfo.difficulty,
        Number(trailInfo.coordinateX),
        Number(trailInfo.coordinateY),
        trailInfo.cover_picture_url,
        trailInfo.map_picture_url,
        id,
      ])
      return rows
    } catch (err) {
      throw err
    }
  },

  delete: async (id) => {
    const sql = `UPDATE trails SET is_deleted = ? WHERE trail_id = ?`
    logger.debug(sql)
    try {
      const [rows, fields] = await pool.query(sql, [1, id])
      return rows
    } catch (err) {
      throw err
    }
  },

  findByCollects: async (topAmount) => {
    const sql = `SELECT T.*
                FROM (
                  SELECT trail_id, COUNT(trail_id) AS count
                    FROM collects
                    GROUP BY trail_id
                    ORDER BY count DESC LIMIT ?
                    ) AS L
                LEFT JOIN trails AS T
                USING(trail_id);`
    logger.debug(sql)
    try {
      const [rows, fields] = await pool.query(sql, topAmount)
      return rows
    } catch (err) {
      throw err
    }
  },

  findCommentsByTrailId: async (id) => {
    const sql = `SELECT * FROM comments AS C 
                 LEFT JOIN (SELECT user_id, nickname, icon_url FROM users)AS U 
                 on C.author_id = U.user_id 
                 WHERE trail_id = ?`
    logger.debug(sql)
    try {
      const [rows, fields] = await pool.query(sql, id)
      return rows
    } catch (err) {
      throw err
    }
  },

  addCommentByTrailId: async (trailId, comment) => {
    const sql = `INSERT INTO comments(trail_id, author_id, content) VALUE (?, ?, ?)`
    logger.debug(sql)
    try {
      const [rows, fields] = await pool.query(sql, [trailId, comment.author_id, comment.content])
      return rows
    } catch (err) {
      throw err
    }
  },

  updateCommentByCommentId: async (commentId, comment) => {
    const sql = `UPDATE comments SET content = ? WHERE comment_id =?`
    logger.debug(sql)
    try {
      const [rows, fields] = await pool.query(sql, [comment.content, commentId])
      return rows
    } catch (err) {
      throw err
    }
  },

  deleteCommentByCommentId: async (commentId) => {
    const sql = `DELETE FROM comments WHERE comment_id = ?`
    logger.debug(sql)
    try {
      const [rows, fields] = await pool.query(sql, commentId)
      return rows
    } catch (err) {
      throw err
    }
  },

  findByUserId: async (userId, options) => {
    let sql = `SELECT * FROM trails WHERE author_id = ?`
    let values = [userId]

    const suffix = getPaginationAndFilterSuffix(options)
    sql += suffix.sql + ';'
    values = values.concat(suffix.values)

    try {
      logger.debug(sql)
      const [rows, fields] = await pool.query(sql, values)
      return rows
    } catch (err) {
      throw err
    }
  },

  findByUserCollect: async (userId, options) => {
    let sql = `SELECT *
                FROM trails
                WHERE trail_id IN (
                  SELECT trail_id
                  FROM collects
                  WHERE user_id = ?)`
    let values = [userId]

    const suffix = getPaginationAndFilterSuffix(options)
    sql += suffix.sql + ';'
    values = values.concat(suffix.values)

    try {
      logger.debug(sql)
      const [rows, fields] = await pool.query(sql, values)
      return rows
    } catch (err) {
      throw err
    }
  },

  createCollectAssociation: async (userId, trailId) => {
    const sql = `INSERT INTO collects (user_id, trail_id)
                SELECT * FROM (SELECT ?, ?) AS tmp
                WHERE NOT EXISTS(
                  SELECT user_id FROM collects
                  WHERE user_id = ? AND trail_id = ?);`
    const values = [userId, trailId, userId, trailId]

    try {
      logger.debug(sql)
      const [rows, fields] = await pool.query(sql, values)
      return rows
    } catch (err) {
      throw err
    }
  },

  deleteCollectAssociation: async (userId, trailId) => {
    const sql = `DELETE FROM collects
                WHERE user_id = ? AND trail_id = ?;`
    const values = [userId, trailId]

    try {
      logger.debug(sql)
      const [rows, fields] = await pool.query(sql, values)
      return rows
    } catch (err) {
      throw err
    }
  },

  findAllDeleted: async (options) => {
    let sql = `SELECT * FROM trails WHERE is_deleted = 1`
    let values = []

    const suffix = getPaginationAndFilterSuffix(options)
    sql += suffix.sql + ';'
    values = values.concat(suffix.values)
    logger.debug(sql)
    try {
      const [rows, fields] = await pool.query(sql, values)
      return rows
    } catch (err) {
      throw err
    }
  },

  recoverDeleted: async (id) => {
    const sql = `UPDATE trails SET is_deleted = ? WHERE trail_id = ?`
    logger.debug(sql)
    try {
      const [rows, fields] = await pool.query(sql, [0, id])
      return rows
    } catch (err) {
      throw err
    }
  },
}

module.exports = trailModel
