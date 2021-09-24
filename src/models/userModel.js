const pool = require('../db')
const { generalLogger: logger } = require('../logger')

const userModel = {
  create: async({ nickname, email, hash }) => {
    try {
      const sql = 'INSERT INTO users(nickname, email, password) VALUES(?, ?, ?);'
      logger.debug(sql)
      const [rows, fields] = await pool.query(sql, [nickname, email, hash])
      return rows
    } catch (err) {
      throw err
    }
  },

  findOne: async({ columns = '*', where }) => {
    let sql = `SELECT ${columns} FROM users`
    const values = []

    if (where) {
      const whereClause = ` WHERE ${Object.keys(where).join(' = ? AND ')} = ?;`
      sql += whereClause
      values.push(Object.values(where))
    }

    logger.debug(sql)

    try {
      const [rows, fields] = await pool.query(sql, values)
      return rows
    } catch (err) {
      throw err
    }
  },

  findAll: async({ columns = '*', where = false, limit, offset, cursor }) => {
    let sql = `SELECT ${columns} FROM users`
    const values = []
    let usePagination = false

    if (limit) {
      if(cursor || cursor === 0) {
        usePagination = true
        const paginationClause = ` WHERE user_id >= ? ORDER BY user_id LIMIT ?`
        sql += paginationClause;
        [cursor, limit].forEach((value) => values.push(value))
      } else if (offset || offset === 0) {
        usePagination = true
        const paginationClause = ` WHERE user_id >= (
                                    SELECT user_id 
                                    FROM users 
                                    ORDER BY user_id 
                                    LIMIT 1 OFFSET ?) 
                                  ORDER BY user_id LIMIT ?`
        sql += paginationClause;
        [offset, limit].forEach((value) => values.push(value))
      }
    }

    if (where) { // todo: 實作 gt、lt、eq && OR、AND
      let clauseBegin = 'WHERE'
      let limit = null

      if (usePagination) {
        clauseBegin = 'AND'
        sql = sql.replace(' ORDER BY user_id LIMIT ?', '')
        limit = values.pop()
      }

      const whereClause = ` ${clauseBegin} ${Object.keys(where).join(' = ? AND ')} = ?`
      sql += whereClause
      Object.values(where).forEach((value) => values.push(value))

      if (limit) {
        sql += ' ORDER BY user_id LIMIT ?'
        values.push(limit)
      }
    }

    sql += ';'
    logger.debug(sql)
    try {
      const [rows, fields] = await pool.query(sql, values)
      return rows
    } catch (err) {
      throw err
    }
  },

  updateUser: async({ user_id, columns }) => {
    const values = []
    let sql = `UPDATE users`

    sql += ` SET ${Object.keys(columns).join(' = ?, ')} = ?`
    Object.values(columns).forEach((value) => values.push(value))

    sql += ` WHERE user_id = ?;`
    values.push(user_id)

    logger.debug(sql)
    try {
      const [rows, fields] = await pool.query(sql, values)
      return rows
    } catch (err) {
      throw err
    }
  }
}

module.exports = userModel