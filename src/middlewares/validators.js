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
    query('difficult', 'difficult must be integer between 1 and 5')
      .optional()
      .toArray()
      .customSanitizer((difficult) => {
        return difficult
          .map((ele) => parseInt(ele, 10))
          .filter((ele) => ele && ele >= 1 && ele <= 5)
      }),
    handleValidationResult
  ],

  registerValidator: [
    body('nickname', 'nickname must not be empty').trim().notEmpty(),
    body('email', 'email format error').trim().normalizeEmail().isEmail(),
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

  loginValidator: [body('email').trim(), body('password').trim(), handleValidationResult],

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
  editTodoValidator: [body('isDone').optional().trim().toInt(), handleValidationResult],
  likedArticleValidator: [
    body('articleId', 'articleId must be integer').trim().toInt().isInt({ min: 1 }),
    handleValidationResult
  ],
  collectedTrailsValidator: [
    body('trailId', 'trailId must be integer').trim().toInt().isInt({ min: 1 }),
    handleValidationResult
  ],

  postTrailsValidator: [
    body('author_id').trim().notEmpty(),
    body('title').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('location').trim().notEmpty(),
    body('coordinate').trim().notEmpty(),
    body('altitude').trim().notEmpty(),
    body('length').trim().notEmpty(),
    body('difficulty').trim().notEmpty(),
    body('season').trim().notEmpty(),
    body('cover_picture_url').trim().notEmpty(),
    body('map_picture_url').trim().notEmpty(),
    body('situation').trim().notEmpty(),
    body('required_time').trim().notEmpty(),
    handleValidationResult
  ]
}

module.exports = validators
