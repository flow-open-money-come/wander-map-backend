const trailsModel = require('../models/trails')
const articleModel = require('../models/articles')

const trailsController = {
  getAll: async (req, res, next) => {
    const { location, altitude, length, difficult, limit, offset, cursor, search } = req.query

    const options = {
      location,
      altitude,
      length,
      difficult,
      limit,
      offset,
      cursor,
      search,
    }

    Object.keys(options).forEach((value, index) => {
      if (!options[value]) {
        delete options[value]
      }
    })

    try {
      const results = await trailsModel.findAll(options)
      res.json({
        success: true,
        message: `get ${JSON.stringify(options)} trails`,
        data: results,
      })
    } catch (err) {
      next(err)
    }
  },

  getOne: async (req, res, next) => {
    const { id } = req.params
    try {
      const results = await trailsModel.findById(id)
      res.json({
        success: true,
        message: `get trail-${id} info`,
        data: results,
      })
    } catch (err) {
      next(err)
    }
  },

  getHotTrails: async (req, res, next) => {
    const { Amount } = req.params
    try {
      const results = await trailsModel.findByCollects(Number(Amount))
      res.json({
        success: true,
        message: `get top-${Amount} hot trails`,
        data: results,
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
        data: results,
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
        data: results,
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
        data: results,
      })
    } catch (err) {
      next(err)
    }
  },

  getComments: async (req, res, next) => {
    const { trailId } = req.params
    try {
      const results = await trailsModel.findCommentsByTrailId(trailId)
      res.json({
        success: true,
        message: `get trail-${trailId} comments`,
        data: results,
      })
    } catch (err) {
      next(err)
    }
  },

  addComment: async (req, res, next) => {
    const { trailId } = req.params
    const comment = req.body
    try {
      const results = await trailsModel.addCommentByTrailId(trailId, comment)
      res.json({
        success: true,
        message: `leave trail-${trailId} comment: ${comment.content}`,
        data: results,
      })
    } catch (err) {
      next(err)
    }
  },

  updateComment: async (req, res, next) => {
    const { commentId } = req.params
    const comment = req.body
    try {
      const results = await trailsModel.updateCommentByCommentId(commentId, comment)
      res.json({
        success: true,
        message: `update comment to: ${comment.content}`,
        data: results,
      })
    } catch (err) {
      next(err)
    }
  },

  deleteComment: async (req, res, next) => {
    const { commentId } = req.params
    try {
      const results = await trailsModel.deleteCommentByCommentId(commentId)
      res.json({
        success: true,
        message: `delete comment-${commentId}`,
        data: results,
      })
    } catch (err) {
      next(err)
    }
  },

  getArticles: async (req, res, next) => {
    const { trailId } = req.params
    const { limit, offset, cursor } = req.query

    const options = {
      limit,
      offset,
      cursor,
    }

    Object.keys(options).forEach((value, index) => {
      if (!options[value]) {
        delete options[value]
      }
    })

    articleModel.findByTrailId(trailId, options, (err, results) => {
      if (err) return next(err)
      res.json({
        success: true,
        message: `articles of trail-${trailId}`,
        data: results,
      })
    })
  },
}

module.exports = trailsController
