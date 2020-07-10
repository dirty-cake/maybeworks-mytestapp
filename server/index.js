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

io.on('connect', async (socket) => {
  const user = await models.User.query().select('*').findById(socket.user.id)
  socket.user = user.toJSON()
  if (socket.user.is_banned) {
    return socket.disconnect(true)
  }
  socket.emit('user data', socket.user)

  const onlineUserIds = Object.values(io.sockets.sockets).map(socket => socket.user.id)
  const users = await models.User.query()
    .select('*')
    .whereNot('id', socket.user.id)
    .where(query => {
      if (!socket.user.is_admin) {
        query.whereIn('id', onlineUserIds)
      }
    })
  users.forEach(user => {
    if (onlineUserIds.includes(user.id)) {
      user.is_online = true
    } else {
      user.is_online = false
    }
  })
  socket.emit('all users',  users)

  socket.broadcast.emit('user connected', {...socket.user, is_online: true})

  socket.on('disconnect', () => {
    socket.broadcast.emit('user disconnected', socket.user)
  })

  socket.on('new message', async (message) => {
    if (socket.user.is_muted) {
      return console.log('You are muted. You can not send messages')
    }
    const currentTime = Date.now()
    if (socket.user.lastMessageTime && (currentTime - socket.user.lastMessageTime < 15000)) {
      return console.log('You can not send a message. Wait 15 seconds')
    }
    const validatedMessage = await schemas.send.validateAsync(message)
    socket.broadcast.emit('new message', {
      nickname: socket.user.nickname,
      text: validatedMessage.text,
      color: socket.user.color,
      time: currentTime
    })
    socket.user.lastMessageTime = currentTime
  })

  socket.on('mute user', async (user) => {
    if (!socket.user.is_admin) {
      return console.log('You are not admin')
    }
    await models.User.query().patch({ is_muted: true }).findById(user.id)
    Object.values(io.sockets.sockets).forEach(socket => {
      if (socket.user.id === user.id) {
        socket.is_muted = true
      }
    })
    io.sockets.emit('mute user', { id: user.id })
  })

  socket.on('unmute user', async (user) => {
    if (!socket.user.is_admin) {
      return console.log('You are not admin')
    }
    await models.User.query().patch({ is_muted: false }).findById(user.id)
    Object.values(io.sockets.sockets).forEach(socket => {
      if (socket.user.id === user.id) {
        socket.is_muted = false
      }
    })
    io.sockets.emit('unmute user', { id: user.id })
  })

  socket.on('ban user', async (user) => {
    if (!socket.user.is_admin) {
      return console.log('You are not admin')
    }
    await models.User.query().patch({ is_banned: true }).findById(user.id)
    io.sockets.emit('ban user', { id: user.id })
    Object.values(io.sockets.sockets).forEach(socket => {
      if (socket.user.id === user.id) {
        socket.disconnect(true)
      }
    })
  })

  socket.on('unban user', async (user) => {
    if (!socket.user.is_admin) {
      return console.log('You are not admin')
    }
    await models.User.query().patch({ is_banned: false }).findById(user.id)
    io.sockets.emit('unban user', {id: user.id})
  })
})

io.attach(server)

