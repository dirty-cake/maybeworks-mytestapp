const Koa = require('koa')
const body = require('koa-body')

const app = new Koa()

app.use(body())

app.listen(8080, () => {
  console.log('Server is running')
})