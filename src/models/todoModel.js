const pool = require('../db')
const { generalLogger: logger } = require('../logger')

const todoModel = {
  getAll: async({ where }) => {
    let sql = `SELECT * FROM todos`
    const values = []

    if (where) {
      sql += ` WHERE ${Object.keys(where).join(' = ? AND ')} = ?`
      Object.values(where).forEach((value) => values.push(value))
    }

    sql += `;`
    logger.debug(sql)
    try {
      const [rows, fields] = await pool.query(sql, values)
      return rows
    } catch (err) {
      throw err
    }
  },

  create: async(todo) => {
    let sql = `INSERT INTO todos(${Object.keys(todo).join(', ')}) VALUES(?, ?, ?)`
    const values = []
    Object.values(todo).forEach((value) => values.push(value))

    try {
      const [rows, fields] = await pool.query(sql, values)
      return rows
    } catch (err) {
      throw err
    }
  }
}

module.exports = todoModel
