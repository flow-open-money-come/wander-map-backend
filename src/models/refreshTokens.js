const pool = require('../db').promise()
const { generalLogger: logger } = require('../logger')

const refreshTokenModel = {
  save: async (userId, token, expiredAt) => {
    const sql = `INSERT INTO refresh_tokens (user_id, refresh_token, expired_at) VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE refresh_token=?, expired_at=?;`
    const values = [userId, token, expiredAt, token, expiredAt]
    logger.debug(sql)
    try {
      const [rows, fields] = await pool.query(sql, values)
      return rows
    } catch (err) {
      throw err
    }
  },
  clear: async (token) => {
    const sql = `DELETE FROM refresh_tokens WHERE refresh_token = ?;`
    const values = [token]
    logger.debug(sql)
    try {
      const [rows, fields] = await pool.query(sql, values)
      return rows
    } catch (err) {
      throw err
    }
  },
  findByToken: async (token) => {
    const sql = `SELECT * FROM refresh_tokens WHERE refresh_token = ?;`
    const values = [token]
    logger.debug(sql)
    try {
      const [rows, fields] = await pool.query(sql, values)
      return rows
    } catch (err) {
      throw err
    }
  },
}

module.exports = refreshTokenModel
