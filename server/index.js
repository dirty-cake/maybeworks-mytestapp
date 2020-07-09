const Koa = require('koa')
const SocketIO = require('socket.io')
const body = require('koa-body')
const users = require('./routes/users')
const jwt = require('jsonwebtoken')
const models = require('./db/index.js')
const schemas = require('./schemas/messages')
const { JWT_PRIVATE_KEY } = require('./config')
const app = new Koa()

app.use(body())
app.use(async (ctx, next) => {
  ctx.state.models = models
  await next()
})
app.use(users)


const server = app.listen(8080, () => {
  console.log('Server is running')
})

const io = new SocketIO({ path: '/socket' })

io.use((socket, next) => {
  try {
    const token = socket.handshake.query.token
    socket.user = jwt.verify(token, JWT_PRIVATE_KEY)
    next()
  } catch (err) {
    console.error(err)
  }
})

io.on('connect', (socket) => {
  socket.broadcast.emit('user connected', socket.user)
  socket.on('new message', async (message) => {
    if (socket.user.is_muted) {
      return console.log('You are muted. You can not send messages')
    }
    const currentTime = Date.now()
    if (socket.lastMessageTime && (currentTime - socket.lastMessageTime < 15000)) {
      return console.log('You can not send a message. Wait 15 seconds')
    }
    const validatedMessage = await schemas.send.validateAsync(message)
    socket.broadcast.emit('new message', { nickname: socket.user.nickname, time: currentTime, text: validatedMessage.text, color: socket.user.color})
    socket.lastMessageTime = currentTime
  })
  socket.on('disconnect', () => {
    socket.broadcast.emit('user disconnected', socket.user)
  })
  socket.on('mute user', async (user) => {
    if (socket.user.is_admin) {
      await models.User.query()
        .patch({ is_muted: true })
        .findById(user.id)
      socket.broadcast.emit('mute user', { id: user.id })
    }
  })
  socket.on('unmute user', async (user) => {
    if (socket.user.is_admin) {
      await models.User.query()
      .patch({ is_muted: false })
      .findById(user.id)
    socket.broadcast.emit('unmute user', { id: user.id })
    }
  })
  socket.on('ban user', async (user) => {
    if (socket.user.is_admin) {
      await models.User.query()
        .patch({ is_banned: true })
        .findById(user.id)
      socket.broadcast.emit('ban user', { id: user.id })
    }
  })
  socket.on('unban user', async (user) => {
    if (socket.user.is_admin) {
      await models.User.query()
      .patch({ is_banned: false })
      .findById(user.id)
      socket.broadcast.emit('unban user', {id: user.id})
    }
  })
})

io.attach(server)

