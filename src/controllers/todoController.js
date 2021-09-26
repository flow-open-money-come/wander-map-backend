const todoModel = require('../models/todoModel')
const { FORBIDDEN_ACTION } = require('../constants/errors')

async function checkTodoPermission({ tokenPayload, todo_id, user_id }) {
  const todoOwnerId = user_id || (await todoModel.getTodoOwner(todo_id))[0].user_id

  if (tokenPayload.user_id !== todoOwnerId && tokenPayload.role !== 'admin') return false
  return true
}

const todoController = {
  getTodos: async (req, res, next) => {
    let { user_id } = req.params

    try {
      const { tokenPayload } = res.locals
      const isValid = await checkTodoPermission({ tokenPayload, user_id })
      if (!isValid) return res.status(403).json(FORBIDDEN_ACTION)

      const options = {
        where: {
          user_id,
        },
      }
      const todos = await todoModel.getAll(options)
      res.json({
        success: true,
        message: 'OK',
        data: { todos },
      })
    } catch (err) {
      next(err)
    }
  },

  postTodo: async (req, res, next) => {
    let { user_id } = req.params
    const { content, is_done } = req.body

    try {
      const { tokenPayload } = res.locals
      const isValid = await checkTodoPermission({ tokenPayload, user_id })
      if (!isValid) return res.status(403).json(FORBIDDEN_ACTION)

      const todo = {
        user_id,
        content,
        is_done,
      }
      const result = await todoModel.create(todo)
      res.json({
        success: true,
        message: 'created',
        data: { result },
      })
    } catch (err) {
      next(err)
    }
  },

  updateTodo: async (req, res, next) => {
    const { user_id, todo_id } = req.params
    const { content, is_done } = req.body

    const todo = {
      user_id,
      content,
      is_done,
    }

    for (let column in todo) {
      if (!column && column !== 0) delete todo[column]
    }

    if (Object.keys(todo).length <= 1) {
      return res.json({
        success: true,
        message: 'updated',
        data: {},
      })
    }

    try {
      const { tokenPayload } = res.locals
      const isValid = await checkTodoPermission({ tokenPayload, todo_id })
      if (!isValid) return res.status(403).json(FORBIDDEN_ACTION)

      const result = await todoModel.update({ todo_id, todo })
      res.json({
        success: true,
        message: 'updated',
        data: { result },
      })
    } catch (err) {
      next(err)
    }
  },

  deleteTodo: async (req, res, next) => {
    const { user_id, todo_id } = req.params

    try {
      const { tokenPayload } = res.locals
      const isValid = await checkTodoPermission({ tokenPayload, todo_id })
      if (!isValid) return res.status(403).json(FORBIDDEN_ACTION)

      const result = await todoModel.delete({ todo_id, user_id })
      res.json({
        success: true,
        message: 'deleted',
        data: { result },
      })
    } catch (err) {
      next(err)
    }
  },
}

module.exports = todoController
