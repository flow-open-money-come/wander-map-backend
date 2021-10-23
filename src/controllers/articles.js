const { INVALID_INPUT, FORBIDDEN_ACTION } = require('../constants/errors')
const articleModel = require('../models/articles')
const userModel = require('../models/users')
const { getPermissionLevel } = require('../utils')

function checkArticlePermission(res, tokenPayload, articleId, cb) {
  articleModel.getAuthorId(articleId, (err, result) => {
    if (err) return cb(err)

    const authorId = result[0].author_id
    if (getPermissionLevel(tokenPayload, authorId) < 2) return res.status(403).json(FORBIDDEN_ACTION)
    cb(null)
  })
}

function checkMessagePermission(res, tokenPayload, messageId, cb) {
  articleModel.getMessageAuthorId(messageId, (err, result) => {
    if (err) return cb(err)
    if (!result[0]) return res.status(403).json(FORBIDDEN_ACTION)

    const authorId = result[0].author_id
    if (getPermissionLevel(tokenPayload, authorId) < 2) return res.status(403).json(FORBIDDEN_ACTION)
    cb(null)
  })
}

const articleController = {
  addArticle: (req, res, next) => {
    const { title, content, location, tags, coordinate, altitude, length, departure_time, end_time, time_spent, cover_picture_url, gpx_url } = req.body
    const { tokenPayload } = res.locals
    const authorId = tokenPayload.user_id
    const article = {
      author_id: authorId,
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

    if (getPermissionLevel(tokenPayload, authorId) < 2) return res.status(403).json(FORBIDDEN_ACTION)

    articleModel.add(article, (err, articleResult) => {
      if (err) return next(err)

      articleModel.createTagAssociation(articleResult.insertId, tags, (err, result) => {
        if (err) return next(err)

        userModel
        res.status(201).json({
          success: true,
          message: 'post article',
          data: result,
        })
      })
    })
  },

  getArticles: (req, res, next) => {
    const { location, altitude, length, limit, offset, cursor, search, tag } = req.query

    const options = {
      location,
      altitude,
      length,
      limit: limit || 20,
      offset,
      cursor,
      search,
      tag,
    }

    Object.keys(options).forEach((value, index) => {
      if (!options[index]) {
        delete options[index]
      }
    })

    articleModel.findAll(options, (err, results) => {
      if (err) return next(err)
      res.set('x-total-count', results.count).json({
        success: true,
        message: 'get articles',
        data: results.result,
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
        message: 'get hot articles',
        data: results,
      })
    })
  },

  getArticle: (req, res, next) => {
    const { articleId } = req.params
    articleModel.findById(articleId, (err, results) => {
      if (err) return next(err)
      res.json({
        success: true,
        message: `get article-id ${articleId}`,
        data: results,
      })
    })
  },

  updateArticle: (req, res, next) => {
    const { articleId } = req.params
    const { tokenPayload } = res.locals
    const { title, content, location, tags, coordinate, altitude, length, departure_time, end_time, time_spent, cover_picture_url, gpx_url, is_deleted } = req.body
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

    checkArticlePermission(res, tokenPayload, articleId, (err) => {
      if (err) return next(err)

      articleModel.update(articleId, article, (err, results) => {
        if (err) return next(err)

        articleModel.createTagAssociation(articleId, tags, (err, result) => {
          if (err) return next(err)

          if (!tags) {
            return articleModel.findById(articleId, (err, results) => {
              if (err) return next(err)
              res.json({
                success: true,
                message: 'update article',
                data: results,
              })
            })
          }
          articleModel.deleteTagAssociationNotInList(articleId, tags, (err, result) => {
            if (err) return next(err)

            articleModel.findById(articleId, (err, results) => {
              if (err) return next(err)
              res.json({
                success: true,
                message: 'OK',
                data: results,
              })
            })
          })
        })
      })
    })
  },

  deleteArticle: (req, res, next) => {
    const { articleId } = req.params
    const { tokenPayload } = res.locals
    checkArticlePermission(res, tokenPayload, articleId, (err) => {
      if (err) return next(err)

      articleModel.delete(articleId, (err, results) => {
        if (err) return next(err)
        res.json({
          success: true,
          message: `delete article ${articleId}`,
          data: results,
        })
      })
    })
  },

  getMessages: (req, res, next) => {
    const { articleId } = req.params
    const { limit, cursor, offset } = req.query
    const options = {
      limit: limit || 5,
      cursor,
      offset,
    }
    articleModel.findMessagesById(articleId, options, (err, results) => {
      if (err) return next(err)
      res.json({
        success: true,
        message: 'get message',
        data: results,
      })
    })
  },

  addMessage: (req, res, next) => {
    const { articleId } = req.params
    const { content } = req.body
    const { tokenPayload } = res.locals
    const authorId = tokenPayload.user_id

    if (getPermissionLevel(tokenPayload, authorId) < 2) return res.status(403).json(FORBIDDEN_ACTION)

    if (!content) return res.status(403).json(INVALID_INPUT)

    articleModel.addMessage(articleId, authorId, content, (err, results) => {
      if (err) return next(err)
      res.json({
        success: true,
        message: 'post message',
        data: results,
      })
    })
  },

  deleteMessage: (req, res, next) => {
    const { messageId } = req.params
    const { tokenPayload } = res.locals

    checkMessagePermission(res, tokenPayload, messageId, (err) => {
      if (err) return next(err)

      articleModel.deleteMessage(messageId, (err, results) => {
        if (err) return next(err)
        res.json({
          success: true,
          message: 'delete message',
          data: results,
        })
      })
    })
  },

  updateMessage: (req, res, next) => {
    const { messageId } = req.params
    const { content } = req.body
    const { tokenPayload } = res.locals

    checkMessagePermission(res, tokenPayload, messageId, (err) => {
      if (err) return next(err)

      articleModel.updateMessage(messageId, content, (err, results) => {
        if (err) return next(err)
        res.json({
          success: true,
          message: 'update message',
          data: results,
        })
      })
    })
  },

  relateTrail: (req, res, next) => {
    const { articleId } = req.params
    const { trail_id } = req.body

    articleModel.createTrailAssociation(articleId, trail_id, (err, results) => {
      if (err) return next(err)
      res.json({
        success: true,
        message: `article-${articleId} linked to trail-${trail_id}`,
        data: results,
      })
    })
  },

  unRelateTrail: (req, res, next) => {
    const { articleId, trailId } = req.params

    articleModel.cancelTrailAssociation(articleId, trailId, (err, results) => {
      if (err) return next(err)
      res.json({
        success: true,
        message: `article-${articleId} unlinked to trail-${trailId}`,
        data: results,
      })
    })
  },

  getDeletedArticles: (req, res, next) => {
    const { limit, offset, cursor, search } = req.query

    const options = {
      limit: limit || 20,
      offset,
      cursor,
      search,
    }

    Object.keys(options).forEach((value, index) => {
      if (!options[index]) {
        delete options[index]
      }
    })

    articleModel.findAllDeleted(options, (err, results) => {
      if (err) return next(err)
      res.json({
        success: true,
        message: `get all deleted articles`,
        data: results,
      })
    })
  },

  recoverDeletedArticle: (req, res, next) => {
    const { articleId } = req.params

    articleModel.recoverDeleted(articleId, (err, results) => {
      if (err) return next(err)
      res.json({
        success: true,
        message: `recover article-${articleId}`,
        data: results,
      })
    })
  },
}

module.exports = articleController
