require('dotenv').config()

const fs = require('fs')
const http = require('http')
const https = require('https')
const path = require('path')
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const apiRouter = require('./routers/api')
// const apiv2Router = require('./routers/apiv2')
const logRequest = require('./middlewares/logRequest')
const { generalLogger } = require('./logger')
const { PATH_ERROR } = require('./constants/errors')

const app = express()
const PORT = process.env.APP_SERVER_PORT || 8888
const HTTPS_PORT = process.env.HTTPS_SERVER_PORT || 9999

const corsOptions = {
  credentials: true,
  origin: ['https://wandermap.netlify.app', 'http://localhost:3000'],
  exposedHeaders: ['x-total-count'],
}

app.disable('x-powered-by')
app.use(cors(corsOptions))
app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(logRequest)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, './public')))

app.use('/api/v1', apiRouter)
// app.use('/api/v2', (req, res) => res.json('apiv2 is not ready.'))

app.all('*', (req, res, next) => {
  res.status(404).json(PATH_ERROR)
})

app.use((err, req, res, next) => {
  let msg = `something broke in server: ${err.message}`
  let status = 500

  // request header Content-Type 是 application/json，但 body 不是 json 格式時發生的錯誤
  if (req.is('application/json') && err instanceof SyntaxError && err.statusCode === 400 && 'body' in err) {
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

http.createServer(app).listen(PORT, () => {
  console.log(`wander-map-backend server is listening on port ${PORT}.`)
})

if (fs.existsSync(process.env.SSL_KEY) && fs.existsSync(process.env.SSL_CERTIFICATE)) {
  const key = fs.readFileSync(process.env.SSL_KEY, 'utf8')
  const cert = fs.readFileSync(process.env.SSL_CERTIFICATE, 'utf8')
  const credentials = {
    key,
    cert,
  }

  https.createServer(credentials, app).listen(HTTPS_PORT, () => {
    console.log(`wander-map-backend https server is listening on port ${HTTPS_PORT}.`)
  })
}
