const io = require('socket.io')(3000)
const fs = require('fs')

const toSendSizePerSecond = +(process.argv[2] || '5')
const clients = {}
const newTexts = []
const sentTexts = []

io.on('connection', (socket) => {
  const socketId = socket.id

  clients[socketId] = socket
  console.log('connection', socketId, Object.keys(clients).length)

  socket.on('disconnect', (reason) => {
    console.log('disconnect', reason)
    delete clients[socketId]
  })

  socket.on('text', (text) => {
    newText(text)
  })
})

function newText(text) {
    if(typeof text != 'string') {
      text = text + ''
    }

    console.log('newText', text)
    newTexts.push(text)

	fs.writeFile('./texts.txt', 
	  `${new Date().toJSON()} ${text}\n`,
	  {flag: 'a'}, (err) => {
	  err && console.log(err)
	})
}

// send text to clients
const toSendSize = toSendSizePerSecond
setInterval(() => {
  const toSend = newTexts.splice(0, toSendSize)

  // 无新弹幕减少发送数量
  let _remainLen = toSendSize - toSend.length
  if(_remainLen > toSendSize / 2) { 
    _remainLen = Math.floor(_remainLen / 2)
  }

  // 随机拣取发送过的消息
  const remainLen = _remainLen
  if(remainLen > 0 && sentTexts.length > 0) {
    const set = new Set()
	while (set.size < remainLen){
	  const previousSize = set.size
	  const pickLen = Math.min(100, sentTexts.length)
	  set.add(sentTexts.slice(0, pickLen)[Math.floor(pickLen * Math.random())])
	  if(previousSize == set.size) { break }
	}
    toSend.push(...set)
  }

  sentTexts.push(...(toSend.slice(0, toSendSize - remainLen)))

  toSend.forEach((text) => {
    io.sockets.emit('text', text)
  })
}, 1000)

process.on('uncaughtException', (err) => {
  console.log('uncaughtException', err)
})
