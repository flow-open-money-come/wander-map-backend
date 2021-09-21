const swaggerUi = require('swagger-ui-express')
const apiRouter = require('express').Router()

const swaggerDocument = require('./swagger')
const userRouter = require('./userRouter')
const articleRouter = require('./articleRouter')
const trailRouter = require('./trailRouter')
const { PATH_ERROR } = require('../../constants/errors')

apiRouter.get('/doc', (req, res) => res.redirect(301, 'https://hackmd.io/@FPgogo/H1l8ogI-Y/https%3A%2F%2Fhackmd.io%2FGMJP6yXKQXCXAT4gDXsJPQ'))
apiRouter.use('/test', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

apiRouter.use('/users', userRouter)
apiRouter.use('/articles', articleRouter)
apiRouter.use('/trails', trailRouter)

apiRouter.all('*', (req, res) => {
  res.status(404).json(PATH_ERROR)
})

module.exports = apiRouter
