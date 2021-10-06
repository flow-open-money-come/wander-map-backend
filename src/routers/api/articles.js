const articleController = require('../../controllers/articles')
const articleRouter = require('express').Router()
const auth = require('../../middlewares/auth')
const { paginationAndSearchValidator } = require('../../middlewares/validators')
const { PATH_ERROR } = require('../../constants/errors')

articleRouter.post('/', auth, articleController.addArticle)
articleRouter.get('/', paginationAndSearchValidator, articleController.getArticles)
articleRouter.get('/hot', paginationAndSearchValidator, articleController.getHotArticles)
articleRouter.get('/:id', articleController.getArticle)
articleRouter.patch('/:id', articleController.updateArticle)
articleRouter.delete('/:id', articleController.deleteArticle)
articleRouter.get('/:id/messages', articleController.getMessages)

articleRouter.all('*', (req, res) => res.status(404).json(PATH_ERROR))

module.exports = articleRouter
