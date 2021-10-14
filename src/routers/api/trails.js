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

trailRouter.get('/deleted', paginationAndSearchValidator, trailsController.getDeletedTrails)
trailRouter.patch('/deleted/:trailId/', paramValidator, trailsController.recoverDeletedTrail)

trailRouter.get('/:trailId', paramValidator, trailsController.getOne)
trailRouter.post('/', postTrailsValidator, trailsController.add)
trailRouter.patch('/:trailId', paramValidator, postTrailsValidator, trailsController.update)
trailRouter.delete('/:trailId', paramValidator, trailsController.delete)

trailRouter.get('/:trailId/articles', paramValidator, trailsController.getArticles)

trailRouter.get('/:trailId/comments', paramValidator, trailsController.getComments)
trailRouter.post('/:trailId/comments', paramValidator, trailsController.addComment)
trailRouter.patch('/:trailId/comments/:commentId', paramValidator, trailsController.updateComment)
trailRouter.delete('/:trailId/comments/:commentId', paramValidator, trailsController.deleteComment)

trailRouter.all('*', (req, res) => res.status(400).json(PATH_ERROR))

module.exports = trailRouter
