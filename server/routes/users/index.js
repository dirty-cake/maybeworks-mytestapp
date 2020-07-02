const Router = require('koa-router')
const db = require('../../db')
const jwt = require('jsonwebtoken')
const schemas = require('./schemas')


const router = new Router({ prefix: '/users' })

router.post('/signin', async (ctx) => {
  const validatedUser = await schemas.signin.validateAsync(ctx.request.body)
  const user = db.users.find(user => user.nickname === validatedUser.nickname)
  if (user === undefined) {
    db.users.push(validatedUser)
    const token = jwt.sign({ nickname: validatedUser.nickname }, 'piupiu')
    ctx.body = { ...validatedUser, token }
    ctx.status = 201
  } else if (user.password !== validatedUser.password) {
    ctx.status = 400
    ctx.body = 'Enter right password'
  } else {
    const token = jwt.sign({ nickname: validatedUser.nickname }, 'piupiu')
    ctx.status = 201
    ctx.body = { ...validatedUser, token }
  }
})

module.exports = router.routes()