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

        res.json({
          success: true,
          message: 'OK',
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
                message: 'OK',
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
          message: 'OK',
          data: results,
        })
      })
    })
  },

  getMessages: (req, res, next) => {
    const { articleId } = req.params
    articleModel.findById(articleId, (err, results) => {
      if (err) return next(err)
      if (!results[0]) return res.status(403).json(INVALID_INPUT)
      const author = results[0].author_id
      articleModel.findMessagesById(articleId, author, (err, results) => {
        if (err) return next(err)
        res.json({
          success: true,
          message: 'OK',
          data: results,
        })
      })
    })
  },

  relateTrail: (req, res, next) => {
    const { id } = req.params
    const { trailId } = req.body

    articleModel.createTrailAssociation(id, trailId, (err, results) => {
      if (err) return next(err)
      res.json({
        success: true,
        message: `article-${id} linked to trail-${trailId}`,
        data: results
      })
    })
  },

  unRelateTrail: (req, res, next) => {
    const { id } = req.params
    const { trailId } = req.body

    articleModel.cancelTrailAssociation(id, trailId, (err, results) => {
      if (err) return next(err)
      res.json({
        success: true,
        message: `article-${id} unlinked to trail-${trailId}`,
        data: results
      })
    })
  }
}

module.exports = articleController
