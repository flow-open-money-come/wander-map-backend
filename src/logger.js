const path = require('path')
const { createLogger, format, transports } = require('winston')
const { combine, timestamp, label, printf, errors } = format
require('winston-daily-rotate-file')

const appLabel = label({ label: 'WanderMap Server' })

const generalFormat = printf(({ level, message, timestamp, label, stack }) => {
  if (stack) return `[${timestamp}] [${level.toUpperCase()}] ${label}: ${message} \n ${stack}`
  return `[${timestamp}] [${level.toUpperCase()}] ${label}: ${message}`
})

const requestFormat = printf(({ level, message, timestamp, label, ip, method, originalUrl, httpVersion, statusCode, referrer }) => {
  return `[${timestamp}] [${level.toUpperCase()}] ${label}: ${message} ${ip} ${method} ${originalUrl} HTTP/${httpVersion} ${statusCode} ${referrer}`
})

const transportConfig = {
  dirname: path.resolve(__dirname, '../logs/'),
  filename: 'combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'debug',
}
const combinedRotateTransport = new transports.DailyRotateFile(transportConfig)

transportConfig.filename = 'error-%DATE%.log'
transportConfig.level = 'error'
const errorRotateTransport = new transports.DailyRotateFile(transportConfig)

const generalLogger = createLogger({
  format: combine(appLabel, timestamp(), errors({ stack: true }), generalFormat),
  transports: [combinedRotateTransport, errorRotateTransport],
})

const requestLogger = createLogger({
  format: combine(appLabel, timestamp(), errors({ stack: true }), requestFormat),
  transports: [combinedRotateTransport, errorRotateTransport],
})

if (process.env.NODE_ENV !== 'production') {
  generalLogger.add(new transports.Console({ level: 'debug' }))
  requestLogger.add(new transports.Console({ level: 'http' }))
}

module.exports = {
  generalLogger,
  requestLogger,
}
