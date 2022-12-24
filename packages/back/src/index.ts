import { createServer } from 'http'
import path from 'path'
import dotenv from 'dotenv'
import express from 'express'
import { Server, Socket } from 'socket.io'
import tencentcloud from 'tencentcloud-sdk-nodejs-tmt'
import { TextTranslateResponse } from 'tencentcloud-sdk-nodejs-tmt/tencentcloud/services/tmt/v20180321/tmt_models'

type Languages = 'en' | 'ja'

type MessageReceived = {
  isTranscriptEnded: boolean
  language: Languages
  transcript: string
  time: number
  userId: string
}

type MessageToEmit = MessageReceived & {
  translates: readonly (readonly [Languages, string])[]
}

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
}

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)

app.get('/', (_, res) => {
  res.send('Hello World!')
})

const TmtClient = tencentcloud.tmt.v20180321.Client
const client = new TmtClient({
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
})

function textTranslate(
  text: string,
  target: Languages
): Promise<TextTranslateResponse> {
  const params = {
    SourceText: text,
    Source: 'auto',
    Target: target,
    ProjectId: 0,
  }

  return client.TextTranslate(params)
}

async function emitMessage({
  languageSet,
  message,
  roomId,
  socket,
}: {
  languageSet: Set<Languages>
  message: MessageReceived
  roomId: string
  socket: Socket
}): Promise<void> {
  const responsePromises = [...languageSet]
    .filter((language) => language !== message.language)
    .map((language) =>
      textTranslate(message.transcript, language).catch((err) =>
        console.error('error', err)
      )
    )
  const responses = await Promise.all(responsePromises)

  const messageToEmit: MessageToEmit = {
    ...message,
    translates: responses
      .flatMap((response) => (response == null ? [] : [response]))
      .filter(
        (
          response
        ): response is TextTranslateResponse & { Target: Languages } => {
          if (languageSet.has(response.Target as Languages)) return true
          throw Error(`Invalid language: ${response.Target}`)
        }
      )
      .map(({ Target, TargetText }) => [Target, TargetText]),
  }
  socket.to(roomId).emit('receive-message', messageToEmit)
}

const languageSet: Set<Languages> = new Set()
io.on('connection', (socket) => {
  let roomId = '0'
  console.log(`connect ${socket.id}`)

  socket.on('join-room', (iroomId: string) => {
    socket.join(iroomId)
    roomId = iroomId
  })

  socket.on('send-language', (language: Languages) => {
    languageSet.add(language)
    console.log(`send-language ${socket.id} ${language}`)
  })

  socket.on('send-message', async (message: MessageReceived) => {
    console.log(`send-message ${socket.id} ${message.transcript}`)
    console.log('languages', languageSet)
    emitMessage({
      languageSet,
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
