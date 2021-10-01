require('dotenv').config()

const express = require('express')
const apiRouter = require('./routers/api')

// const apiv2Router = require('./routers/apiv2')
const logRequest = require('./middlewares/logRequest')
const { generalLogger } = require('./logger')
const { PATH_ERROR } = require('./constants/errors')

const app = express()
const PORT = process.env.APP_SERVER_PORT || 8888

app.use(logRequest)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/v1', apiRouter)
// app.use('/api/v2', (req, res) => res.json('apiv2 is not ready.'))

app.all('*', (req, res, next) => {
  res.status(404).json(PATH_ERROR)
})

app.use((err, req, res, next) => {
  let msg = `something broke in server: ${err.message}`
  let status = 500

  // request header Content-Type 是 application/json，但 body 不是 json 格式時發生的錯誤
  if (
    req.is('application/json') &&
    err instanceof SyntaxError &&
    err.statusCode === 400 &&
    'body' in err
  ) {
    msg = `Input instances are not in JSON format.`
    status = 400
  }

  generalLogger.error(err)
  res.status(status).json({
    success: false,
    message: msg,
    data: {},
  })
})

app.listen(PORT, () => {
  console.log(`wander-map-backend server is listening on port ${PORT}.`)
})
