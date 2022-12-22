import { createServer } from 'http'
import path from 'path'
import dotenv from 'dotenv'
import express from 'express'
import { Server } from 'socket.io'
import tencentcloud from 'tencentcloud-sdk-nodejs-tmt'

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
}

const TmtClient = tencentcloud.tmt.v20180321.Client
const clientConfig = {
  credential: {
    secretId: process.env.TENCENT_SECRET_ID,
    secretKey: process.env.TENCENT_SECRET_KEY,
  },
  region: 'ap-singapore',
  profile: {
    httpProfile: {
      endpoint: 'tmt.tencentcloudapi.com',
    },
  },
}
const client = new TmtClient(clientConfig)
const params = {
  SourceText: '今日は良い天気ですね',
  Source: 'auto',
  Target: 'en',
  ProjectId: 0,
}
client.TextTranslate(params).then(
  (data) => {
    console.log(data)
  },
  (err) => {
    console.error('error', err)
  }
)

type Message = {
  isTranscriptEnded: boolean
  transcript: string
  time: number
  userId: string
}

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

  socket.on('send-message', (message: Message) => {
    console.log(`send-message ${socket.id} ${message.transcript}`)
    socket.to(roomId).emit('receive-message', message)
  })

  socket.on('disconnect', () => {
    console.log(`disconnect ${socket.id}`)
  })
})

httpServer.listen(3004, () => {
  console.log('Listening on port 3004!')
})
