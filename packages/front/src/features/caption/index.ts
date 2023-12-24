import { useEffect, useRef } from 'react'
import { Socket } from 'socket.io-client'
import { type MessageToSend } from '../../types'

export const DELETION_INTERVAL = 4000

export function insertCaption(
  prevs: MessageToSend[],
  next: MessageToSend,
  userId: string,
  isSpeechEnded = false
): MessageToSend[] {
  const index = prevs.findLastIndex((prev) => prev.userId === userId)
  if (index === -1) return [...prevs, next]

  const newCaptionIndex = isSpeechEnded ? index + 1 : index
  return [
    ...prevs.slice(0, newCaptionIndex),
    next,
    ...prevs.slice(newCaptionIndex + 1),
  ]
}

export function useCaptionDeletion({
  captionTexts,
  setCaptionTexts,
}: {
  captionTexts: MessageToSend[]
  setCaptionTexts: React.Dispatch<React.SetStateAction<MessageToSend[]>>
}) {
  useEffect(() => {
    setTimeout(() => {
      if (captionTexts.length === 0) return
      const now = Date.now()
      setCaptionTexts((prev) =>
        prev.filter(({ time }) => now - time < DELETION_INTERVAL)
      )
    }, DELETION_INTERVAL)
  }, [captionTexts, setCaptionTexts])
}

export function useCaptionEmission({
  aiAudio,
  finalTranscript,
  setCaptionTexts,
  socket,
  transcript,
  userId,
}: {
  aiAudio: HTMLAudioElement | null
  finalTranscript: string | null
  setCaptionTexts: React.Dispatch<React.SetStateAction<MessageToSend[]>>
  socket: Socket | null
  transcript: string
  userId: string
}) {
  const isSpeechEnded = useRef(false)

  useEffect(() => {
    if (aiAudio) return
    if (!socket?.connected || !transcript) return

    const isEnded = isSpeechEnded.current
    if (finalTranscript) {
      isSpeechEnded.current = true
    } else {
      isSpeechEnded.current = false
    }

    if (transcript === finalTranscript) return
    const caption = {
      transcript,
      userId,
      time: Date.now(),
    }
    setCaptionTexts((prevs: MessageToSend[]) =>
      insertCaption(prevs, caption, userId, isEnded)
    )
    socket.emit('send-message', {
      ...caption,
      transcript: finalTranscript || transcript.replace(/\s\S*$/, ''),
    })
  }, [finalTranscript, socket?.connected, transcript])
}
