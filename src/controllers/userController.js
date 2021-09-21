const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userModel = require('../models/userModel')
const { INVALID_INPUT, UNAUTHORIZED } = require('../constants/errors')

const saltRounds = 10
const tokenSecret = process.env.JWT_TOKEN_SECRET

const userController = {
  register: async(req, res, next) => {
    const { nickname, email, password, confirmPassword } = req.body
    const isNull = Object.values({ nickname, email, password, confirmPassword }).some((value) => !value && value !== 0)
    if (isNull || password !== confirmPassword) return res.status(422).json(INVALID_INPUT)

    try {
      let users = await userModel.findByEmail(email)
      if (users.length !== 0) return res.status(422).json(INVALID_INPUT)

      const hash = await bcrypt.hash(password, saltRounds)
      result = await userModel.create({
        nickname,
        email,
        hash
      })

      const token = jwt.sign({
        user_id: result.insertId,
        nickname,
        email,
      }, tokenSecret, { expiresIn: '30d' })

      res.status(201).json({
        success: true,
        message: 'user created',
        data: { token }
      })
    } catch (err) {
      next(err)
    }
  },

  login: async(req, res, next) => {
    const { email, password } = req.body
    const isNull = Object.values({ email, password }).some((value) => !value && value !== 0)
    if(isNull) return res.status(422).json(INVALID_INPUT)

    try {
      const users = await userModel.findByEmail(email)
      const { user_id, nickname, password: hash, icon_url, updated_at, created_at } = users[0]
      const isValid = await bcrypt.compare(password, hash)

      if (!isValid) return res.status(422).json(INVALID_INPUT)
      const token = jwt.sign({
        user_id,
        nickname,
        email,
        icon_url,
        updated_at,
        created_at
      }, tokenSecret, { expiresIn: '30d' })

      res.json({
        success: true,
        message: 'logged in',
        data: { token }
      })
    } catch (err) {
      next(err)
    }
  },

  auth: async(req, res, next) => {
    const authHeader = req.get('authorization')
    try {
      const token = authHeader.replace('Bearer ', '')
      jwt.verify(token, tokenSecret)
      next()
    } catch (err) {
      res.set({ 'WWW-Authenticate': 'Bearer' })
      res.status(401).json(UNAUTHORIZED)
    }
  }
}

module.exports = userController
