const Koa = require('koa')
const body = require('koa-body')
const users = require('./routes/users')

const app = new Koa()

app.use(body())

app.use(users)

app.listen(8080, () => {
  console.log('Server is running')
})