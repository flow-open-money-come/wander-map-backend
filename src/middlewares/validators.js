const { query, param, body, validationResult } = require('express-validator')
const { INVALID_INPUT } = require('../constants/errors')
const { TAIWAN_LOCATION } = require('../constants/location')

function handleValidationResult(req, res, next) {
  const errors = validationResult(req)
  if (errors.isEmpty()) return next()

  const responseBody = INVALID_INPUT
  responseBody.data.errors = errors.array()
  return res.status(400).json(responseBody)
}

const validators = {
  paramValidator: [
    param('*', 'id in params must be integer').toInt().isInt(),
    handleValidationResult
  ],

  paginationAndSearchValidator: [
    query('limit')
      .default(20)
      .toInt()
      .customSanitizer((limit) => (limit > 200 ? 200 : limit))
      .customSanitizer((limit) => (limit <= 0 ? 20 : limit)),
    query('offset')
      .default(0)
      .toInt()
      .customSanitizer((offset) => (offset < 0 ? 0 : offset)),
    query('cursor')
      .default(0)
      .toInt()
      .customSanitizer((cursor) => (cursor <= 0 ? 0 : cursor)),
    query('tag').optional().toArray(),
    query('location', 'location must be one of the values: north, south, middle, east, island')
      .optional()
      .toArray()
      .customSanitizer((locations) => {
        return locations.reduce((cities, location) => {
          if (TAIWAN_LOCATION[location]) return cities.concat(TAIWAN_LOCATION[location])
          return cities
        }, [])
      }),
    query(
      'altitude',
      'should be in the format of "altitude[gt]=1000" or "altitude[lt]=2000" to filter'
    )
      .optional()
      .isObject()
      .customSanitizer((altitude) => {
        return { gt: altitude.gt, lt: altitude.lt }
      }),
    query('altitude.gt', 'altitude.gt should be integer')
      .optional()
      .if(query('altitude').exists)
      .toArray()
      .customSanitizer((gt) => {
        return gt.map((ele) => parseInt(ele, 10)).filter((ele) => ele)
      }),
    query('altitude.lt', 'altitude.lt should be integer')
      .optional()
      .if(query('altitude').exists)
      .toArray()
      .customSanitizer((lt) => {
        return lt.map((ele) => parseInt(ele, 10)).filter((ele) => ele)
      }),
    query('length', 'should be in the format of "length[gt]=1.2"')
      .optional()
      .isObject()
      .customSanitizer((length) => {
        return { gt: length.gt, lt: length.lt }
      }),
    query('length.gt', 'length.gt should be float')
      .optional()
      .if(query('length').exists)
      .toArray()
      .customSanitizer((gt) => {
        return gt.map((ele) => parseFloat(ele)).filter((ele) => ele)
      }),
    query('length.lt', 'length.lt should be float')
      .optional()
      .if(query('length').exists)
      .toArray()
      .customSanitizer((lt) => {
        return lt.map((ele) => parseFloat(ele)).filter((ele) => ele)
      }),
    query(
      'difficult',
      'difficult must be integer between 1 and 5 or string in ["新手", "入門", "進階", "挑戰", "困難"]'
    )
      .optional()
      .toArray()
      .customSanitizer((difficult) => {
        return difficult.filter((ele) =>
          ['新手', '入門', '進階', '挑戰', '困難', '1', '2', '3', '4', '5'].includes(ele)
        )
      }),
    handleValidationResult
  ],

  registerValidator: [
    body('nickname', 'nickname must not be empty').trim().notEmpty(),
    body('email', '電子郵件格式不符').trim().normalizeEmail().isEmail(),
    body(
      'password',
      'Password must be at least 8 characters long and include at least 1 number & 1 alphabetical character'
    )
      .trim()
      .custom((value) => {
        const passwordFormat = new RegExp(/(?=.*\d)(?=.*[a-zA-Z])^[a-zA-Z0-9!@#$%^&*]{8,}$/)
        return passwordFormat.test(value)
      }),
    body('confirmPassword', 'Password and confirm password does not match')
      .trim()
      .custom((value, { req }) => value === req.body.password),
    handleValidationResult
  ],

  loginValidator: [
    body('email').trim().notEmpty(),
    body('password').trim().notEmpty(),
    handleValidationResult
  ],

  editUserValidator: [
    body('nickname').optional().trim().notEmpty(),
    body('iconUrl').optional().trim().notEmpty(),
    body('role').optional().trim().notEmpty(),
    body(
      'password',
      'Password must be at least 8 characters long and include at least 1 number & 1 alphabetical character'
    )
      .optional()
      .trim()
      .custom((value) => {
        const passwordFormat = new RegExp(/(?=.*\d)(?=.*[a-zA-Z])^[a-zA-Z0-9!@#$%^&*]{8,}$/)
        return passwordFormat.test(value)
      }),
    body('confirmPassword', 'Password and confirm password does not match')
      .optional()
      .trim()
      .custom((value, { req }) => value === req.body.password),
    handleValidationResult
  ],

  postTodoValidator: [
    body('content', 'content is required').exists({ checkNull: true }).trim(),
    handleValidationResult
  ],
  editTodoValidator: [body('is_done').optional().trim().toInt(), handleValidationResult],
  likedArticleValidator: [
    body('article_id', 'article_id must be integer').trim().toInt().isInt({ min: 1 }),
    handleValidationResult
  ],
  collectedTrailsValidator: [
    body('trail_id', 'trail_id must be integer').trim().toInt().isInt({ min: 1 }),
    handleValidationResult
  ],

  postTrailsValidator: [
    body('title').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('location').trim().notEmpty(),
    body('coordinateX').trim().notEmpty().isFloat({ min: 120, max: 122 }),
    body('coordinateY').trim().notEmpty().isFloat({ min: 22, max: 25 }),
    body('altitude').trim().notEmpty().isInt(),
    body('length').trim().notEmpty().isFloat({ min: 0 }),
    body('difficulty')
      .trim()
      .notEmpty()
      .custom((difficulty) => {
        return ['新手', '入門', '進階', '挑戰', '困難', '1', '2', '3', '4', '5'].includes(
          difficulty
        )
      }),
    body('season').trim().notEmpty(),
    body('cover_picture_url').trim().notEmpty(),
    body('map_picture_url').trim().optional(),
    body('situation').trim().notEmpty(),
    handleValidationResult
  ],

  articleValidator: [
    body('title').trim().notEmpty(),
    body('content').trim().notEmpty(),
    body('location').optional().trim(),
    body('tags')
      .optional()
      .toArray()
      .customSanitizer((tags) => {
        return tags.filter((tag) => tag)
      }),
    body('coordinate')
      .optional()
      .isObject()
      .notEmpty()
      .customSanitizer((coordinate) => {
        return { x: coordinate.x, y: coordinate.y }
      }),
    body('coordinate.x').optional().toFloat().isFloat({ min: 0 }),
    body('coordinate.y').optional().toFloat().isFloat({ min: 0 }),
    body('altitude').optional().toInt().isInt(),
    body('length').optional().toInt().isInt({ min: 0 }),
    body('departure_time', 'format: yyyy-mm-dd hh:mm:ss').optional().isISO8601(),
    body('end_time').optional().isISO8601(),
    body('time_spent').optional().toInt().isInt({ min: 0 }),
    body('cover_picture_url').optional().isURL(),
    body('gpx_url').optional().isURL(),
    handleValidationResult
  ],

  updateArticleValidator: [
    body('title').optional().trim(),
    body('content').optional().trim(),
    body('location').optional().trim(),
    body('tags')
      .optional()
      .toArray()
      .customSanitizer((tags) => {
        return tags.filter((tag) => tag)
      }),
    body('coordinate')
      .optional()
      .isObject()
      .notEmpty()
      .customSanitizer((coordinate) => {
        return { x: coordinate.x, y: coordinate.y }
      }),
    body('coordinate.x').optional().toFloat().isFloat({ min: 0 }),
    body('coordinate.y').optional().toFloat().isFloat({ min: 0 }),
    body('altitude').optional().toInt().isInt(),
    body('length').optional().toInt().isInt({ min: 0 }),
    body('departure_time', 'format: yyyy-mm-dd hh:mm:ss').optional().isISO8601(),
    body('end_time', 'format: yyyy-mm-dd hh:mm:ss').optional().isISO8601(),
    body('time_spent').optional().toInt().isInt({ min: 0 }),
    body('cover_picture_url').optional().isURL(),
    body('gpx_url').optional().isURL(),
    body('is_deleted')
      .optional()
      .isBoolean()
      .customSanitizer((value) => (value === 'true' || value === '1' ? 1 : 0)),
    handleValidationResult
  ]
}

module.exports = validators
