const articleController = require('../../controllers/articles')
const articleRouter = require('express').Router()
const { PATH_ERROR } = require('../../constants/errors')

articleRouter.post('/', articleController.addArticle)
articleRouter.get('/', articleController.getArticles)
articleRouter.get('/hot', articleController.getHotArticles)
articleRouter.get('/:id', articleController.getArticle)
articleRouter.patch('/:id', articleController.updateArticle)
articleRouter.delete('/:id', articleController.deleteArticle)
articleRouter.get('/:id/messages', articleController.getMessages)

articleRouter.all('*', (req, res) => res.status(404).json(PATH_ERROR))

module.exports = articleRouter
