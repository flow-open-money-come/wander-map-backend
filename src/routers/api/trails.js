const trailRouter = require('express').Router()
const trailsController = require('../../controllers/trails')
const {
  postTrailsValidator,
  paginationAndSearchValidator
} = require('../../middlewares/validators')


trailRouter.get('/', paginationAndSearchValidator, trailsController.getAll)
trailRouter.get('/hot', trailsController.getHotTrails)
trailRouter.get('/:id', trailsController.getOne)
trailRouter.post('/', postTrailsValidator, trailsController.add)
trailRouter.patch('/:id', postTrailsValidator, trailsController.update)
trailRouter.delete('/:id', trailsController.delete)
trailRouter.get('/:id/comments', trailsController.getComments)
trailRouter.all('*', (req, res) => {
  res.json('here is api trail all')
})
module.exports = trailRouter
