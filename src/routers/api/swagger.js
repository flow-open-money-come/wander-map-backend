const swaggerJsDoc = require('swagger-jsdoc')

const options = {
  swaggerDefinition: {
    openapi: '3.0.3',
    info: {
      title: 'Wander Map API',
      version: '1.0.0',
      description: 'Wander Map 後端 APIv1',
      contact: {
        name: 'flow-open-money-come',
        url: 'flow-open-money-come'
      }
    },
    servers: [
      {
        url: 'http://localhost:8888/',
        description: 'test env'
      }
    ]
  },
  // 相對於 Node.js 執行的地方，而不相對於是這隻程式本身
  apis: ['./src/routers/api/*Router.js', './src/routers/api/schemas/*']
}

module.exports = swaggerJsDoc(options)
