module.exports = {
  getResponseObject: (status, message, data = {}) => {
    if (status >= 400) {
      return {
        status,
        message: '',
        error: message,
        data
      }
    }
    return {
      status,
      message,
      error: '',
      data
    }
  },
}
