require('dotenv').config()

const fs = require('fs')
const path = require('path')
const { stdout } = require('process')
const mysql = require('mysql2')

function readFilePromise(path, encode) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, encode, (err, file) => {
      if (err) return reject(err)
      resolve(file)
    })
  })
}

const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE_NAME,
  charset: 'utf8mb4',
  timezone: '+08:00',
  connectTimeout: 60000,
  multipleStatements: true
}).promise()

readFilePromise(path.resolve(__dirname, '../databaseStructure.sql'), 'utf8')
  .then((file) => {
    stdout.write('creating database structure...')
    return conn.query(file)
  })
  .then((_) => stdout.write('done\n'))
  .then((_) => readFilePromise(path.resolve(__dirname, '../tagAndTrailData.sql'), 'utf8'))
  .then((file) => {
    stdout.write('injecting tag and trail data into database...')
    return conn.query(file)
  })
  .then((_) => stdout.write('done\n'))
  .catch((e) => {
    stdout.end('error')
    console.error(e)
  })
  .finally(() => conn.end())


