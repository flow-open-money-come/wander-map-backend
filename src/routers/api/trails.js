const trailRouter = require('express').Router()
const { PATH_ERROR } = require('../../constants/errors')
const trailsController = require('../../controllers/trails')
const auth = require('../../middlewares/auth')
const { paramValidator, postTrailsValidator, paginationAndSearchValidator } = require('../../middlewares/validators')

/**
 * @swagger
 * /api/v1/trails:
 *  get:
 *    tags: [Trails]
 *    summary: 取得所有步道資料
 *
 *    description: 可在 URL 上帶 limit、offset、cursor、location、altitude、length、difficult、search。limit 預設值 20。offset 與 cursor 都有設的情況下優先使用 cursor。其餘作為條件的篩選與搜尋。
 *    parameters:
 *      - $ref: '#/components/parameters/limit'
 *      - $ref: '#/components/parameters/offset'
 *      - $ref: '#/components/parameters/cursor'
 *      - $ref: '#/components/parameters/location'
 *      - $ref: '#/components/parameters/difficult'
 *      - $ref: '#/components/parameters/altitude'
 *      - $ref: '#/components/parameters/length'
 *      - $ref: '#/components/parameters/search'
 *    responses:
 *      "200":
 *        description: trails collected by user ${userId}
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
trailRouter.get('/', paginationAndSearchValidator, trailsController.getAll)

/**
 * @swagger
 * /api/v1/trails/hot/{Amount}:
 *  get:
 *    tags: [Trails]
 *    summary: 取得熱門步道
 *    description: 依照收藏數，取得前 N 筆（Amount）步道資料。
 *    parameters:
 *       - name: Amount
 *         in: path
 *         description: 前 n 筆資料
 *         example: 3
 *         required: true
 *    responses:
 *      "200":
 *        description: get top-${Amount} hot trails
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
trailRouter.get('/hot/:Amount', trailsController.getHotTrails)

/**
 *  @swagger
 *  /api/v1/trails/deleted:
 *  get:
 *    tags: [Trails]
 *    summary: 取得已刪除步道
 *    description: 取得所有已刪除步道（軟刪除）
 *    security:
 *      - accessToken: []
 *    parameters:
 *      - $ref: '#/components/parameters/limit'
 *      - $ref: '#/components/parameters/offset'
 *      - $ref: '#/components/parameters/cursor'
 *      - $ref: '#/components/parameters/search'
 *    responses:
 *      "200":
 *        description: get all deleted trails
 *      "401":
 *        $ref: '#/components/responses/unauthorizedError'
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
trailRouter.get('/deleted', auth, paginationAndSearchValidator, trailsController.getDeletedTrails)

/**
 *  @swagger
 *  /api/v1/trails/deleted/{trailId}:
 *  patch:
 *    tags: [Trails]
 *    summary: 恢復已刪除步道
 *    description: 恢復已刪除 trailId 步道
 *    security:
 *      - accessToken: []
 *    parameters:
 *      - name: trailId
 *        in: path
 *        description: 步道 id
 *        required: true
 *    responses:
 *      "200":
 *        description: recover trail-${trailId}
 *      "401":
 *        $ref: '#/components/responses/unauthorizedError'
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
trailRouter.patch('/deleted/:trailId/', auth, paramValidator, trailsController.recoverDeletedTrail)

/**
 *  @swagger
 *  /api/v1/trails/{trailId}:
 *  get:
 *    tags: [Trails]
 *    summary: 取得單一步道資料
 *    description: 根據步道 id 取得步道資料
 *    parameters:
 *      - name: trailId
 *        in: path
 *        description: 步道 id
 *        example: 99
 *    responses:
 *      "200":
 *        description: get trail-${trailId} info
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
trailRouter.get('/:trailId', paramValidator, trailsController.getOne)

/**
 *  @swagger
 *  /api/v1/trails/:
 *  post:
 *    tags: [Trails]
 *    summary: 新增步道
 *    description: 依照表單內容，新增步道
 *    security:
 *      - accessToken: []
 *    requestBody:
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            $ref: '#/components/schemas/postTrail'
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/postTrail'
 *    responses:
 *      "200":
 *        description: add trail {trails}
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/postTrailResponse'
 *      "401":
 *        $ref: '#/components/responses/unauthorizedError'
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
trailRouter.post('/', auth, postTrailsValidator, trailsController.add)

/**
 *  @swagger
 *  /api/v1/trails/{trailId}:
 *  patch:
 *    tags: [Trails]
 *    summary: 編輯步道
 *    description: 依照表單內容，編輯步道
 *    parameters:
 *     - name: trailId
 *       in: path
 *       description: 步道 id
 *       example: 99
 *    security:
 *      - accessToken: []
 *    requestBody:
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            $ref: '#/components/schemas/postTrail'
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/postTrail'
 *    responses:
 *      "200":
 *        description: update trail-${trailId}
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/postTrailResponse'
 *      "401":
 *        $ref: '#/components/responses/unauthorizedError'
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
trailRouter.patch('/:trailId', auth, paramValidator, postTrailsValidator, trailsController.update)

/**
 *  @swagger
 *  /api/v1/trails/{trailId}:
 *  delete:
 *    tags: [Trails]
 *    summary: 刪除步道
 *    description: 刪除 {trailId} 步道
 *    security:
 *      - accessToken: []
 *    parameters:
 *      - name: trailId
 *        in: path
 *        description: 步道 id
 *        required: true
 *    responses:
 *      "200":
 *        description: trail-${trailId} deleted
 *      "401":
 *        $ref: '#/components/responses/unauthorizedError'
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
trailRouter.delete('/:trailId', auth, paramValidator, trailsController.delete)

/**
 *  @swagger
 *  /api/v1/trails/{trailId}/articles:
 *  get:
 *    tags: [Articles]
 *    summary: 取得關於該步道的所有心得
 *    description: 取得{trailId}步道的所有相關心得
 *    parameters:
 *      - name: trailId
 *        in: path
 *        description: 相關步道 trail ID
 *        example: 1
 *        required: true
 *      - $ref: '#/components/parameters/limit'
 *      - $ref: '#/components/parameters/offset'
 *      - $ref: '#/components/parameters/cursor'
 *    responses:
 *      "200":
 *        description: articles of trail-${trailId}
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
trailRouter.get('/:trailId/articles', paramValidator, paginationAndSearchValidator, trailsController.getArticles)

/**
 *  @swagger
 *  /api/v1/trails/{trailId}/comments:
 *  get:
 *    tags: [Trails]
 *    summary: 取得屬於該步道下評論區的所有留言
 *    description: 取得{trailId}步道下評論區的所有留言
 *    parameters:
 *      - name: trailId
 *        in: path
 *        description: 步道 ID
 *        example: 1
 *        required: true
 *    responses:
 *      "200":
 *        description: get trail-${trailId} comments
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
trailRouter.get('/:trailId/comments', paramValidator, trailsController.getComments)

/**
 *  @swagger
 *  /api/v1/trails/{trailId}/comments:
 *  post:
 *    tags: [Trails]
 *    summary: 新增該步道下評論
 *    description: 針對 trailId 步道新增評論留言
 *    security:
 *      - accessToken: []
 *    requestBody:
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            $ref: '#/components/schemas/postTrailComment'
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/postTrailComment'
 *    responses:
 *      "200":
 *        description: leave trail-${trailId} comment ${content}
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/postTrailCommentResponse'
 *      "401":
 *        $ref: '#/components/responses/unauthorizedError'
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
trailRouter.post('/:trailId/comments', paramValidator, trailsController.addComment)

/**
 *  @swagger
 *  /api/v1/trails/{trailId}/comments/{commentId}:
 *  patch:
 *    tags: [Trails]
 *    summary: 修改評論區的單一留言
 *    description: 修改 trailId 步道下評論區的留言 commentId
 *    security:
 *      - accessToken: []
 *    parameters:
 *      - name: trailId
 *        in: path
 *        description: 步道 ID
 *        example: 1
 *        required: true
 *      - name: commentId
 *        in: path
 *        description: 欲刪除之 comment ID
 *        example: 1
 *        required: true
 *    requestBody:
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            $ref: '#/components/schemas/editTrailComment'
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/editTrailComment'
 *    responses:
 *      "200":
 *        description: update trail-${trailId} comment ${content}
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/editTrailCommentResponse'
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
trailRouter.patch('/:trailId/comments/:commentId', paramValidator, trailsController.updateComment)

/**
 *  @swagger
 *  /api/v1/trails/{trailId}/comments/{commentId}:
 *  delete:
 *    tags: [Trails]
 *    summary: 刪除評論區的單一留言
 *    description: 刪除{trailId}步道下評論區的留言{commentId}
 *    security:
 *      - accessToken: []
 *    parameters:
 *      - name: trailId
 *        in: path
 *        description: 步道 ID
 *        example: 1
 *        required: true
 *      - name: commentId
 *        in: path
 *        description: 欲刪除之 comment ID
 *        example: 1
 *        required: true
 *    responses:
 *      "200":
 *        description: delete comment-${commentId}
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
trailRouter.delete('/:trailId/comments/:commentId', paramValidator, trailsController.deleteComment)

trailRouter.all('*', (req, res) => res.status(400).json(PATH_ERROR))

module.exports = trailRouter
