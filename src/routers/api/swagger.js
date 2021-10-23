// OpenAPI 規範：https://swagger.io/specification/

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
        url: 'doc',
      },
    },
    servers: [
      {
        url: 'https://api.wandermap.tw/',
        description: 'api base url',
      },
      {
        url: 'https://backup.wandermap.tw/',
        description: 'backup api',
      },
      {
        url: 'http://localhost:5000/',
        description: 'dev',
      },
    ],
  },
  // 相對於 Node.js 執行的地方，而不是相對於這隻程式本身
  apis: ['./src/routers/api/*.js', './src/routers/api/schemas/*'],
}

module.exports = swaggerJsDoc(options)
