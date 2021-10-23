const articleRouter = require('express').Router()
const articleController = require('../../controllers/articles')
const auth = require('../../middlewares/auth')
const { paramValidator, articleValidator, updateArticleValidator, paginationAndSearchValidator } = require('../../middlewares/validators')
const { PATH_ERROR } = require('../../constants/errors')

/**
 *  @swagger
 *  /api/v1/articles:
 *  post:
 *    tags: [Articles]
 *    summary: 新增心得
 *    description: 新增心得
 *    security:
 *      - accessToken: []
 *    requestBody:
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            $ref: '#/components/schemas/postArticle'
 *          encoding:
 *            tags:
 *              style: form
 *              explode: true
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/postArticle'
 *    responses:
 *      "201":
 *        description: post article
 *      "401":
 *        $ref: '#/components/responses/unauthorizedError'
 *      "403":
 *        $ref: '#/components/responses/forbiddenAction'
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
articleRouter.post('/', auth, articleValidator, articleController.addArticle)

/**
 *  @swagger
 *  /api/v1/articles:
 *  get:
 *    tags: [Articles]
 *    summary: 取得所有心得
 *    description: 取得所有心得
 *    parameters:
 *      - $ref: '#/components/parameters/limit'
 *      - $ref: '#/components/parameters/offset'
 *      - $ref: '#/components/parameters/cursor'
 *      - $ref: '#/components/parameters/tag'
 *    responses:
 *      "200":
 *        description: get articles
 *        headers:
 *          x-total-count:
 *            $ref: '#/components/headers/x-total-count'
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
articleRouter.get('/', paginationAndSearchValidator, articleController.getArticles)

/**
 *  @swagger
 *  /api/v1/articles/hot:
 *  get:
 *    tags: [Articles]
 *    summary: 取得按讚最多的心得
 *    description: 取得按讚最多的心得
 *    parameters:
 *      - $ref: '#/components/parameters/limit'
 *      - $ref: '#/components/parameters/offset'
 *      - $ref: '#/components/parameters/cursor'
 *      - $ref: '#/components/parameters/tag'
 *    responses:
 *      "200":
 *        description: get hot articles
 *        headers:
 *          x-total-count:
 *            $ref: '#/components/headers/x-total-count'
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
articleRouter.get('/hot', paginationAndSearchValidator, articleController.getHotArticles)

/**
 *  @swagger
 *  /api/v1/articles/deleted:
 *  get:
 *    tags: [Articles]
 *    summary: 取得所有已刪除心得
 *    description: 取得所有已刪除心得
 *    responses:
 *      "200":
 *        description: get all deleted articles
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
articleRouter.get('/deleted', auth, paginationAndSearchValidator, articleController.getDeletedArticles)

/**
 *  @swagger
 *  /api/v1/articles/deleted/{articleId}:
 *  patch:
 *    tags: [Articles]
 *    summary: 恢復某已刪除的心得
 *    description: 恢復某已刪除的心得
 *    parameters:
 *      - name: articleId
 *        in: path
 *        description: 心得 id
 *        required: true
 *    responses:
 *      "200":
 *        description: recover article-${articleId}
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
articleRouter.patch('/deleted/:articleId/', auth, paramValidator, articleController.recoverDeletedArticle)

/**
 *  @swagger
 *  /api/v1/articles/{articleId}:
 *  get:
 *    tags: [Articles]
 *    summary: 取得單一心得
 *    description: 取得單一心得
 *    parameters:
 *      - name: articleId
 *        in: path
 *        description: 心得 id
 *        required: true
 *    responses:
 *      "200":
 *        description: get article-id ${articleId}
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
articleRouter.get('/:articleId', paramValidator, articleController.getArticle)

/**
 *  @swagger
 *  /api/v1/articles/{articleId}:
 *  patch:
 *    tags: [Articles]
 *    summary: 修改心得
 *    description: 修改心得
 *    security:
 *      - accessToken: []
 *    parameters:
 *      - name: articleId
 *        in: path
 *        description: 心得 id
 *        required: true
 *    requestBody:
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            $ref: '#/components/schemas/editArticle'
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/editArticle'
 *    responses:
 *      "200":
 *        description: update article
 *      "401":
 *        $ref: '#/components/responses/unauthorizedError'
 *      "403":
 *        $ref: '#/components/responses/forbiddenAction'
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
articleRouter.patch('/:articleId', auth, paramValidator, updateArticleValidator, articleController.updateArticle)

/**
 *  @swagger
 *  /api/v1/articles/{articleId}:
 *  delete:
 *    tags: [Articles]
 *    summary: 刪除心得
 *    description: 刪除心得
 *    security:
 *      - accessToken: []
 *    parameters:
 *      - name: articleId
 *        in: path
 *        description: 欲刪除的心得 id
 *        required: true
 *    responses:
 *      "200":
 *        description: delete article ${articleId}
 *      "401":
 *        $ref: '#/components/responses/unauthorizedError'
 *      "403":
 *        $ref: '#/components/responses/forbiddenAction'
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
articleRouter.delete('/:articleId', auth, paramValidator, articleController.deleteArticle)

/**
 *  @swagger
 *  /api/v1/articles/{articleId}/messages:
 *  get:
 *    tags: [Articles]
 *    summary: 取得某心得的留言
 *    description: 取得某心得的留言
 *    parameters:
 *      - name: articleId
 *        in: path
 *        description: 心得 id
 *        required: true
 *    responses:
 *      "200":
 *        description: get message
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
articleRouter.get('/:articleId/messages', paramValidator, paginationAndSearchValidator, articleController.getMessages)

/**
 *  @swagger
 *  /api/v1/articles/{articleId}/messages:
 *  post:
 *    tags: [Articles]
 *    summary: 新增某心得的留言
 *    description: 新增某心得的留言
 *    security:
 *      - accessToken: []
 *    parameters:
 *      - name: articleId
 *        in: path
 *        description: 心得 id
 *        required: true
 *    requestBody:
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            $ref: '#/components/schemas/postMessage'
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/postMessage'
 *    responses:
 *      "200":
 *        description: post message
 *      "401":
 *        $ref: '#/components/responses/unauthorizedError'
 *      "403":
 *        $ref: '#/components/responses/forbiddenAction'
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
articleRouter.post('/:articleId/messages', auth, paramValidator, articleController.addMessage)

/**
 *  @swagger
 *  /api/v1/articles/{articleId}/messages/{messageId}:
 *  patch:
 *    tags: [Articles]
 *    summary: 更新某心得的留言
 *    description: 更新某心得的留言
 *    security:
 *      - accessToken: []
 *    parameters:
 *      - name: articleId
 *        in: path
 *        description: 心得 id
 *        required: true
 *      - name: messageId
 *        in: path
 *        description: 留言 id
 *        required: true
 *    requestBody:
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            $ref: '#/components/schemas/postMessage'
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/postMessage'
 *    responses:
 *      "200":
 *        description: update message
 *      "401":
 *        $ref: '#/components/responses/unauthorizedError'
 *      "403":
 *        $ref: '#/components/responses/forbiddenAction'
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
articleRouter.patch('/:articleId/messages/:messageId', auth, paramValidator, articleController.updateMessage)

/**
 *  @swagger
 *  /api/v1/articles/{articleId}/messages/{messageId}:
 *  delete:
 *    tags: [Articles]
 *    summary: 刪除某心得的留言
 *    description: 刪除某心得的留言
 *    security:
 *      - accessToken: []
 *    parameters:
 *      - name: articleId
 *        in: path
 *        description: 心得 id
 *        required: true
 *      - name: messageId
 *        in: path
 *        description: 留言 id
 *        required: true
 *    responses:
 *      "200":
 *        description: delete message
 *      "401":
 *        $ref: '#/components/responses/unauthorizedError'
 *      "403":
 *        $ref: '#/components/responses/forbiddenAction'
 *      "500":
 *        $ref: '#/components/responses/internalError'
 */
articleRouter.delete('/:articleId/messages/:messageId', auth, paramValidator, articleController.deleteMessage)

articleRouter.all('*', (req, res) => res.status(400).json(PATH_ERROR))

module.exports = articleRouter
