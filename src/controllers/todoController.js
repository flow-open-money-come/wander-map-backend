const todoModel = require('../models/todoModel')
const userModel = require('../models/userModel')
const { INVALID_INPUT, FORBIDDEN_ACTION } = require('../constants/errors')

const todoController = {
  getTodos: async(req, res, next) => {
    let { user_id } = req.params

    try {
      const todos = await todoModel.getAll({ where: { user_id }})
      res.json(todos)
    } catch (err) {
      next(err)
    }
  },

  postTodo: async(req, res, next) => {
    let { user_id } = req.params
    const { content, is_done } = req.body

    try {
      const authUser = (await userModel.findOne({ where: { user_id: res.locals.tokenPayload.user_id } }))[0]
      if (authUser.user_id !== user_id && authUser.role !== 'admin') return res.status(403).json(FORBIDDEN_ACTION)

      const result = await todoModel.create({ user_id, content, is_done })
      res.json(result)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = todoController
