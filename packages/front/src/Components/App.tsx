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
import { type MessageToSend } from '../types'

function insertCaption(
  prevs: MessageToSend[],
  next: MessageToSend,
  userId: string
): MessageToSend[] {
  const index = prevs.findLastIndex((prev) => prev.userId === userId)
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
  SpeechRecognition.startListening({ language: 'ja' })
}

const DELETION_INTERVAL = 4000
const App: React.FC = () => {
  const {
    browserSupportsSpeechRecognition,
    finalTranscript,
    listening,
    transcript,
  } = useSpeechRecognition()
  const [captionTexts, setCaptionTexts] = useState<MessageToSend[]>([])
  const [client, setClient] = useState<Client | null>(null)
  const [cameraId, setCameraId] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [microphoneId, setMicrophoneId] = useState<string | null>(null)
  const [localStream, setLocalStream] = useState<LocalStream | null>(null)
  const [roomId, setRoomId] = useState(1)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [userId, setUserId] = useState('')
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

    isocket.on('receive-message', (data: MessageToSend) => {
      console.log('receive-message', data)
      if (data.isTranscriptEnded) {
        return setCaptionTexts((prevs) => [...prevs, { ...data }])
      }
      setCaptionTexts((prevs) => insertCaption(prevs, { ...data }, data.userId))
    })
  }

  const startCall = async () => {
    handleTRTC()
    handleSocket()
    startSpeechRecognition(browserSupportsSpeechRecognition)
    setIsConnected(true)
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
    setIsConnected(false)
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
      transcript,
      userId,
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
    if (!localStream?.hasAudio()) return
    if (!listening && !isMuted) SpeechRecognition.startListening()
  }, [isMuted, listening, localStream])

  useEffect(() => {
    setTimeout(() => {
      if (captionTexts.length === 0) return
      const now = Date.now()
      setCaptionTexts((prev) =>
        prev.filter(({ time }) => now - time < DELETION_INTERVAL)
      )
    }, DELETION_INTERVAL)
  }, [captionTexts])

  return (
    <div className="grid grid-rows-[1fr,6rem] h-screen min-h-screen bg-gray-800">
      <div
        className={isConnected ? 'hidden' : 'flex justify-center items-center'}
      >
        <Setting
          roomId={roomId}
          userId={userId}
          setRoomId={setRoomId}
          setUserId={setUserId}
          setCameraId={setCameraId}
          setMicrophoneId={setMicrophoneId}
          startCall={startCall}
        />
      </div>
      <div className={isConnected ? 'relative flex justify-center' : 'hidden'}>
        <Stream />
        <Captions captionTexts={captionTexts} />
      </div>
      <div
        className={
          localStream?.hasVideo()
            ? 'flex justify-center items-center gap-4 text-sm text-gray-400'
            : 'hidden'
        }
      >
        <Controls
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          finishCall={finishCall}
          localStream={localStream}
        />
      </div>
    </div>
  )
}

export default App
