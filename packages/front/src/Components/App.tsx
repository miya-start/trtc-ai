import 'regenerator-runtime' // for the bug of react-speech-recognition
import { useEffect, useRef, useState } from 'react'
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition'
import { io, type Socket } from 'socket.io-client'
import TRTC, { type Client, type LocalStream } from 'trtc-js-sdk'
import { genTestUserSig } from '../debug/GenerateTestUserSig'
import { Captions } from './Caption'
import { Controls } from './Controls'
import { Setting } from './Setting'
import { Stream } from './Stream'
import {
  type Languages,
  type MessageReceived,
  type CaptionText,
  type MessageToSend,
} from '../types'
import '../style.css'

function insertCaption(
  prevs: CaptionText[],
  next: CaptionText,
  userId: string
): CaptionText[] {
  const index = prevs.findLastIndex((prev) => {
    return prev.userId === userId
  })
  if (index === -1) return [...prevs, next]
  return [...prevs.slice(0, index), next, ...prevs.slice(index + 1)]
}

function sendMessage(socket: Socket, message: MessageToSend): void {
  socket.emit('send-message', message)
}

function startSpeechRecognition(
  browserSupportsSpeechRecognition: boolean
): void {
  if (!browserSupportsSpeechRecognition) {
    throw Error('browser does not support speech recognition')
  }
  SpeechRecognition.startListening()
}

const DELETION_INTERVAL = 4000
const App: React.FC = () => {
  const {
    browserSupportsSpeechRecognition,
    finalTranscript,
    listening,
    transcript,
  } = useSpeechRecognition()
  const [captionTexts, setCaptionTexts] = useState<CaptionText[]>([])
  const [client, setClient] = useState<Client | null>(null)
  const [cameraId, setCameraId] = useState<string | null>(null)
  const [microphoneId, setMicrophoneId] = useState<string | null>(null)
  const [language, setLanguage] = useState<Languages[number]['value']>('ja')
  const [localStream, setLocalStream] = useState<LocalStream | null>(null)
  const [roomId, setRoomId] = useState(1)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [userId, setUserId] = useState('user1')
  const isTranscriptEndedRef = useRef(true)
  const transcriptWordsLengthRef = useRef(0)

  const handleTRTC = async () => {
    const { sdkAppId, userSig } = genTestUserSig(userId)
    const iclient = TRTC.createClient({
      mode: 'rtc',
      sdkAppId,
      userId,
      userSig,
    })
    setClient(iclient)
    iclient.on('stream-added', (event) => {
      const remoteStream = event.stream
      console.log('remote stream add streamId: ' + remoteStream.getId())
      iclient.subscribe(remoteStream)
    })
    iclient.on('stream-subscribed', (event) => {
      const remoteStream = event.stream
      remoteStream.play('remoteStreamContainer')
    })

    try {
      await iclient.join({ roomId })
      const localStream = TRTC.createStream({
        userId,
        audio: true,
        video: true,
      })
      await localStream.initialize()
      localStream.play('localStreamContainer')
      await iclient.publish(localStream)
      setLocalStream(localStream)
    } catch (error) {
      console.error(error)
    }
  }

  const handleSocket = () => {
    const isocket = io()
    setSocket(isocket)

    isocket.on('connect', () => {
      console.log('connected')
    })
    isocket.on('disconnect', () => {
      console.log('disconnected')
    })

    isocket.on('receive-message', (data: MessageReceived) => {
      console.log('receive-message', data)
      const caption = { ...data, translates: new Map(data.translates) }
      if (data.isTranscriptEnded) {
        return setCaptionTexts((prevs) => {
          return [...prevs, caption]
        })
      }
      setCaptionTexts((prevs) => insertCaption(prevs, caption, data.userId))
    })
  }

  const startCall = async () => {
    handleTRTC()
    handleSocket()
    startSpeechRecognition(browserSupportsSpeechRecognition)
  }

  const finishCall = async () => {
    if (!localStream) return
    if (!client || !socket) {
      throw Error('client or socket is null')
    }
    localStream.close()
    await client.leave()
    client.destroy()
    socket.disconnect()
    SpeechRecognition.stopListening()
  }

  useEffect(() => {
    if (localStream?.hasVideo() && cameraId) {
      localStream.switchDevice('video', cameraId)
    }
  }, [localStream, cameraId])

  useEffect(() => {
    if (localStream?.hasAudio() && microphoneId) {
      localStream.switchDevice('audio', microphoneId)
    }
  }, [localStream, microphoneId])

  useEffect(() => {
    if (socket?.connected) {
      socket.emit('join-room', `${roomId}`)
      socket.emit('send-language', language)
    }
  }, [socket?.connected])

  useEffect(() => {
    if (!socket?.connected) return
    if (!transcript) {
      transcriptWordsLengthRef.current = 0
      return
    }
    const length = transcript.split(' ').length
    if (length === transcriptWordsLengthRef.current && !finalTranscript) {
      return
    }
    transcriptWordsLengthRef.current = length
    if (length === 1 && !finalTranscript) return

    const caption = {
      isTranscriptEnded: isTranscriptEndedRef.current,
      language,
      transcript,
      userId,
      translates: new Map(),
      time: Date.now(),
    }
    if (isTranscriptEndedRef.current) {
      setCaptionTexts((prevs) => [...prevs, caption])
    } else {
      setCaptionTexts((prevs) => insertCaption(prevs, caption, userId))
    }

    sendMessage(socket, {
      ...caption,
      transcript: finalTranscript
        ? finalTranscript
        : transcript.replace(/\s\S*$/, ''),
    })

    console.log('transcript', transcript)

    if (finalTranscript) {
      isTranscriptEndedRef.current = true
    } else {
      isTranscriptEndedRef.current = false
    }
  }, [finalTranscript, socket?.connected, transcript])

  useEffect(() => {
    if (!localStream?.hasVideo) return
    if (!listening) SpeechRecognition.startListening()
  }, [listening, localStream?.hasVideo])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (captionTexts.length === 0) return
      const now = Date.now()
      setCaptionTexts((prev) =>
        prev.filter(({ time }) => now - time < DELETION_INTERVAL)
      )
    }, DELETION_INTERVAL)
    return () => clearTimeout(timeoutId)
  }, [captionTexts])

  return (
    <>
      <div
        style={
          localStream?.hasVideo() ? { display: 'none' } : { display: 'block' }
        }
      >
        <Setting
          roomId={roomId}
          userId={userId}
          setLanguage={setLanguage}
          setRoomId={setRoomId}
          setUserId={setUserId}
          setCameraId={setCameraId}
          setMicrophoneId={setMicrophoneId}
          startCall={startCall}
          finishCall={finishCall}
        />
      </div>
      <Stream />
      <Captions captionTexts={captionTexts} settingLanguage={language} />
      <Controls localStream={localStream} />
    </>
  )
}

export default App
