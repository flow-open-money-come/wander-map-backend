const pool = require('../db')
const { generalLogger } = require('../logger')

const userModel = {
  create: async({ nickname, email, hash }) => {
    try {
      const sql = 'INSERT INTO users(nickname, email, password) VALUES(?, ?, ?);'
      generalLogger.info(sql)
      const [rows, fields] = await pool.execute(sql, [nickname, email, hash])
      return rows
    } catch (err) {
      // 資料庫連線錯誤?
    }
  },

  findByEmail: async(email) => {
    try {
      const sql = 'SELECT * FROM users WHERE email = ?;'
      generalLogger.info(sql)
      const [rows, fields] = await pool.execute(sql, [email])
      return rows
    } catch (err) {

    }
  },
}

module.exports = userModel
