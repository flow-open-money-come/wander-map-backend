const jwt = require('jsonwebtoken')

const { UNAUTHORIZED } = require('../constants/errors')
const tokenSecret = process.env.JWT_TOKEN_SECRET

async function auth (req, res, next) {
  const authHeader = req.get('authorization')
  try {
    const token = authHeader.replace('Bearer ', '')
    res.locals.tokenPayload = jwt.verify(token, tokenSecret)
    next()
  } catch (err) {
    res.set({ 'WWW-Authenticate': 'Bearer' })
    res.status(401).json(UNAUTHORIZED)
  }
}

module.exports = auth
