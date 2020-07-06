const Koa = require('koa')
const SocketIO = require('socket.io')
const body = require('koa-body')
const users = require('./routes/users')
const jwt = require('jsonwebtoken')
const models = require('./db/index.js')
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
  const token = socket.handshake.query.token
  socket.user = jwt.verify(token, 'piupiu')
  next()
})

io.on('connect', (socket) => {
  socket.broadcast.emit('user connected', { nickname: socket.user.nickname })
  socket.on('new message', message => {
    const userData = jwt.verify(message.token, 'piupiu')
    socket.broadcast.emit('new message', { nickname: userData.nickname, time: Date.now(), text: message.text})
  })
  socket.on('disconnect', () => {
    socket.broadcast.emit('user disconnected', { nickname: socket.user.nickname })
  })
})

io.attach(server)

