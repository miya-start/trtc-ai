import React, { useCallback, useEffect, useState } from 'react'
import 'regenerator-runtime' // for the bug of react-speech-recognition
import { useSpeechRecognition } from 'react-speech-recognition'
import { type Client, type LocalStream } from 'trtc-js-sdk'
import { useCaptionEmission } from '../features/caption'
import {
  startSocket,
  finishSocket,
  useSpeechRecognitionStart,
} from '../features/socket'
import { startStream, finishStream, useSwitchDevice } from '../features/stream'
import { Captions } from './Caption'
import { Controls } from './Controls'
import { Setting } from './Setting'
import { Stream } from './Stream'
import { Virtual } from '../Virtual'
import { useChat } from '../Virtual/hooks/useChat'

const App: React.FC = () => {
  const {
    browserSupportsSpeechRecognition,
    finalTranscript,
    listening,
    transcript,
  } = useSpeechRecognition()
  const [client, setClient] = useState<Client | null>(null)
  const [cameraId, setCameraId] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [microphoneId, setMicrophoneId] = useState<string | null>(null)
  const [localStream, setLocalStream] = useState<LocalStream | null>(null)
  const [roomId, setRoomId] = useState(1)
  const [userId, setUserId] = useState('')
  const { message, setCaptionTexts, socket, setSocket } = useChat()

  const startCall = useCallback(() => {
    startStream({
      roomId,
      userId,
      setClient,
      setIsConnected,
      setLocalStream,
    })
    startSocket({
      browserSupportsSpeechRecognition,
      setCaptionTexts,
      setSocket,
    })
  }, [
    roomId,
    userId,
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
    if (socket?.connected)
      socket.emit('join-room', { roomId, time: Date.now(), userId })
  }, [socket?.connected])

  useSpeechRecognitionStart(isMuted, listening, localStream)
  useSwitchDevice({ localStream, cameraId, microphoneId })

  useCaptionEmission({
    finalTranscript: finalTranscript ?? '',
    aiTranscript: message?.text ?? '',
    setCaptionTexts,
    socket,
    transcript,
    userId,
  })

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
        <Virtual />
        <Captions />
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
