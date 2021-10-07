const trailRouter = require('express').Router()
const { PATH_ERROR } = require('../../constants/errors')
const trailsController = require('../../controllers/trails')
const {
  paramValidator,
  postTrailsValidator,
  paginationAndSearchValidator
} = require('../../middlewares/validators')

trailRouter.get('/', paginationAndSearchValidator, trailsController.getAll)
trailRouter.get('/hot/:Amount', trailsController.getHotTrails)
trailRouter.get('/:id', paramValidator, trailsController.getOne)
trailRouter.post('/', postTrailsValidator, trailsController.add)
trailRouter.patch('/:id', paramValidator, postTrailsValidator, trailsController.update)
trailRouter.delete('/:id', paramValidator, trailsController.delete)
trailRouter.get('/:id/comments', paramValidator, trailsController.getComments)

trailRouter.get('/:trailId/articles', paramValidator, trailsController.getArticles)


trailRouter.all('*', (req, res) => res.status(400).json(PATH_ERROR))

module.exports = trailRouter
