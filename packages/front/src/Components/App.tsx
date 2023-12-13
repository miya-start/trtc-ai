import 'regenerator-runtime' // for the bug of react-speech-recognition
import { useCallback, useEffect, useState } from 'react'
import { useSpeechRecognition } from 'react-speech-recognition'
import { type Socket } from 'socket.io-client'
import { type Client, type LocalStream } from 'trtc-js-sdk'
import { useEmitCaption, useDeleteCaption } from '../features/caption'
import {
  startSocket,
  finishSocket,
  useSpeechRecognitionStart,
} from '../features/socket'
import { startSteam, finishStream, useSwitchDevice } from '../features/stream'
import { type MessageToSend } from '../types'
import { Captions } from './Caption'
import { Controls } from './Controls'
import { Setting } from './Setting'
import { Stream } from './Stream'

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

  const startCall = useCallback(() => {
    startSteam({ setClient, setIsConnected, setLocalStream })
    startSocket({
      browserSupportsSpeechRecognition,
      setCaptionTexts,
      setSocket,
    })
  }, [
    browserSupportsSpeechRecognition,
    setCaptionTexts,
    setClient,
    setIsConnected,
    setLocalStream,
    setSocket,
  ])

  const finishCall = useCallback(() => {
    finishStream(client, localStream, setIsConnected)
    finishSocket(socket)
  }, [client, localStream, socket])

  useEffect(() => {
    if (socket?.connected) socket.emit('join-room', `${roomId}`)
  }, [socket?.connected])

  useSpeechRecognitionStart(isMuted, listening, localStream)
  useSwitchDevice({ localStream, cameraId, microphoneId })

  useEmitCaption({
    finalTranscript,
    setCaptionTexts,
    socket,
    transcript,
    userId,
  })
  useDeleteCaption({ captionTexts, setCaptionTexts })

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
