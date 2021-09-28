const pool = require('../db').promise()
const { generalLogger: logger } = require('../logger')

const trailModel = {
  findByUserId: async (userId) => {
    const sql = `SELECT * FROM trails WHERE author_id = ?;`
    const values = [userId]

    try {
      logger.debug(sql)
      const [rows, fields] = await pool.query(sql, values)
      return rows
    } catch (err) {
      throw err
    }
  },

  findByUserCollect: async (userId) => {
    const sql = `SELECT *
                FROM trails
                WHERE trail_id IN (
                  SELECT trail_id
                  FROM collects
                  WHERE user_id = ?);`
    const values = [userId]

    try {
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
      const [rows, fields] = await pool.query(sql, values)
      return rows
    } catch (err) {
      throw err
    }
  },
}

module.exports = trailModel
