import { createServer } from 'http'
import path from 'path'
import dotenv from 'dotenv'
import express from 'express'
import { Server } from 'socket.io'
import tencentcloud from 'tencentcloud-sdk-nodejs-tmt'
import { TextTranslateResponse } from 'tencentcloud-sdk-nodejs-tmt/tencentcloud/services/tmt/v20180321/tmt_models'

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
textTranslate('子', 'en').then(
  (data) => {
    console.log(data)
  },
  (err) => {
    console.error('error', err)
  }
)

type Languages = 'en' | 'ja'

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

type Message = {
  isTranscriptEnded: boolean
  language: Languages
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

const languages: Set<Languages> = new Set()
io.on('connection', (socket) => {
  let roomId = '0'
  console.log(`connect ${socket.id}`)

  socket.on('join-room', (iroomId: string) => {
    socket.join(iroomId)
    roomId = iroomId
  })

  socket.on('send-language', (language: Languages) => {
    languages.add(language)
    console.log(`send-language ${socket.id} ${language}`)
  })

  socket.on('send-message', async (message: Message) => {
    console.log(`send-message ${socket.id} ${message.transcript}`)
    console.log('languages', languages)

    const responsePromises = [...languages]
      .filter((language) => language !== message.language)
      .map((language) =>
        textTranslate(message.transcript, language).catch((err) =>
          console.error('error', err)
        )
      )
    const responses = await Promise.all(responsePromises)

    socket.to(roomId).emit('receive-message', {
      ...message,
      tranlates: responses
        .flatMap((response) => (response == null ? [] : [response]))
        .map((textTranslateResponse) => ({
          language: textTranslateResponse.Target,
          text: textTranslateResponse.TargetText,
        })),
    })
  })

  socket.on('disconnect', () => {
    console.log(`disconnect ${socket.id}`)
  })
})

httpServer.listen(3004, () => {
  console.log('Listening on port 3004!')
})
