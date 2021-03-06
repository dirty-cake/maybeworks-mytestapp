const Router = require('koa-router')
const jwt = require('jsonwebtoken')
const schemas = require('../schemas/users')
const { JWT_PRIVATE_KEY, COLORS } = require('../config')

const router = new Router({ prefix: '/users' })


router.post('/signin', async (ctx) => {
  const validatedUser = await schemas.signin.validateAsync(ctx.request.body)
  console.log('validatedUser')
  const user = await ctx.state.models.User.query()
    .select('*')
    .where('nickname', validatedUser.nickname)
    .first()
  if (!user) {
    validatedUser.color = COLORS[Math.floor(Math.random() * COLORS.length)]
    const user = await ctx.state.models.User.query()
      .insertAndFetch(validatedUser)
    user.token = jwt.sign({ id: user.id }, JWT_PRIVATE_KEY)
    ctx.response.body = user
    ctx.status = 201
  } else if (!user.comparePassword(validatedUser.password)) {
    ctx.throw(401, 'Enter right password')
  } else if (user.is_banned) {
    ctx.throw(403, 'You are banned. You can not sign in')
  } else {
    user.token = jwt.sign({ id: user.id }, JWT_PRIVATE_KEY)
    ctx.status = 200
    ctx.response.body = user
  }
})

module.exports = router.routes()