const { INVALID_INPUT } = require('../constants/errors')
const articleModel = require('../models/articles')
const { getPermissionLevel } = require('../utils')

function checkArticlePermission(res, tokenPayload, articleId, cb) {
  articleModel.getAuthorId(articleId, (err, result) => {
    if (err) return cb(err)

    const authorId = result[0].author_id
    if (getPermissionLevel(tokenPayload, authorId) < 2) return res.status(403).json(FORBIDDEN_ACTION)
    cb(null)
  })
}

const articleController = {
  addArticle: (req, res, next) => {
    const { title, content, location, coordinate, altitude, length, departure_time, end_time, time_spent, cover_picture_url, gpx_url } = req.body
    const author_id = tokenPayload.user_id
    const article = {
      author_id,
      title,
      content,
      location,
      coordinate,
      altitude,
      length,
      departure_time,
      end_time,
      time_spent,
      cover_picture_url,
      gpx_url,
    }

    for (column in article) {
      if (!article[column] && article[column] !== 0) delete article[column]
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
    const { tokenPayload } = res.locals
    const { title, content, location, coordinate, altitude, length, departure_time, end_time, time_spent, cover_picture_url, gpx_url, is_deleted } = req.body
    const article = {
      title,
      content,
      location,
      coordinate,
      altitude,
      length,
      departure_time,
      end_time,
      time_spent,
      cover_picture_url,
      gpx_url,
      is_deleted,
    }

    for (column in article) {
      if (!article[column] && article[column] !== 0) delete article[column]
    }

    checkArticlePermission(res, tokenPayload, id, (err) => {
      if (err) return next(err)

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
    })
  },

  deleteArticle: (req, res, next) => {
    const { id } = req.params
    const { tokenPayload } = res.locals

    checkArticlePermission(res, tokenPayload, id, (err) => {
      if (err) return next(err)

      articleModel.delete(id, (err, results) => {
        if (err) return next(err)
        res.json({
          success: true,
          message: 'OK',
          data: results,
        })
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
