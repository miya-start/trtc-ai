import 'regenerator-runtime' // for the bug of react-speech-recognition
import { useEffect, useState } from 'react'
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition'
import { io, type Socket } from 'socket.io-client'
import { type Client, type LocalStream } from 'trtc-js-sdk'
import { Captions } from './Caption'
import { Controls } from './Controls'
import { Setting } from './Setting'
import { Stream } from './Stream'
import { type MessageToSend } from '../types'
import { DELETION_INTERVAL, insertCaption } from '../features/caption'
import { startSpeechRecognition } from '../features/speech-recognition'
import { handleTRTC } from '../features/stream'

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

  const handleSocket = () => {
    const isocket = io()
    setSocket(isocket)
    isocket.on('receive-message', (data: MessageToSend) => {
      console.log('receive-message', data)
      setCaptionTexts((prevs) => insertCaption(prevs, { ...data }, data.userId))
    })
  }

  const startCall = async () => {
    const { client: iclient, localStream: ilocalStream } = await handleTRTC({
      roomId,
      userId,
    })
    setClient(iclient)
    setLocalStream(ilocalStream)
    handleSocket()
    startSpeechRecognition(browserSupportsSpeechRecognition)
    setIsConnected(true)
  }

  const finishCall = async () => {
    if (!localStream) return
    if (!client || !socket) throw Error('client or socket is null')

    localStream.close()
    await client.leave()
    client.destroy()
    socket.disconnect()
    SpeechRecognition.stopListening()
    setIsConnected(false)
  }

  useEffect(() => {
    if (socket?.connected) socket.emit('join-room', `${roomId}`)
  }, [socket?.connected])

  useEffect(() => {
    if (!localStream?.hasAudio()) return
    if (!listening && !isMuted) SpeechRecognition.startListening()
  }, [isMuted, listening, localStream])

  useEffect(() => {
    if (!localStream) return

    if (localStream.hasVideo() && cameraId)
      localStream.switchDevice('video', cameraId)

    if (localStream.hasAudio() && microphoneId)
      localStream.switchDevice('audio', microphoneId)
  }, [localStream, cameraId, microphoneId])

  useEffect(() => {
    if (!socket?.connected || !transcript) return

    const caption = {
      transcript,
      userId,
      time: Date.now(),
    }
    setCaptionTexts((prevs) => insertCaption(prevs, caption, userId))
    socket.emit('send-message', {
      ...caption,
      transcript: finalTranscript || transcript.replace(/\s\S*$/, ''),
    })
  }, [finalTranscript, socket?.connected, transcript])

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
