const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger')
const apiRouter = require('express').Router()
const userRouter = require('./userRouter')
const articleRouter = require('./articleRouter')
const trailRouter = require('./trailRouter')

apiRouter.get('/doc', (req, res) => res.redirect(301, 'https://hackmd.io/@FPgogo/H1l8ogI-Y/https%3A%2F%2Fhackmd.io%2FGMJP6yXKQXCXAT4gDXsJPQ'))
apiRouter.use('/test', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
apiRouter.use('/users', userRouter)
apiRouter.use('/articles', articleRouter)
apiRouter.use('/trails', trailRouter)

apiRouter.all('*', (req, res) => {
  res.json('here is api all')
})

module.exports = apiRouter
