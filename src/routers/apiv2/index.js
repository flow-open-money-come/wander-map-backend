const apiRouter = require('express').Router()
// const userRouter = require('./userRouter')
// const articleRouter = require('./articleRouter')
// const trailRouter = require('./trailRouter')

// apiRouter.use('/users', userRouter)
// apiRouter.use('/articles', articleRouter)
// apiRouter.use('/trails', trailRouter)

apiRouter.all('*', (req, res) => {
  res.json('apiv2 is not ready.')
})

module.exports = apiRouter
