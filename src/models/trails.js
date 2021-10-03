const pool = require('../db').promise()
const { generalLogger: logger } = require('../logger')

function getPaginationAndFilterSuffix(options) {
  function appendFilterSuffix(mode = 'AND', operator = '=', injectValues, columnName) {
    if (injectValues?.length > 0) {
      const clause = Array(injectValues.length).fill('?').join(` ${mode} ${columnName} ${operator} `)
      sql += ` AND (${columnName} ${operator} ${clause})`
      values = values.concat(injectValues)
    }
    return { sql, values }
  }

  let sql = ''
  let values = []
  const { cursor, offset, difficult, altitude, length, location, limit } = options
  if (cursor) {
    sql += ' AND trail_id >= ?'
    values.push(cursor)
  } else if (offset) {
    sql += ' AND trail_id >= (SELECT trail_id FROM trails LIMIT 1 OFFSET ?)'
    values.push(offset)
  }

  appendFilterSuffix('OR', '=', difficult, 'difficulty')
  appendFilterSuffix(
    'OR',
    'LIKE',
    location?.map((loc) => `%${loc}%`),
    'location'
  )
  appendFilterSuffix('AND', '>', altitude?.gt, 'altitude')
  appendFilterSuffix('AND', '<', altitude?.lt, 'altitude')
  appendFilterSuffix('AND', '>', length?.gt, 'length')
  appendFilterSuffix('AND', '<', length?.lt, 'length')

  if (limit) {
    sql += ' LIMIT ?'
    values.push(limit)
  }

  return { sql, values }
}

const trailModel = {
  findAll: async () => {
    const sql = `SELECT * FROM trails`
    try {
      const [rows, fields] = await pool.query(sql)
      return rows
    } catch (err) {
      throw err
    }
  },

  findOne: async (id) => {
    const sql = `SELECT * FROM trails WHERE trail_id = ?`

    try {
      const [rows, fields] = await pool.query(sql, id)
      return rows
    } catch (err) {
      throw err
    }
  },

  add: async (trailInfo) => {
    const sql = `INSERT INTO trails(author_id, title, description, location, altitude, length, situation, season, difficulty, coordinate, cover_picture_url, map_picture_url, required_time) VALUE (?, ?, ?, ?, ?, ?, ?, ?, ?, ST_PointFromText("POINT(? ?)"), ?, ?, ?)`
    try {
      const [rows, fields] = await pool.query(sql, [
        trailInfo.author_id,
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
        trailInfo.required_time
      ])
      return rows
    } catch (err) {
      throw err
    }
  },

  update: async (id, trailInfo) => {
    const sql = `UPDATE trails SET author_id = ?, title = ?, description = ?, 
      location = ?, altitude = ?,  length = ?, situation = ? , season = ? , difficulty = ?, coordinate = ST_PointFromText("POINT(? ?)"), cover_picture_url = ?, map_picture_url  = ? , required_time = ? 
      WHERE trail_id = ?`
    try {
      const [rows, fields] = await pool.query(sql, [
        trailInfo.author_id,
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
        trailInfo.required_time,
        id
      ])
      return rows
    } catch (err) {
      throw err
    }
  },

  delete: async (id) => {
    const sql = `UPDATE trails SET is_deleted = ? WHERE trail_id = ?`
    try {
      const [rows, fields] = await pool.query(sql, [1, id])
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
  }
}

module.exports = trailModel