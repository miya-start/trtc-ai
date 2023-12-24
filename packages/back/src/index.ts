import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { createServer } from 'http'
import OpenAI from 'openai'
import path from 'path'
import { Server } from 'socket.io'
import { emitMessage, type MessageReceived } from './features/socket/index.js'
import { chat, initMessages } from './features/ai-chat/index.js'
import { voice } from './features/ai-voice/index.js'

if (process.env.NODE_ENV !== 'production')
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

if (!process.env.OPENAI_API_KEY) throw Error('OPENAI_API_KEY is not defined')

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const app = express()
const port = 3004
app.use(cors())
const httpServer = createServer(app)
const io = new Server(httpServer)

io.on('connection', async (socket) => {
  let roomId = '0'
  console.log(`connect ${socket.id}`)

  socket.on(
    'join-room',
    async ({
      roomId: iroomId,
      userId,
    }: {
      roomId: string
      time: number
      userId: string
    }) => {
      socket.join(iroomId)
      roomId = iroomId

      const messageWithAudio = await voice(initMessages(userId), openai)
      socket.emit('ai-audio', messageWithAudio)
    }
  )

  socket.on('send-message', async (sendMessage: MessageReceived) => {
    console.log(`send-message ${socket.id} ${sendMessage.transcript}`)
    emitMessage({
      message: sendMessage,
      roomId,
      socket,
    })

    const { isEnd, transcript } = sendMessage
    if (!isEnd) return
    const message = await chat({
      openai,
      transcript,
    })
    const messageWithAudio = await voice(message, openai)
    socket.emit('ai-audio', messageWithAudio)
  })

  socket.on('disconnect', () => {
    console.log(`disconnect ${socket.id}`)
  })
})

httpServer.listen(port, () => {
  console.log(`Virtual Girlfriend listening on port ${port}`)
})
