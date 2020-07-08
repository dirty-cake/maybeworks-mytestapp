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
  socket.broadcast.emit('user connected', { nickname: socket.user.nickname })
  socket.on('new message', async (message) => {
    if (socket.user.is_muted) {
      return console.log('You are muted. You can not send messages')
    }
    const validatedMessage = await schemas.send.validateAsync(message)
    socket.broadcast.emit('new message', { nickname: socket.user.nickname, time: Date.now(), text: validatedMessage.text})
  })
  socket.on('disconnect', () => {
    socket.broadcast.emit('user disconnected', { nickname: socket.user.nickname })
  })
})

io.attach(server)

