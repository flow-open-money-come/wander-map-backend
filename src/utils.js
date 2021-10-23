const crypto = require('crypto')
const { generalLogger: logger } = require('./logger')

module.exports = {
  getPermissionLevel: (tokenPayload, userId) => {
    logger.info(`access with role: ${tokenPayload.role}, userId: ${tokenPayload.user_id}`)
    if (tokenPayload.role === 'admin') return 3
    if (tokenPayload.role === 'suspend') return 1
    if (tokenPayload.user_id === userId && userId !== undefined) return 2
    return 0
  },

  generateRefreshToken: () => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(32, (err, buffer) => {
        if (err) return reject(err)
        resolve(buffer.toString('hex'))
      })
    })
  },

  getCookieExpireTime: () => {
    const unitMap = {
      h: 1000 * 60 * 60,
      d: 1000 * 60 * 60 * 24,
      m: 1000 * 60 * 60 * 24 * 30,
      y: 1000 * 60 * 60 * 24 * 30 * 12,
    }
    const match = process.env.COOKIE_AGE.match(/(?<number>[0-9]*)(?<unit>[hdmy]*)/)
    const { number, unit } = match.groups
    return new Date(Date.now() + number * unitMap[unit])
  },

  getCookieOptions: (expiredAt) => {
    return {
      path: '/api/v1/users',
      expires: expiredAt,
      signed: process.env.COOKIE_SECRET,
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    }
  },
}
