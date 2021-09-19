const articleRouter = require('express').Router()

articleRouter.all('*', (req, res) => {
  res.json('here is api article all')
})

module.exports = articleRouter
