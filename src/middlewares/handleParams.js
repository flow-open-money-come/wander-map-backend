const { INVALID_INPUT } = require('../constants/errors')

// 所有的 params 都是 id，而且只能是整數
 function handleParams(req, res, next) {
  Object.keys(req.params).forEach((id) => {
    const value = parseInt(req.params[id], 10)
    if (!Number.isInteger(value)) return res.status(400).json(INVALID_INPUT)
    req.params[id] = value
  })
  next()
}

module.exports = handleParams
