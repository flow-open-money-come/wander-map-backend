const articleRouter = require('express').Router()
const articleController = require('../../controllers/articles')
const auth = require('../../middlewares/auth')
const {
  paramValidator,
  articleValidator,
  updateArticleValidator,
  paginationAndSearchValidator
} = require('../../middlewares/validators')
const { PATH_ERROR } = require('../../constants/errors')

articleRouter.post('/', auth, articleValidator, articleController.addArticle)
articleRouter.get('/', paginationAndSearchValidator, articleController.getArticles)
articleRouter.get('/hot', paginationAndSearchValidator, articleController.getHotArticles)

articleRouter.get('/deleted', paginationAndSearchValidator, articleController.getDeletedArticles)
articleRouter.patch('/deleted/:articleId/', paramValidator, articleController.recoverDeletedArticle)

articleRouter.get('/:articleId', paramValidator, articleController.getArticle)
articleRouter.patch(
  '/:articleId',
  auth,
  paramValidator,
  updateArticleValidator,
  articleController.updateArticle
)
articleRouter.delete('/:articleId', auth, paramValidator, articleController.deleteArticle)
articleRouter.post('/:articleId/messages', auth, paramValidator, articleController.addMessage)
articleRouter.delete(
  '/:articleId/messages/:messageId',
  auth,
  paramValidator,
  articleController.deleteMessage
)
articleRouter.patch(
  '/:articleId/messages/:messageId',
  auth,
  paramValidator,
  articleController.updateMessage
)
articleRouter.delete('/:articleId', auth, paramValidator, articleController.deleteArticle)
articleRouter.get(
  '/:articleId/messages',
  paramValidator,
  paginationAndSearchValidator,
  articleController.getMessages
)

articleRouter.post('/:articleId/relate-trail', paramValidator, articleController.relateTrail)
articleRouter.delete(
  '/:articleId/relate-trail/:trailId',
  paramValidator,
  articleController.unRelateTrail
)

articleRouter.all('*', (req, res) => res.status(400).json(PATH_ERROR))

module.exports = articleRouter
