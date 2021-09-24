const logger = require('../logger').requestLogger

const logRequest = (req, res, next) => {
  const { ip, method, originalUrl, httpVersion } = req
  const { statusCode } = res
  const referrer = req.get('referrer')
  logger.http('Request', {
    ip,
    method,
    originalUrl,
    httpVersion,
    statusCode,
    referrer
  })

  next()
}

module.exports = logRequest
