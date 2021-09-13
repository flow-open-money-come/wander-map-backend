const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger')
const apiRouter = require('express').Router()
const userRouter = require('./userRouter')
const articleRouter = require('./articleRouter')
const trailRouter = require('./trailRouter')

apiRouter.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
apiRouter.use('/users', userRouter)
apiRouter.use('/articles', articleRouter)
apiRouter.use('/trails', trailRouter)

apiRouter.all('*', (req, res) => {
  res.json('here is api all')
})

module.exports = apiRouter
