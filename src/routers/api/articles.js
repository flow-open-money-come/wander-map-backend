const articleController = require('../../controllers/articles')
const articleRouter = require('express').Router()
const { PATH_ERROR } = require('../../constants/errors')
const {
  paramValidator,
  paginationAndSearchValidator,
} = require('../../middlewares/validators')

articleRouter.post('/', articleController.addArticle)
articleRouter.get(
  '/',
  paginationAndSearchValidator,
  articleController.getArticles
)
articleRouter.get('/hot', paramValidator, articleController.getHotArticles)
articleRouter.get('/:id', paramValidator, articleController.getArticle)
articleRouter.patch('/:id', paramValidator, articleController.updateArticle)
articleRouter.delete('/:id', paramValidator, articleController.deleteArticle)
articleRouter.get(
  '/:id/messages',
  paramValidator,
  articleController.getMessages
)
articleRouter.post(
  '/:id/messages',
  paramValidator,
  articleController.addMessage
)
articleRouter.delete(
  '/:id/messages/:messageId',
  paramValidator,
  articleController.deleteMessage
)
articleRouter.patch(
  '/:id/messages/:messageId',
  paramValidator,
  articleController.updateMessage
)

articleRouter.all('*', (req, res) => res.status(400).json(PATH_ERROR))

module.exports = articleRouter
