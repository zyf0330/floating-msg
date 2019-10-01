const io = require('socket.io-client')
const client = io('http://localhost:3000')

client.on('text', (text) => {
//  console.log('text', text)
})

setInterval(() => {
  console.log('send text')
  client.emit('text', Date.now())
}, 50)
