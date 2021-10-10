const articleRouter = require('express').Router()

const articleController = require('../../controllers/articles')
const auth = require('../../middlewares/auth')
const {
  paramValidator,
  articleValidator,
  updateArticleValidator,
  paginationAndSearchValidator,
} = require('../../middlewares/validators')
const { PATH_ERROR } = require('../../constants/errors')

articleRouter.post('/', auth, articleValidator, articleController.addArticle)
articleRouter.get(
  '/',
  paginationAndSearchValidator,
  articleController.getArticles
)
articleRouter.get(
  '/hot',
  paginationAndSearchValidator,
  articleController.getHotArticles
)
articleRouter.get('/:articleId', paramValidator, articleController.getArticle)
articleRouter.patch(
  '/:articleId',
  auth,
  paramValidator,
  updateArticleValidator,
  articleController.updateArticle
)
articleRouter.delete(
  '/:articleId',
  auth,
  paramValidator,
  articleController.deleteArticle
)
articleRouter.get(
  '/:articleId/messages',
  paramValidator,
  articleController.getMessages
)
articleRouter.post(
  '/:articleId/messages',
  auth,
  paramValidator,
  articleController.addMessage
)
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

articleRouter.all('*', (req, res) => res.status(404).json(PATH_ERROR))

module.exports = articleRouter
