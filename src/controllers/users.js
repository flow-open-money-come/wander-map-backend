const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { generalLogger: logger } = require('../logger')
const userModel = require('../models/users')
const articleModel = require('../models/articles')
const trailModel = require('../models/trails')
const { INVALID_INPUT, FORBIDDEN_ACTION, DUPLICATE_EMAIL, LOGIN_ERROR } = require('../constants/errors')

const saltRounds = 10
const tokenSecret = process.env.JWT_TOKEN_SECRET

const userController = {
  register: async (req, res, next) => {
    const { nickname, email, password } = req.body

    try {
      let users = await userModel.findOne({ where: { email } })
      // 409 代表請求與目前伺服器狀態衝突，但 google、facebook 等大公司都回 200
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

    try {
      const users = await userModel.findOne({ where: { email } })
      if (users.length === 0) return res.status(401).json(LOGIN_ERROR)

      const { user_id, nickname, password: hash, icon_url, role, updated_at, created_at } = users[0]
      const isValid = await bcrypt.compare(password, hash)

      if (!isValid) return res.status(401).json(LOGIN_ERROR)
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
    const { tokenPayload } = res.locals
    if (tokenPayload.role !== 'admin') return res.status(403).json(FORBIDDEN_ACTION)

    const { limit, offset, cursor } = req.query
    const options = {
      limit: limit || 20,
      offset: offset ?? 0,
      cursor: cursor ?? 0,
    }

    options.limit = options.limit > 200 ? 200 : options.limit
    options.limit = options.limit < 0 ? 20 : options.limit
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
    const { userId } = req.params

    const { tokenPayload } = res.locals
    if (tokenPayload.user_id !== userId && tokenPayload.role !== 'admin') return res.status(403).json(FORBIDDEN_ACTION)

    try {
      const options = {
        where: { user_id: userId },
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
    const { userId } = req.params
    let { nickname, iconUrl, password, role } = req.body

    const { tokenPayload } = res.locals
    if (tokenPayload.user_id !== userId && tokenPayload.role !== 'admin') return res.status(403).json(FORBIDDEN_ACTION)

    try {
      if (password) password = await bcrypt.hash(password, saltRounds)
      const columns = { nickname, icon_url: iconUrl, password }
      if (tokenPayload.role === 'admin' && role) {
        const validValues = ['admin', 'member', 'suspended', 1, 2, 3]
        if (!validValues.includes(role)) return res.status(400).json(INVALID_INPUT)
        columns.role = role
      }
      for (let column in columns) {
        if (!columns[column]) delete columns[column]
      }

      await userModel.updateUser({ userId, columns })
      res.json({
        success: true,
        message: `user_id: ${userId} is updated`,
        data: {},
      })
    } catch (err) {
      next(err)
    }
  },

  getArticles: (req, res, next) => {
    const { userId } = req.params

    articleModel.findByUserId(userId, (err, results) => {
      if (err) return next(err)
      res.json({
        success: true,
        message: `articles wrote by user ${userId}`,
        data: { articles: results },
      })
    })
  },

  getLikedArticles: (req, res, next) => {
    const { userId } = req.params

    articleModel.findByUserLike(userId, (err, results) => {
      if (err) return next(err)
      res.json({
        success: true,
        message: `articles liked by user ${userId}`,
        data: { articles: results },
      })
    })
  },

  likeArticle: async (req, res, next) => {
    const { articleId } = req.body
    const { userId } = req.params

    const { tokenPayload } = res.locals
    if (tokenPayload.user_id !== userId && tokenPayload.role !== 'admin') return res.status(403).json(FORBIDDEN_ACTION)

    articleModel.createLikeAssociation(userId, articleId, (err, results) => {
      if (err) return next(err)
      res.json({
        success: true,
        message: 'like association was created',
        data: { results },
      })
    })
  },

  unlikeArticle: (req, res, next) => {
    const { userId, articleId } = req.params

    const { tokenPayload } = res.locals
    if (tokenPayload.user_id !== userId && tokenPayload.role !== 'admin') return res.status(403).json(FORBIDDEN_ACTION)

    articleModel.deleteLikeAssociation(userId, articleId, (err, results) => {
      if (err) return next(err)
      res.json({
        success: true,
        message: 'like association was deleted',
        data: { results },
      })
    })
  },

  getTrails: async (req, res, next) => {
    const { userId } = req.params

    try {
      const trails = await trailModel.findByUserId(userId)
      res.json({
        success: true,
        message: `trails wrote by user ${userId}`,
        data: { trails },
      })
    } catch (err) {
      next(err)
    }
  },

  getCollectedTrails: async (req, res, next) => {
    const { userId } = req.params

    try {
      const trails = await trailModel.findByUserCollect(userId)
      res.json({
        success: true,
        message: `trails collected by user ${userId}`,
        data: { trails },
      })
    } catch (err) {
      next(err)
    }
  },

  collectTrail: async (req, res, next) => {
    const { userId } = req.params
    const { trailId } = req.body

    const { tokenPayload } = res.locals
    if (tokenPayload.user_id !== userId && tokenPayload.role !== 'admin') return res.status(403).json(FORBIDDEN_ACTION)

    try {
      const result = await trailModel.createCollectAssociation(userId, trailId)
      res.json({
        success: true,
        message: 'collect association was created',
        data: { result },
      })
    } catch (err) {
      next(err)
    }
  },

  cancelCollectTrail: async (req, res, next) => {
    const { userId, trailId } = req.params

    const { tokenPayload } = res.locals
    if (tokenPayload.user_id !== userId && tokenPayload.role !== 'admin') return res.status(403).json(FORBIDDEN_ACTION)

    try {
      const result = await trailModel.deleteCollectAssociation(userId, trailId)
      res.json({
        success: true,
        message: 'collect association was deleted',
        data: { result },
      })
    } catch (err) {
      next(err)
    }
  },
}

module.exports = userController
