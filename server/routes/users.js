const Router = require('koa-router')
const jwt = require('jsonwebtoken')
const schemas = require('../schemas/users')
const { JWT_PRIVATE_KEY } = require('../config')

const router = new Router({ prefix: '/users' })

router.get('/', async (ctx) => {
  const user = jwt.verify(ctx.request.headers.authorization, JWT_PRIVATE_KEY)
  const users = await ctx.state.models.User.query()
    .select('*')
    .whereNot('id', user.id)
  ctx.response.body = users
})

router.post('/signin', async (ctx) => {
  const validatedUser = await schemas.signin.validateAsync(ctx.request.body)
  const user = await ctx.state.models.User.query()
    .select('*')
    .where('nickname', validatedUser.nickname)
    .first()
  if (!user) {
    const user = await ctx.state.models.User.query()
      .insertAndFetch(validatedUser)
    user.token = jwt.sign({ id: user.id, nickname: user.nickname, is_muted: user.is_muted, is_admin: user.is_admin }, JWT_PRIVATE_KEY)
    ctx.response.body = user
    ctx.status = 201
  } else if (!user.comparePassword(validatedUser.password)) {
    ctx.status = 400
    ctx.body = 'Enter right password'
  } else if (user.is_banned) {
    ctx.throw(403, 'You are banned. You can not sign in')
  } else {
    user.token = jwt.sign({ id: user.id, nickname: user.nickname, is_muted: user.is_muted, is_admin: user.is_admin }, JWT_PRIVATE_KEY)
    ctx.status = 200
    ctx.response.body = user
  }
})

module.exports = router.routes()