const userRouter = require('express').Router()

const auth = require('../../middlewares/auth')
const { paramValidator, paginationAndSearchValidator, registerValidator, loginValidator, editUserValidator, editTodoValidator, postTodoValidator, likedArticleValidator, collectedTrailsValidator } = require('../../middlewares/validators')
const { PATH_ERROR } = require('../../constants/errors')
const userController = require('../../controllers/users')
const todoController = require('../../controllers/todos')

/**
 * @swagger
 * /api/v1/users/register:
 *  post:
 *     tags: [Users]
 *     summary: 註冊使用者
 *     description: 以 nickname、email、password 來註冊使用者，通過驗證後回傳 JWT access token 及 Set-Cookie refreshToken。因為瀏覽器政策限制，必須以其他工具發 request 才能取得 refresh token。
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
 *       "200":
 *         description: duplicate email - 信箱已被註冊
 *       "201":
 *         description: registration success - 註冊成功
 *         headers:
 *           Set-Cookie:
 *             description: refreshToken - 在 jwt token 過期時，帶著 refresh token 去 /api/v1/users/refresh，可得到新的 jwt token 及 refresh token。
 *             type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/registerResponse'
 *       "500":
 *         $ref: '#/components/responses/internalError'
 */
userRouter.post('/register', registerValidator, userController.register)

/**
 * @swagger
 * /api/v1/users/login:
 *  post:
 *    tags: [Users]
 *    summary: 使用者登入
 *    description: 使用者以 email/password 登入，登入成功回傳 jwt token/refresh token。因為瀏覽器政策限制，必須以其他工具發 request 才能取得 refresh token。
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
 *            description: refreshToken - 在 jwt token 過期時，帶著 refresh token 去 /api/v1/users/refresh，可得到新的 jwt token 及 refresh token
 *            type: string
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/loginResponse'
 *      "401":
 *        description: email or password error
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
userRouter.post('/login', loginValidator, userController.login)

/**
 *  @swagger
 *  /api/v1/users/logout:
 *    get:
 *      tags: [Users]
 *      summary: 使用者登出
 *      description: 將 session store 與瀏覽器 cookie 中的 refresh token 刪除作為登出，待 jwt 自動過期就算真正登出
 *      security:
 *        - refreshToken: []
 *      responses:
 *        "200":
 *          description: logged out
 *          headers:
 *            Set-Cookie:
 *              description: refreshToken - 設一個馬上過期的 cookie，讓瀏覽器清除
 *              type: string
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/logoutResponse'
 *        "500":
 *          $ref: '#/components/responses/internalError'
 */
userRouter.get('/logout', userController.logout)

/**
 *  @swagger
 *  /api/v1/users/refresh:
 *    get:
 *      tags: [Users]
 *      summary: 以 refresh token 取得 access token
 *      description: 用 refresh token 換取新的 jwt token 及 refresh token
 *      security:
 *        - refreshToken: []
 *      responses:
 *        "200":
 *          description: jwt access token
 *          headers:
 *            Set-Cookie:
 *              description: refreshToken - 在 jwt token 過期時，帶著 refresh token 去 /api/v1/users/refresh，可得到新的 jwt token 及 refresh token
 *              type: string
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/refreshResponse'
 *        "500":
 *          $ref: '#/components/responses/internalError'
 */
userRouter.get('/refresh', userController.refresh)

