const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { generalLogger: logger } = require('../logger')
const userModel = require('../models/userModel')
const { INVALID_INPUT, UNAUTHORIZED, FORBIDDEN_ACTION, DUPLICATE_EMAIL } = require('../constants/errors')

const saltRounds = 10
const tokenSecret = process.env.JWT_TOKEN_SECRET

async function getPermissionRole({ tokenPayload, user_id }) {
  const authUser = (await userModel.findOne({ where: { user_id: tokenPayload.user_id } }))[0]
  if (authUser.user_id !== user_id && authUser.role !== 'admin') return false
  return true
}

const userController = {
  // 還有什麼輸入限制？
  // 密碼長度與組合
  // 檢查 email 格式 => 用 middleware
  register: async (req, res, next) => {
    const { nickname, email, password, confirmPassword } = req.body
    const isNull = Object.values({ nickname, email, password, confirmPassword }).some((value) => !value && value !== 0)
    if (isNull || password !== confirmPassword) return res.status(400).json(INVALID_INPUT)

    try {
      let users = await userModel.findOne({ where: { email } })
      if (users.length !== 0) return res.status(200).json(DUPLICATE_EMAIL)

      const hash = await bcrypt.hash(password, saltRounds)
      result = await userModel.create({
        nickname,
        email,
        hash,
      })

      users = await userModel.findOne({ where: { user_id: result.insertId } })
      const { user_id, icon_url, role, updated_at, created_at } = users[0]
      const token = jwt.sign(
        {
          user_id,
          nickname,
          email,
          icon_url,
          role,
          updated_at,
          created_at,
        },
        tokenSecret,
        { expiresIn: '30d' }
      )

      res.status(201).json({
        success: true,
        message: 'registration success',
        data: { token },
      })
    } catch (err) {
      next(err)
    }
  },

  login: async (req, res, next) => {
    const { email, password } = req.body
    const isNull = Object.values({ email, password }).some((value) => !value && value !== 0)
    if (isNull) return res.status(400).json(INVALID_INPUT)

    try {
      const users = await userModel.findOne({ where: { email } })
      if (users.length === 0) return res.status(401).json(UNAUTHORIZED)
      const { user_id, nickname, password: hash, icon_url, role, updated_at, created_at } = users[0]
      const isValid = await bcrypt.compare(password, hash)

      if (!isValid) return res.status(401).json(UNAUTHORIZED)
      const token = jwt.sign(
        {
          user_id,
          nickname,
          email,
          icon_url,
          role,
          updated_at,
          created_at,
        },
        tokenSecret,
        { expiresIn: '30d' }
      )

      res.json({
        success: true,
        message: 'logged in',
        data: { token },
      })
    } catch (err) {
      next(err)
    }
  },

  getUsers: async (req, res, next) => {
    const options = {}
    const needInteger = ['limit', 'offset', 'cursor']

    for (let i = 0; i < needInteger.length; i++) {
      const parsed = parseInt(req.query[needInteger[i]], 10) // req.query 拿出來是 string
      options[needInteger[i]] = Number.isInteger(parsed) ? parsed : null // parseInt 可能會 return NaN
    }

    options.limit = options.limit ?? 20
    options.limit = options.limit > 200 ? 200 : options.limit
    options.columns = 'user_id, nickname, email, icon_url, role, updated_at, created_at'

    try {
      const users = await userModel.findAll(options)
      res.json({
        success: true,
        message: 'user data',
        data: {
          users,
        },
      })
    } catch (err) {
      if (err.errno === 1054) {
        // 輸入的 column 名稱在資料庫找不到
        logger.warn(err)
        return res.status(400).json({
          success: false,
          message: 'Unknown column',
          data: {},
        })
      }
      next(err)
    }
  },

  getUser: async (req, res, next) => {
    const { user_id } = req.params

    try {
      const options = {
        where: { user_id },
        columns: 'user_id, nickname, email, icon_url, role, updated_at, created_at',
      }
      const user = await userModel.findOne(options)
      res.json({
        success: true,
        message: 'get user data',
        data: user[0],
      })
    } catch (err) {
      next(err)
    }
  },

  editUser: async (req, res, next) => {
    const { user_id } = req.params
    // 檢查密碼格式
    let { nickname, icon_url, password, confirmPassword, role } = req.body
    if (password !== confirmPassword) return res.status(400).json(INVALID_INPUT)

    try {
      const authRole = await getPermissionRole({ tokenPayload: res.locals.tokenPayload, user_id })
      if (!authRole) return res.status(403).json(FORBIDDEN_ACTION)

      const columns = { nickname, icon_url, password }
      if (authRole === 'admin') {
        const validValues = ['admin', 'member', 'suspended', 1, 2, 3]
        if (!validValues.includes(role)) return res.json(400).json(INVALID_INPUT)
        columns.role = role
      }
      for (let column in columns) {
        if (!columns[column]) delete columns[column]
      }

      await userModel.updateUser({ user_id, columns })
      res.json({
        success: true,
        message: `user_id: ${user_id} is updated`,
        data: {},
      })
    } catch (err) {
      next(err)
    }
  },
}

module.exports = userController
