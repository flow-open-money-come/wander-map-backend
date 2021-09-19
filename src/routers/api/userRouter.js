const userRouter = require('express').Router()

/**
 * @swagger
 * /api/v1/users/register:
 *  post:
 *     tags: [Users]
 *     summary: 註冊使用者
 *     description: 取得 nickname、email、password 來註冊使用者
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
 *         headers:
 *           Set-Cookie:
 *             description: 設 session ID
 *             schema:
 *               type: string
 *               example:
 *                 sid:sdlifjlj15j8493
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

/**
 * @swagger
 * /api/v1/users/login:
 *  post:
 *    tags: [Users]
 *    summary: 使用者登入
 *    description: 使用者以 email/password 登入，設定 cookie/token 並存入 session store
 *    requestBody:
 *      required: true
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            $ref: '#components/schemas/login'
 *        application/json:
 *          schema:
 *            $ref: '#components/schemas/login'
 *    responses:
 *      "200":
 *        description: logged in
 *        headers:
 *          Set-Cookie:
 *            description: 設 session ID
 *            schema:
 *              type: string
 *              example:
 *                sid:dfadjfiap289g;SameSite=None; Secure
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/loginResponse'
 */
userRouter.post('/login', (req, res) => res.json('here is users login'))

/**
 *  @swagger
 *  /api/v1/users/logout:
 *    get:
 *      tags: [Users]
 *      summary: 使用者登出
 *      description: 以 token/cookie 進行使用者驗證後，將 session store 的資料刪除作為登出
 *      parameters:
 *        - name: sid
 *          in: cookie
 *          description: 可用 cookie 帶 sid，或是用 http Authorization header 帶 JWT access token
 *          required: true
 *      responses:
 *        "200":
 *          description: logged out
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/logoutResponse'
 */
userRouter.get('/logout', (req, res) => res.json('here is users logout'))

userRouter.all('*', (req, res) => {
  res.json('here is api user all')
})

module.exports = userRouter
