const articleController = require('../../controllers/articles')
const articleRouter = require('express').Router()
const { PATH_ERROR } = require('../../constants/errors')
const { paramValidator, paginationAndSearchValidator } = require('../../middlewares/validators')

articleRouter.post('/', articleController.addArticle)
articleRouter.get('/', paginationAndSearchValidator, articleController.getArticles)
articleRouter.get('/hot', paramValidator, articleController.getHotArticles)
articleRouter.get('/:id', paramValidator, articleController.getArticle)
articleRouter.patch('/:id', paramValidator, articleController.updateArticle)
articleRouter.delete('/:id', paramValidator, articleController.deleteArticle)
articleRouter.get('/:id/comments', paramValidator, articleController.getComments)

articleRouter.post('/:id/relate-trail', paramValidator, articleController.relateTrail)
articleRouter.delete('/:id/relate-trail', paramValidator, articleController.unRelateTrail)


articleRouter.all('*', (req, res) => res.status(400).json(PATH_ERROR))

module.exports = articleRouter
