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
    message: 'valid access token needed',
    data: {}
  }
}

module.exports = errors
