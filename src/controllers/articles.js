const { INVALID_INPUT } = require('../constants/errors')

const articleModel = require('../models/articles')

const articleController = {
  addArticle: (req, res, next) => {
    const article = req.body
    const articleArr = Object.values(article)
    for (let i = 0; i < articleArr.length; i++) {
      if (articleArr[i] === '' && i !== 4 && i !== 5) {
        return res.status(403).json(INVALID_INPUT)
      }
    }
    articleModel.add(article, (err, results) => {
      if (err) return next(err)
      res.json({
        success: true,
        message: 'OK',
        data: results,
      })
    })
  },

  getArticles: (req, res, next) => {
    const { limit, offset, cursor, tag } = req.query
    const options = {
      limit: limit || 20,
      offset,
      cursor,
      tag,
    }
    articleModel.findAll(options, (err, results) => {
      if (err) return next(err)
      res.json({
        success: true,
        message: 'OK',
        data: results,
      })
    })
  },

  getHotArticles: (req, res, next) => {
    const { limit, offset, cursor, tag } = req.query
    const options = {
      limit: limit || 20,
      offset,
      cursor,
      tag,
    }
    articleModel.findByLikes(options, (err, results) => {
      if (err) return next(err)
      res.json({
        success: true,
        message: 'OK',
        data: results,
      })
    })
  },

  getArticle: (req, res, next) => {
    const { id } = req.params
    articleModel.findById(id, (err, results) => {
      if (err) return next(err)
      res.json({
        success: true,
        message: 'OK',
        data: results,
      })
    })
  },

  updateArticle: (req, res, next) => {
    const { id } = req.params
    const article = req.body

    articleModel.update(id, article, (err, results) => {
      if (err) return next(err)
      articleModel.findById(id, (err, results) => {
        if (err) return next(err)
        res.json({
          success: true,
          message: 'OK',
          data: results,
        })
      })
    })
  },

  deleteArticle: (req, res, next) => {
    const { id } = req.params
    articleModel.delete(id, (err, results) => {
      if (err) return next(err)
      res.json({
        success: true,
        message: 'OK',
        data: results,
      })
    })
  },

  getMessages: (req, res, next) => {
    const { id } = req.params
    articleModel.findById(id, (err, results) => {
      if (err) return next(err)
      if (!results[0]) return res.status(403).json(INVALID_INPUT)
      const author = results[0].author_id
      articleModel.findMessagesById(id, author, (err, results) => {
        if (err) return next(err)
        res.json({
          success: true,
          message: 'OK',
          data: results,
        })
      })
    })
  },
}

module.exports = articleController
