import { createServer } from 'http'
import path from 'path'
import dotenv from 'dotenv'
import express from 'express'
import { Server, Socket } from 'socket.io'

type MessageReceived = {
  transcript: string
  time: number
  userId: string
}

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
}

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)

async function emitMessage({
  message,
  roomId,
  socket,
}: {
  message: MessageReceived
  roomId: string
  socket: Socket
}): Promise<void> {
  socket.to(roomId).emit('receive-message', message)
}

io.on('connection', (socket) => {
  let roomId = '0'
  console.log(`connect ${socket.id}`)

  socket.on('join-room', (iroomId: string) => {
    socket.join(iroomId)
    roomId = iroomId
  })

  socket.on('send-message', async (message: MessageReceived) => {
    console.log(`send-message ${socket.id} ${message.transcript}`)
    emitMessage({
      message,
      roomId,
      socket,
    })
  })

  socket.on('disconnect', () => {
    console.log(`disconnect ${socket.id}`)
  })
})

httpServer.listen(3004, () => {
  console.log('Listening on port 3004!')
})
