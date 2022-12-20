import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'

const ROOM_NAME = 'captions'
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

io.on('connection', (socket) => {
  console.log(`connect ${socket.id}`)
  socket.on('disconnect', () => {
    console.log(`disconnect ${socket.id}`)
  })
})

httpServer.listen(3004, () => {
  console.log('Listening on port 3004!')
})
