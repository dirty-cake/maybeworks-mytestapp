const Koa = require('koa')
const body = require('koa-body')
const users = require('./routes/users')
const Socket = require('socket.io')

const app = new Koa()

app.use(body())

app.use(users)

app.listen(8080, () => {
  console.log('Server is running')
})

const io = new Socket(server, {
  path: '/socket'
})

io.on('connect', socket => {
  socket.emit('new message', {author: 'irka', time: Date.now(), text: 'Bye'})
  socket.on('new message', message => { 
    console.log(message) 
  })
})