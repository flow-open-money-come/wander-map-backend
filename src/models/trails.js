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
  findByUserId: async (userId, options) => {
    let sql = `SELECT * FROM trails WHERE author_id = ?`
    let values = [userId]

    const result = getPaginationAndFilterSuffix(options)
    sql += result.sql + ';'
    values = values.concat(result.values)

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

    const result = getPaginationAndFilterSuffix(options)
    sql += result.sql + ';'
    values = values.concat(result.values)

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
      logger.debug(result.sql)
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
      logger.debug(result.sql)
      const [rows, fields] = await pool.query(sql, values)
      return rows
    } catch (err) {
      throw err
    }
  },
}

module.exports = trailModel
