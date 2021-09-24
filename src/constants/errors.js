const errors = {
  PATH_ERROR: {
    success: false,
    message: 'no such api',
    data: {}
  },
  INVALID_INPUT: {
    success: false,
    message: 'invalid input', // email 已存在，或是兩個密碼不同
    data: {}
  },
  UNAUTHORIZED: {
    success: false,
    message: 'access token needed || incorrect email/password',
    data: {}
  },
  FORBIDDEN_ACTION: {
    success: false,
    message: 'you have no permission to access',
    data: {}
  }
}

module.exports = errors