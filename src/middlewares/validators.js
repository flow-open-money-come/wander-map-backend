const { param, body, validationResult } = require('express-validator')
const { INVALID_INPUT } = require('../constants/errors')

function handleValidationResult(req, res, next) {
  const errors = validationResult(req)
  if (errors.isEmpty()) return next()

  const responseBody = INVALID_INPUT
  responseBody.data.errors = errors.array()
  return res.status(400).json(responseBody)
}

const validators = {
  paramValidator: [param('*', 'id in params must be integer').toInt().isInt(), handleValidationResult],

  registerValidator: [
    body('nickname', 'nickname must not be empty').trim().notEmpty(),
    body('email', 'email format error').trim().normalizeEmail().isEmail(),
    body('password', 'Password must be at least 8 characters long and include at least 1 number & 1 alphabetical character')
      .trim()
      .custom((value) => {
        const passwordFormat = new RegExp(/(?=.*\d)(?=.*[a-zA-Z])^[a-zA-Z0-9!@#$%^&*]{8,}$/)
        return passwordFormat.test(value)
      }),
    body('confirmPassword', 'Password and confirm password does not match')
      .trim()
      .custom((value, { req }) => value === req.body.password),
    handleValidationResult,
  ],

  loginValidator: [body('email').trim(), body('password').trim(), handleValidationResult],

  editUserValidator: [
    body('password', 'Password must be at least 8 characters long and include at least 1 number & 1 alphabetical character')
      .trim()
      .custom((value) => {
        const passwordFormat = new RegExp(/(?=.*\d)(?=.*[a-zA-Z])^[a-zA-Z0-9!@#$%^&*]{8,}$/)
        return passwordFormat.test(value)
      }),
    body('confirmPassword', 'Password and confirm password does not match')
      .trim()
      .custom((value, { req }) => value === req.body.password),
    handleValidationResult,
  ],
}

module.exports = validators