/**
 * @swagger
 * /api/v1/users:
 *  get:
 *    tags: [Users]
 *    summary: 取得所有使用者資料 - 僅限 role 為 admin
 *    description: 可在 URL 上帶 limit、offset、cursor 取得分頁。limit 預設值 20。offset 與 cursor 都有設的情況下優先使用 cursor。
 *    security:
 *      - accessToken: []
 *    parameters:
 *      - $ref: '#/components/parameters/limit'
 *      - $ref: '#/components/parameters/offset'
 *      - $ref: '#/components/parameters/cursor'
 *    responses:
 *      "200":
 *        description: user data
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/getAllUsers'
 *      "401":
 *        $ref: '#/components/responses/unauthorizedError'
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
userRouter.get('/', auth, paginationAndSearchValidator, userController.getUsers)

/**
 *  @swagger
 *  /api/v1/users/{userId}:
 *  get:
 *    tags: [Users]
 *    summary: 取得單一使用者資料
 *    description: 根據使用者 id 取得基本資料
 *    parameters:
 *      - name: userId
 *        in: path
 *        description: 使用者 id
 *        example: 1
 *    responses:
 *      "200":
 *        description: specific user data
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
userRouter.get('/:userId', paramValidator, userController.getUser)

/**
 *  @swagger
 *  /api/v1/users/{userId}:
 *  patch:
 *    tags: [Users]
 *    summary: 修改使用者資料
 *    description: 使用者本身或管理員可更改資料，role 則只有管理員可以改
 *    security:
 *      - accessToken: []
 *    parameters:
 *      - name: userId
 *        in: path
 *        description: 使用者 id
 *        example: 1
 *        required: true
 *    requestBody:
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            $ref: '#/components/schemas/editUser'
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/editUser'
 *    responses:
 *      "200":
 *        description: user_id 1 is updated
 *      "400":
 *        description: invalid input
 *      "401":
 *        $ref: '#/components/responses/unauthorizedError'
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
userRouter.patch('/:userId', auth, paramValidator, editUserValidator, userController.editUser)

/**
 *  @swagger
 *  /api/v1/users/{userId}/todos:
 *  get:
 *    tags: [Users, Todos]
 *    summary: 取得某使用者下的所有 todo
 *    description: 單純拿使用者底下的所有 todo，無分頁功能
 *    security:
 *      - accessToken: []
 *    parameters:
 *      - name: userId
 *        in: path
 *        description: 使用者 id
 *        example: 1
 *        required: true
 *    responses:
 *      "200":
 *        description: get todos
 *      "401":
 *        $ref: '#/components/responses/unauthorizedError'
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
userRouter.get('/:userId/todos', auth, paramValidator, todoController.getTodos)

/**
 *  @swagger
 *  /api/v1/users/{userId}/todos:
 *  post:
 *    tags: [Users, Todos]
 *    summary: 新增 todo
 *    description: 新增 todo 到使用者底下
 *    security:
 *      - accessToken: []
 *    parameters:
 *      - name: userId
 *        in: path
 *        description: 使用者 id
 *        example: 1
 *        required: true
 *    requestBody:
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            $ref: '#/components/schemas/postTodo'
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/postTodo'
 *    responses:
 *      "200":
 *        description: post todo
 *      "401":
 *        $ref: '#/components/responses/unauthorizedError'
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
userRouter.post('/:userId/todos', auth, paramValidator, postTodoValidator, todoController.postTodo)

/**
 *  @swagger
 *  /api/v1/users/{userId}/todos/{todoId}:
 *  patch:
 *    tags: [Users, Todos]
 *    summary: 編輯 todo
 *    description: 編輯使用者底下的 todo
 *    security:
 *      - accessToken: []
 *    parameters:
 *      - name: userId
 *        in: path
 *        description: 使用者 id
 *        example: 1
 *        required: true
 *      - name: todoId
 *        in: path
 *        description: todo id
 *        example: 1
 *        required: true
 *    requestBody:
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            $ref: '#/components/schemas/postTodo'
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/postTodo'
 *    responses:
 *      "200":
 *        description: edit todo
 *      "401":
 *        $ref: '#/components/responses/unauthorizedError'
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
userRouter.patch('/:userId/todos/:todoId', auth, paramValidator, editTodoValidator, todoController.updateTodo)

/**
 *  @swagger
 *  /api/v1/users/{userId}/todos/{todoId}:
 *  delete:
 *    tags: [Users, Todos]
 *    summary: 刪除 todo
 *    description: 刪除使用者底下的 todo
 *    security:
 *      - accessToken: []
 *    parameters:
 *      - name: userId
 *        in: path
 *        description: 心得作者 id
 *        required: true
 *      - name: todoId
 *        in: path
 *        description: todo id
 *        required: true
 *    responses:
 *      "200":
 *        description: delete todo
 *      "401":
 *        $ref: '#/components/responses/unauthorizedError'
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
userRouter.delete('/:userId/todos/:todoId', auth, paramValidator, todoController.deleteTodo)

/**
 *  @swagger
 *  /api/v1/users/{userId}/articles:
 *  get:
 *    tags: [Users, Articles]
 *    summary: 取得屬於使用者的所有心得
 *    description: 取得心得之中 authorId = userId 的所有心得
 *    parameters:
 *      - name: userId
 *        in: path
 *        description: 心得作者 id
 *        example: 1
 *        required: true
 *      - $ref: '#/components/parameters/limit'
 *      - $ref: '#/components/parameters/offset'
 *      - $ref: '#/components/parameters/cursor'
 *      - $ref: '#/components/parameters/tag'
 *    responses:
 *      "200":
 *        description: articles wrote by user ${userId}
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
userRouter.get('/:userId/articles', paramValidator, paginationAndSearchValidator, userController.getArticles)

/**
 *  @swagger
 *  /api/v1/users/{userId}/liked-articles:
 *  get:
 *    tags: [Users, Articles]
 *    summary: 取得使用者按讚的心得
 *    description: 取得使用者按過讚的所有心得
 *    parameters:
 *      - name: userId
 *        in: path
 *        description: 使用者 id
 *        example: 1
 *        required: true
 *      - $ref: '#/components/parameters/limit'
 *      - $ref: '#/components/parameters/offset'
 *      - $ref: '#/components/parameters/cursor'
 *      - $ref: '#/components/parameters/tag'
 *    responses:
 *      "200":
 *        description: articles liked by user ${userId}
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
userRouter.get('/:userId/liked-articles', paramValidator, paginationAndSearchValidator, userController.getLikedArticles)

/**
 *  @swagger
 *  /api/v1/users/{userId}/liked-articles:
 *  post:
 *    tags: [Users, Articles]
 *    summary: 使用者對心得按讚
 *    description: 使用者對心得按讚
 *    security:
 *      - accessToken: []
 *    requestBody:
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            $ref: '#/components/schemas/postLikedArticle'
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/postLikedArticle'
 *    responses:
 *      "200":
 *        description: like association was created
 *      "401":
 *        $ref: '#/components/responses/unauthorizedError'
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
userRouter.post('/:userId/liked-articles', auth, paramValidator, likedArticleValidator, userController.likeArticle)

/**
 *  @swagger
 *  /api/v1/users/{userId}/liked-articles/{articleId}:
 *  delete:
 *    tags: [Users, Articles]
 *    summary: 使用者對心得取消按讚
 *    description: 使用者對心得取消按讚
 *    security:
 *      - accessToken: []
 *    parameters:
 *      - name: userId
 *        in: path
 *        description: 心得作者 id
 *        example: 1
 *        required: true
 *      - name: articleId
 *        in: path
 *        description: 欲取消按讚的心得 id
 *        example: 1
 *    responses:
 *      "200":
 *        description: like association was deleted
 *      "401":
 *        $ref: '#/components/responses/unauthorizedError'
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
userRouter.delete('/:userId/liked-articles/:articleId', auth, paramValidator, userController.unlikeArticle)

/**
 *  @swagger
 *  /api/v1/users/{userId}/trails:
 *  get:
 *    tags: [Users, Trails]
 *    summary: 取得屬於使用者的所有步道
 *    description: 取得屬於使用者的所有步道
 *    parameters:
 *      - name: userId
 *        in: path
 *        description: 步道作者 id
 *        example: 1
 *        required: true
 *      - $ref: '#/components/parameters/limit'
 *      - $ref: '#/components/parameters/offset'
 *      - $ref: '#/components/parameters/cursor'
 *      - $ref: '#/components/parameters/location'
 *      - $ref: '#/components/parameters/difficult'
 *      - $ref: '#/components/parameters/altitude'
 *      - $ref: '#/components/parameters/length'
 *    responses:
 *      "200":
 *        description: trails wrote by user ${userId}
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
userRouter.get('/:userId/trails', paramValidator, paginationAndSearchValidator, userController.getTrails)

/**
 *  @swagger
 *  /api/v1/users/{userId}/collected-trails:
 *  get:
 *    tags: [Users, Trails]
 *    summary: 取得使用者收藏的步道
 *    description: 取得使用者收藏的步道
 *    parameters:
 *      - name: userId
 *        in: path
 *        description: 使用者 id
 *        example: 1
 *        required: true
 *      - $ref: '#/components/parameters/limit'
 *      - $ref: '#/components/parameters/offset'
 *      - $ref: '#/components/parameters/cursor'
 *      - $ref: '#/components/parameters/location'
 *      - $ref: '#/components/parameters/difficult'
 *      - $ref: '#/components/parameters/altitude'
 *      - $ref: '#/components/parameters/length'
 *    responses:
 *      "200":
 *        description: trails collected by user ${userId}
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
userRouter.get('/:userId/collected-trails', paramValidator, paginationAndSearchValidator, userController.getCollectedTrails)

/**
 *  @swagger
 *  /api/v1/users/{userId}/collected-trails:
 *  post:
 *    tags: [Users, Trails]
 *    summary: 使用者收藏步道
 *    description: 使用者收藏步道
 *    security:
 *      - accessToken: []
 *    parameters:
 *      - name: userId
 *        in: path
 *        description: 使用者 id
 *        example: 1
 *        required: true
 *    requestBody:
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            $ref: '#/components/schemas/postCollectedTrail'
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/postCollectedTrail'
 *    responses:
 *      "200":
 *        description: collect association was created
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
userRouter.post('/:userId/collected-trails', auth, paramValidator, collectedTrailsValidator, userController.collectTrail)

/**
 *  @swagger
 *  /api/v1/users/{userId}/collected-trails/{trailId}:
 *  delete:
 *    tags: [Users, Trails]
 *    summary: 使用者取消收藏步道
 *    description: 使用者取消收藏步道
 *    security:
 *      - accessToken: []
 *    parameters:
 *      - name: userId
 *        in: path
 *        description: 使用者 id
 *        example: 1
 *        required: true
 *      - name: trailId
 *        in: path
 *        description: 欲取消收藏的步道 id
 *        example: 1
 *        required: true
 *    requestBody:
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            $ref: '#/components/schemas/postCollectedTrail'
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/postCollectedTrail'
 *    responses:
 *      "200":
 *        description: collect association was created
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
userRouter.delete('/:userId/collected-trails/:trailId', auth, paramValidator, userController.cancelCollectTrail)

userRouter.all('*', (req, res) => res.status(404).json(PATH_ERROR))
module.exports = userRouter
