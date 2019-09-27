const io = require('socket.io')(3000)

const clients = {}
const texts = []

io.on('connection', (socket) => {
  const socketId = socket.id

  clients[socketId] = socket
  console.log('connection', socketId, Object.keys(clients).length)

  socket.on('disconnect', (reason) => {
    console.log('disconnect', reason)
    delete clients[socketId]
  })

  socket.on('text', (text) => {
    if(typeof text != 'string') {
      text = text + ''
    }
    console.log('text', text)

    texts.push(text)
    if(texts.length > 5) {
      texts.shift()
    }
    io.sockets.emit('text', text)
  })

  socket.emit('initTexts', texts)
})
