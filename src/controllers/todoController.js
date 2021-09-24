const todoModel = require('../models/todoModel')
const userModel = require('../models/userModel')
const { INVALID_INPUT, FORBIDDEN_ACTION } = require('../constants/errors')

async function checkTodoPermission({ tokenPayload, todo_id, user_id }) {
  const todoOwnerId = user_id || (await todoModel.getTodoOwner(todo_id))[0].user_id
  const authUserId = tokenPayload.user_id
  const authUserRole = tokenPayload.role

  if (authUserId !== todoOwnerId && authUserRole !== 'admin') return false
  return true
}

const todoController = {
  getTodos: async(req, res, next) => {
    let { user_id } = req.params

    try {
      const options = {
        where:{
          user_id
        }
      }
      const todos = await todoModel.getAll(options)
      res.json(todos)
    } catch (err) {
      next(err)
    }
  },

  postTodo: async(req, res, next) => {
    let { user_id } = req.params
    const { content, is_done } = req.body

    try {
      const { tokenPayload } = req.locals
      const isValid = await checkTodoPermission({ tokenPayload, user_id })
      if (!isValid) return res.status(403).json(FORBIDDEN_ACTION)

      const todo = {
        user_id,
        content,
        is_done
      }
      const result = await todoModel.create(todo)
      res.json(result)
    } catch (err) {
      next(err)
    }
  },

  updateTodo: async(req, res, next) => {
    const { user_id, todo_id } = req.params
    const { content, is_done } = req.body

    const int_done = parseInt(is_done, 10)
    if (int_done !== 0 && int_done !== 1) return res.status(400).json(INVALID_INPUT)

    const todo = {
      user_id,
      content,
      is_done
    }

    try {
      const { tokenPayload } = req.locals
      const isValid = await checkTodoPermission({ tokenPayload, todo_id })
      if (!isValid) return res.status(403).json(FORBIDDEN_ACTION)

      const result = await todoModel.update({ todo_id, todo })
      res.json(result)
    } catch (err) {
      next(err)
    }
  },

  // 權限檢查
  deleteTodo: async(req, res, next) => {
    const { user_id, todo_id } = req.params

    try {
      const { tokenPayload } = req.locals
      const isValid = await checkTodoPermission({ tokenPayload, todo_id })
      if (!isValid) return res.status(403).json(FORBIDDEN_ACTION)

      const result = await todoModel.delete({ todo_id, user_id })
      res.json(result)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = todoController
