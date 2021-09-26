const userRouter = require('express').Router()

const { PATH_ERROR } = require('../../constants/errors')
const userController = require('../../controllers/userController')
const todoController = require('../../controllers/todoController')
const auth = require('../../middlewares/auth')
const handleParams = require('../../middlewares/handleParams')

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
 *      summary: 使用者登出 - 還沒寫
 *      description: 進行使用者驗證後，將 session store 的資料刪除作為登出（要先實作 session 機制）
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
userRouter.get('/testAuth', auth, (req, res) => res.json('auth success!!'))

/**
 * @swagger
 * /api/v1/users:
 *  get:
 *    tags: [Users]
 *    summary: 取得所有使用者資料
 *    description: 可在 URL 上帶 limit、offset、cursor 取得分頁。limit 預設值 20。offset 與 cursor 都有設的情況下優先使用 cursor。
 *    parameters:
 *      - name: limit
 *        in: query
 *        description: 一次 query 帶幾筆資料，max:200。
 *      - name: offset
 *        in: query
 *        description: 偏移量，一開始為 0。加上 limit 的值就能拿下一頁的資料。
 *      - name: cursor
 *        in: query
 *        description: 指標，指在資料的起點。把前一次 query 返回的最後一筆 user_id + 1 就可以拿下一頁的資料。
 *    responses:
 *      "200":
 *        description: "user data"
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/getAllUsers'
 */
userRouter.get('/', userController.getUsers)

userRouter.get('/:user_id', handleParams, userController.getUser)
userRouter.patch('/:user_id', auth, handleParams, userController.editUser)
userRouter.get('/:user_id/todos', handleParams, todoController.getTodos)
userRouter.post('/:user_id/todos', auth, handleParams, todoController.postTodo)
userRouter.patch('/:user_id/todos/:todo_id', auth, handleParams, todoController.updateTodo)
userRouter.delete('/:user_id/todos/:todo_id', auth, handleParams, todoController.deleteTodo)

// userRouter.get('/:user_id/articles', (req, res, next) => res.json('articles'))
// userRouter.patch('/:user_id/articles/:article_id', (req, res, next) => res.json('like/unlike'))
// userRouter.get('/:user_id/trails', (req, res, next) => res.json('trails'))
// userRouter.patch('/:user_id/trails/:trail_id', (req, res, next) => res.json('collect'))

userRouter.all('*', (req, res) => res.json(PATH_ERROR))
module.exports = userRouter
