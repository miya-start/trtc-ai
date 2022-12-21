import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)

app.get('/', (_, res) => {
  res.send('Hello World!')
})

io.on('connection', (socket) => {
  let roomId = '0'
  console.log(`connect ${socket.id}`)

  socket.on('join-room', (iroomId: string) => {
    socket.join(iroomId)
    roomId = iroomId
  })

  socket.on('send-message', (message: { userId: string; text: string }) => {
    console.log(`send-message ${socket.id} ${message.text}`)
    socket.to(roomId).emit('receive-message', message)
  })

  socket.on('disconnect', () => {
    console.log(`disconnect ${socket.id}`)
  })
})

httpServer.listen(3004, () => {
  console.log('Listening on port 3004!')
})
