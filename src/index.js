require('dotenv').config()
const express = require('express')
const apiRouter = require('./routers/api')
// const apiv2Router = require('./routers/apiv2')
const { getResponseObject } = require('./utils')

const app = express()
const PORT = process.env.APP_SERVER_PORT || 8888

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/api/v1', apiRouter)
app.use('/api/v2', (req, res) => res.json('apiv2 is not ready.'))

app.all('*', (req, res) => {
  res.json('here is all')
})

app.use((err, req, res, next) => {
  let msg = `something is broke ${err.message}`
  let status = 500
  if (err.statusCode === 400) {
    msg = `input format invalid`
    status = err.statusCode
  }
  console.error(err)
  res.status(status).json(getResponseObject(status, msg))
})

app.listen(PORT, () => {
  console.log(`wander-map-backend server is listening on port ${PORT}.`)
})
