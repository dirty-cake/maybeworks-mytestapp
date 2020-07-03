const Koa = require('koa')
const body = require('koa-body')
const users = require('./routes/users')
const Socket = require('socket.io')

const app = new Koa()

app.use(body())

app.use(users)

const server = app.listen(8080, () => {
  console.log('Server is running')
})

const io = new Socket(server, {
  path: '/socket'
})

io.on('connect', (socket) => {
  socket.on('new message', message => {
    socket.broadcast.emit('new message', message)
  })
})

