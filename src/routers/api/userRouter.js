const userRouter = require('express').Router()

/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     description: 註冊使用者
 *     summary: 註冊使用者
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/register'
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/register'
 *     responses:
 *       "201":
 *         description: registration success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/registerResponse'
 *       "400":
 *         description: Invalid Input
 *       "500":
 *         description: System error
 */
userRouter.post('/register', (req, res) => {
  const { method, originalUrl, body, hostname } = req
  res.json({
    method,
    originalUrl,
    body,
    hostname
  })
})

userRouter.all('*', (req, res) => {
  res.json('here is api user all')
})

module.exports = userRouter
