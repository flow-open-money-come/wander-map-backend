const { INVALID_INPUT } = require('../constants/errors')

 function handleParams(req, res, next) {
  let { user_id } = req.params

  user_id = parseInt(user_id, 10)
  if (!Number.isInteger(user_id)) return res.status(400).json(INVALID_INPUT)

  req.param.user_id = user_id
  next()
}

module.exports = handleParams
