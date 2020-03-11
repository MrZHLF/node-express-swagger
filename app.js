const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const app = express()
const expressSwagger = require('express-swagger-generator')(app)
app.use(require('cors')())
app.use(express.json())
// 引入数据api
const user = require('./router/api/user')
app.get('/test', (req, res) => {
  res.send('ok')
})

const db = require('./config/db').mongoURI //引入数据库
let options = {
  swaggerDefinition: {
    info: {
      description: 'This is a sample server',
      title: 'Swagger',
      version: '1.0.0'
    },
    host: 'localhost:3000',
    basePath: '/',
    produces: ['application/json', 'application/xml'],
    schemes: ['http', 'https'],
    securityDefinitions: {
      JWT: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        description: ''
      }
    }
  },
  route: {
    url: '/swagger',
    docs: '/swagger.json' //swagger文件 api
  },
  basedir: __dirname, //app absolute path
  files: ['./router/api/*.js'] //Path to the API handle folder
}
expressSwagger(options)

// // 使用router中间件
app.post('/api/users/register', (req, res) => {
  user.userRegisterPost(req, res)
})
app.post('/api/users/login', (req, res) => {
  user.userLoginPost(req, res)
})

//使用body-parser中间件
app.use(
  bodyParser.urlencoded({
    extended: false
  })
)
app.use(bodyParser.json())

mongoose
  .connect(db, {
    useNewUrlParser: true
  })
  .then(() => console.log('数据库链接成功'))
  .catch(err => console.log(err))

app.listen(3000, () => {
  console.log('服务启动成功')
})