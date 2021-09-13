const userRouter = require('express').Router()

userRouter.get('/register', (req, res) => {
  const { method, originalUrl, body, hostname } = req
  res.json({
    method,
    originalUrl,
    body,
    hostname
  })
})

userRouter.all('*', (req, res) => {
  res.json('here is api user all')
})

module.exports = userRouter
