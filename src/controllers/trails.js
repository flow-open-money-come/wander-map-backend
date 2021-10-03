const trailsModel = require('../models/trails')

const trailsController = {
  getAll: async (req, res, next) => {
    try {
      const results = await trailsModel.findAll()
      res.json({
        success: true,
        message: `get all trails`,
        data: results
      })
    } catch (err) {
      next(err)
    }
  },

  getOne: async (req, res, next) => {
    const { id } = req.params
    try {
      const results = await trailsModel.findOne(id)
      res.json({
        success: true,
        message: `get trail-${id} info`,
        data: results
      })
    } catch (err) {
      next(err)
    }
  },

  get: async (req, res, next) => {
    const { limit, season, id } = req.query
    try {
      const results = await trailsModel.find(req.query)
      res.json({
        success: true,
        message: [limit, season, id],
        data: results
      })
    } catch (err) {
      next(err)
    }
  },

  add: async (req, res, next) => {
    const content = req.body
    try {
      const results = await trailsModel.add(content)
      res.json({
        success: true,
        message: `add trail-${results.insertId}`,
        data: results
      })
    } catch (err) {
      next(err)
    }
  },

  update: async (req, res, next) => {
    const { id } = req.params
    const content = req.body
    try {
      const results = await trailsModel.update(id, content)
      res.json({
        success: true,
        message: `update trail-${id}`,
        data: results
      })
    } catch (err) {
      next(err)
    }
  },

  delete: async (req, res, next) => {
    const { id } = req.params
    try {
      const results = await trailsModel.delete(id)
      res.json({
        success: true,
        message: `trail-${id} deleted`,
        data: results
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = trailsController
