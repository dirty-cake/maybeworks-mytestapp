const Router = require('koa-router')
const jwt = require('jsonwebtoken')
const schemas = require('./schemas')


const router = new Router({ prefix: '/users' })

router.post('/signin', async (ctx) => {
  const validatedUser = await schemas.signin.validateAsync(ctx.request.body)
  const user = await ctx.state.models.User.query()
    .select('*')
    .where('nickname', validatedUser.nickname)
    .first()
  if (!user) {
    const user = await ctx.state.models.User.query()
      .insertAndFetch(validatedUser)
    user.token = jwt.sign({ nickname: validatedUser.nickname }, 'piupiu')
    ctx.response.body = user
    ctx.status = 201
  } else if (user.password !== validatedUser.password) {
    ctx.status = 400
    ctx.body = 'Enter right password'
  } else {
    user.token = jwt.sign({ nickname: validatedUser.nickname }, 'piupiu')
    ctx.status = 200
    ctx.response.body = user
  }
})

module.exports = router.routes()