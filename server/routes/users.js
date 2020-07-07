const Router = require('koa-router')
const jwt = require('jsonwebtoken')
const schemas = require('../schemas/users')
const { JWT_PRIVATE_KEY } = require('../config')

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
    user.token = jwt.sign({ nickname: validatedUser.nickname }, JWT_PRIVATE_KEY)
    ctx.response.body = user
    ctx.status = 201
  } else if (!user.comparePassword(validatedUser.password)) {
    ctx.status = 400
    ctx.body = 'Enter right password'
  } else {
    user.token = jwt.sign({ nickname: validatedUser.nickname }, JWT_PRIVATE_KEY)
    ctx.status = 200
    ctx.response.body = user
  }
})

module.exports = router.routes()