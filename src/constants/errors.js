const errors = {
  PATH_ERROR: {
    success: false,
    message: 'no such api',
    data: {},
  },
  INVALID_INPUT: {
    success: false,
    message: 'invalid input',
    data: {},
  },
  UNAUTHORIZED: {
    success: false,
    message: 'access token needed',
    data: {},
  },
  FORBIDDEN_ACTION: {
    success: false,
    message: 'you have no permission to access',
    data: {},
  },
  DUPLICATE_EMAIL: {
    success: false,
    message: 'The email address is already registered',
    data: {},
  },
  LOGIN_ERROR: {
    success: false,
    message: 'email or password error',
    data: {},
  },
}

module.exports = errors
