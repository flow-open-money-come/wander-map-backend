const todoModel = require('../models/todos')
const { FORBIDDEN_ACTION } = require('../constants/errors')
const { getPermissionLevel } = require('../utils')

async function checkTodoPermission({ tokenPayload, todoId, userId }) {
  const todoOwnerId = userId || (await todoModel.getTodoOwner(todoId))[0]?.user_id
  if (!todoOwnerId) throw new Error('cannot find todo')

  if (getPermissionLevel(tokenPayload, todoOwnerId) < 2) return false
  return true
}

const todoController = {
  getTodos: async (req, res, next) => {
    let { userId } = req.params

    try {
      const { tokenPayload } = res.locals
      const isValid = await checkTodoPermission({ tokenPayload, userId })
      if (!isValid) return res.status(403).json(FORBIDDEN_ACTION)

      const options = {
        where: {
          user_id: userId,
        },
      }
      const todos = await todoModel.getAll(options)
      res.json({
        success: true,
        message: 'get todos',
        data: { todos },
      })
    } catch (err) {
      if (err.message === 'cannot find todo')
        res.status(404).json({
          success: false,
          message: 'todo not found',
          data: {},
        })
      next(err)
    }
  },

  postTodo: async (req, res, next) => {
    let { userId } = req.params
    const { content, isDone } = req.body

    try {
      const { tokenPayload } = res.locals
      const isValid = await checkTodoPermission({ tokenPayload, userId })
      if (!isValid) return res.status(403).json(FORBIDDEN_ACTION)

      const todo = {
        user_id: userId,
        content,
      }
      if (isDone) todo.is_done = isDone

      const result = await todoModel.create(todo)
      res.json({
        success: true,
        message: 'created',
        data: { result },
      })
    } catch (err) {
      if (err.message === 'cannot find todo')
        res.status(404).json({
          success: false,
          message: 'todo not found',
          data: {},
        })
      next(err)
    }
  },

  updateTodo: async (req, res, next) => {
    const { userId, todoId } = req.params
    const { content, isDone } = req.body

    const todo = {
      user_id: userId,
      content,
      is_done: isDone,
    }

    for (let column in todo) {
      if (!todo[column] && todo[column] !== 0) delete todo[column]
    }

    if (Object.keys(todo).length <= 1) {
      return res.json({
        success: true,
        message: 'nothing to update',
        data: {},
      })
    }

    try {
      const { tokenPayload } = res.locals
      const isValid = await checkTodoPermission({ tokenPayload, todoId })
      if (!isValid) return res.status(403).json(FORBIDDEN_ACTION)

      const result = await todoModel.update({ todoId, todo })
      res.json({
        success: true,
        message: 'updated',
        data: { result },
      })
    } catch (err) {
      if (err.message === 'cannot find todo')
        res.status(404).json({
          success: false,
          message: 'todo not found',
          data: {},
        })
      next(err)
    }
  },

  deleteTodo: async (req, res, next) => {
    const { userId, todoId } = req.params

    try {
      const { tokenPayload } = res.locals
      const isValid = await checkTodoPermission({ tokenPayload, todoId })
      if (!isValid) return res.status(403).json(FORBIDDEN_ACTION)

      const result = await todoModel.delete({ todoId, userId })
      res.json({
        success: true,
        message: 'deleted',
        data: { result },
      })
    } catch (err) {
      if (err.message === 'cannot find todo')
        res.status(404).json({
          success: false,
          message: 'todo not found',
          data: {},
        })
      next(err)
    }
  },
}

module.exports = todoController
