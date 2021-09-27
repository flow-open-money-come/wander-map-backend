const pool = require('../db').promise()
const { generalLogger: logger } = require('../logger')

const todoModel = {
  getTodoOwner: async (todoId) => {
    const sql = `SELECT user_id FROM todos WHERE todo_id = ?;`

    try {
      logger.debug(sql)
      const [rows, fields] = await pool.query(sql, todoId)
      return rows
    } catch (err) {
      throw err
    }
  },

  getAll: async ({ where }) => {
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

  create: async (todo) => {
    let sql = `INSERT INTO todos(${Object.keys(todo).join(', ')}) VALUES(?, ?, ?)`
    const values = []
    Object.values(todo).forEach((value) => values.push(value))

    try {
      logger.debug(sql)
      const [rows, fields] = await pool.query(sql, values)
      return rows
    } catch (err) {
      throw err
    }
  },

  update: async ({ todoId, todo }) => {
    let sql = `UPDATE todos`
    const values = []

    sql += ` SET ${Object.keys(todo).join(' = ?, ')} = ?`
    Object.values(todo).forEach((value) => values.push(value))

    sql += ` WHERE todo_id = ? AND user_id = ?`
    values.push(todoId)
    values.push(todo.user_id)

    sql += ';'

    try {
      logger.debug(sql)
      const [rows, fields] = await pool.query(sql, values)
      return rows
    } catch (err) {
      throw err
    }
  },

  delete: async ({ todoId, userId }) => {
    const sql = `DELETE FROM todos WHERE todo_id = ? AND user_id = ?;`
    const values = [todoId, userId]

    try {
      logger.debug(sql)
      const [rows, fields] = await pool.query(sql, values)
      return rows
    } catch (err) {
      throw err
    }
  },
}

module.exports = todoModel
