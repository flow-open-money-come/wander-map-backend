require('dotenv').config()
const express = require('express')
const apiRouter = require('./routers/api')
const apiv2Router = require('./routers/apiv2')
const { getResponseObject } = require('./utils')

const app = express()
const PORT = process.env.APP_SERVER_PORT || 8888

app.use(express.json())
app.use(express.urlencoded())

app.use('/api', apiRouter)

app.use('/apiv2', (req, res) => {
  res.json('apiv2 is not ready.')
})

app.all('*', (req, res) => {
  res.json('here is all')
})

app.use((err, req, res, next) => {
  const msg = `something is broke ${err.message}`

  console.error(err)
  res.status(500).json(getResponseObject(500, msg))
})

app.listen(PORT, () => {
  console.log(`wander-map-backend server is listening on port ${PORT}.`)
})
