const articleModel = require('../models/articles')
// const { PATH_ERROR, INVALID_INPUT } = require('../constants/errors')

const articleController = {
  addArticle: (req, res) => {
    const article = req.body
    const articleArr = Object.values(article) 
    for (let i = 0; i < articleArr.length; i++) {
      if (articleArr[i] === "") {
        return (res.status(403).json({
          success: false,
          message: "資料填寫不完全",
        }))
      }
    }
    articleModel.add(article, (err, results) => {
      if (err) return console.log(err)
      res.json({
        success: true,
        message: "OK",
        data: article
      })
    })
  },

  getArticles: (req, res) => {
    articleModel.findAll((err, results) => {
      if (err) return console.log(err)
      res.json({
        success: true,
        message: "OK",
        data: results
      })
    })
  },

  getHotArticles: (req, res) => {
    articleModel.findByViews((err, results) => {
      if (err) return console.log(err)
      res.json({
        success: true,
        message: "OK",
        data: results
      })
    })
  },

  getArticle: (req, res) => {
    const { id } = req.params
    articleModel.findById(id, (err, results) => {
      if (err) return console.log(err)
      res.json({
        success: true,
        message: "OK",
        data: results
      })
    })
  },

  updateArticle: (req, res) => {
    const { id } = req.params
    const article = req.body
    const articleArr = Object.values(article) 
    for (let i = 0; i < articleArr.length; i++) {
      if (articleArr[i] === "") {
        return (res.status(403).json({
          success: false,
          message: "資料填寫不完全",
        }))
      }
    }
    articleModel.update(id, article, (err, results) => {
      if (err) return console.log(err)
      res.json({
        success: true,
        message: "OK",
        data: article
      })
    })
  },

  deleteArticle: (req, res) => {
    const { id } = req.params
    articleModel.delete(id, (err, results) => {
      if (err) return console.log(err)
      res.json({
        success: true,
        message: "OK",
        data: results
      })
    })
  },

  getComments: (req, res) => {
    const { id } = req.params
    articleModel.findById(id, (err, results) => {
      if (err) return console.log(err)
      const author = results[0].author_id
      articleModel.findCommentsById(id, author, (err, results) => {
        if (err) return console.log(err)
        console.log(author)
        res.json({
          success: true,
          message: "OK",
          data: results
        })
      })
    })
  }
}

module.exports = articleController