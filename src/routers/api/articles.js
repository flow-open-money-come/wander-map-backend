const articleController = require('../../controllers/articles')
const articleRouter = require('express').Router()

articleRouter.post('/', articleController.addArticle)
articleRouter.get('/', articleController.getArticles)
articleRouter.get('/hot', articleController.getHotArticles)
articleRouter.get('/:id', articleController.getArticle)
articleRouter.patch('/:id', articleController.updateArticle)
articleRouter.delete('/:id', articleController.deleteArticle)
articleRouter.get('/:id/comments', articleController.getComments)

articleRouter.all('*', (req, res) => {
  res.json('here is api article all')
})

module.exports = articleRouter
