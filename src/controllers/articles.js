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
    const { location, altitude, length, limit, offset, cursor, search } =
      req.query

    const options = {
      location,
      altitude,
      length,
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
    articleModel.findByLikes((err, results) => {
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
        message: `get article-id ${id}`,
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

  addMessage: (req, res, next) => {
    const { id } = req.params
    const message = req.body
    articleModel.addMessage(id, message, (err, results) => {
      if (err) return next(err)
      res.json({
        success: true,
        message: 'OK',
        data: results,
      })
    })
  },

  deleteMessage: (req, res, next) => {
    const { messageId } = req.params
    articleModel.deleteMessage(messageId, (err, results) => {
      if (err) return next(err)
      res.json({
        success: true,
        message: 'OK',
        data: results,
      })
    })
  },

  updateMessage: (req, res, next) => {
    const { messageId } = req.params
    const message = req.body
    articleModel.updateMessage(messageId, message, (err, results) => {
      if (err) return next(err)
      res.json({
        success: true,
        message: 'OK',
        data: results,
      })
    })
  },
}

module.exports = articleController
