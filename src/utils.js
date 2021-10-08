const { generalLogger: logger } = require('./logger')

module.exports = {
  getPermissionLevel: (tokenPayload, userId) => {
    logger.info(`access with role: ${tokenPayload.role}, userId: ${tokenPayload.user_id}`)
    if (tokenPayload.role === 'admin') return 3
    if (tokenPayload.role === 'suspend') return 1
    if (tokenPayload.user_id === userId && userId !== undefined) return 2
    return 0
  },
}
