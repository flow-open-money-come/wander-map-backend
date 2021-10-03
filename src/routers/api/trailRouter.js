const trailRouter = require('express').Router()
const trailsController = require('../../controllers/trails')
const { postTrailsValidator } = require('../../middlewares/validators')

trailRouter.get('/', trailsController.getAll)
trailRouter.get('/:id', trailsController.getOne)
trailRouter.post('/', postTrailsValidator, trailsController.add)
trailRouter.patch('/:id', postTrailsValidator, trailsController.update)
trailRouter.delete('/:id', trailsController.delete)

trailRouter.all('*', (req, res) => {
  res.json('here is api trail all')
})
module.exports = trailRouter
