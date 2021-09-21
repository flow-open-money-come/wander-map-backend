const userRouter = require('express').Router()

const { PATH_ERROR } = require('../../constants/errors')
const userController = require('../../controllers/userController')

/**
 * @swagger
 * /api/v1/users/register:
 *  post:
 *     tags: [Users]
 *     summary: 註冊使用者
 *     description: 以 nickname、email、password 來註冊使用者，通過驗證後回傳 JWT access token。
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
 *       "422":
 *         description: Invalid Input
 *       "500":
 *         description: System error
 */
userRouter.post('/register', userController.register)

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
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/loginResponse'
 *      "422":
 *        description: Invalid Input
 *        headers:
 *          WWW-Authenticate:
 *            description: 需要 JWT token
 *            schema:
 *              type: string
 *              example: 'WWW-Authenticate: Bearer'
 *      "500":
 *        description: System error
 */
userRouter.post('/login', userController.login)

/**
 *  @swagger
 *  /api/v1/users/logout:
 *    get:
 *      tags: [Users]
 *      summary: 使用者登出
 *      description: 以 token/cookie 進行使用者驗證後，將 session store 的資料刪除作為登出
 *      parameters:
 *        - name: Authorization
 *          in: header
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
// 單純實作 JWT 使用者會無法主動登出
// userRouter.get('/logout', (req, res) => res.json('here is users logout'))
userRouter.get('/logout', userController.auth, (req, res) => res.json('logout test'))
userRouter.all('*', (req, res) => res.json(PATH_ERROR))

module.exports = userRouter
