import { Buffer } from 'buffer'
import { useEffect } from 'react'
import SpeechRecognition from 'react-speech-recognition'
import { io, Socket } from 'socket.io-client'
import { type LocalStream } from 'trtc-js-sdk'
import { type MessageToSend } from '../../types'
import { insertCaption } from '../caption'

const handleSocket = ({
  setSocket,
  setCaptionTexts,
}: {
  setSocket: React.Dispatch<React.SetStateAction<Socket | null>>
  setCaptionTexts: React.Dispatch<React.SetStateAction<MessageToSend[]>>
}) => {
  const socket = io()
  setSocket(socket)
  socket.on('receive-message', (data: MessageToSend) => {
    console.log('receive-message', data)
    setCaptionTexts((prevs: MessageToSend[]) =>
      insertCaption(prevs, { ...data }, data.userId)
    )
  })

  socket.on('ai-audio', (data: string) => {
    const byteArray = Buffer.from(data, 'base64')
    const audioBlob = new Blob([byteArray], { type: 'audio/x-wav' })
    const audio = new Audio(URL.createObjectURL(audioBlob))
    audio.play()
  })
}

function startSpeechRecognition(
  browserSupportsSpeechRecognition: boolean
): void {
  if (!browserSupportsSpeechRecognition) {
    throw Error('browser does not support speech recognition')
  }
  SpeechRecognition.startListening({ language: 'ja' })
}

export async function startSocket({
  browserSupportsSpeechRecognition,
  setCaptionTexts,
  setSocket,
}: {
  browserSupportsSpeechRecognition: boolean
  setCaptionTexts: React.Dispatch<React.SetStateAction<MessageToSend[]>>
  setSocket: React.Dispatch<React.SetStateAction<Socket | null>>
}) {
  handleSocket({ setSocket, setCaptionTexts })
  startSpeechRecognition(browserSupportsSpeechRecognition)
}

export function finishSocket(socket: Socket | null) {
  if (!socket) throw Error('socket is null')
  socket.disconnect()
  SpeechRecognition.stopListening()
}

export function useSpeechRecognitionStart(
  isMuted: boolean,
  listening: boolean,
  localStream: LocalStream | null
) {
  useEffect(() => {
    if (!localStream?.hasAudio()) return
    if (!listening && !isMuted) SpeechRecognition.startListening()
  }, [isMuted, listening, localStream])
}
