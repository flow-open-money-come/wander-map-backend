const trailRouter = require('express').Router()

trailRouter.all('*', (req, res) => {
  res.json('here is api trail all')
})

module.exports = trailRouter
