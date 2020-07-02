const Router = require('koa-router')
const db = require('../../db')

const router = new Router({ prefix: '/users' })

router.post('/signin', async ctx => {
  const user = ctx.request.body
  
})


module.exports = router.routes()