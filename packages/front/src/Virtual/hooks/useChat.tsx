import React, { createContext, useContext, useEffect, useState } from 'react'
import { type Message, messageSchema } from '../@types'
import { Socket } from 'socket.io-client'
import { MessageToSend } from '../../types'
import { useCaptionDeletion } from '../../features/caption'

const ChatContext = createContext<ChatContextType>({} as ChatContextType)

type ChatContextType = {
  captionTexts: MessageToSend[]
  setCaptionTexts: React.Dispatch<React.SetStateAction<MessageToSend[]>>
  loading: boolean
  message: Message | null
  setMessage: React.Dispatch<React.SetStateAction<Message | null>>
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  socket: Socket | null
  setSocket: React.Dispatch<React.SetStateAction<Socket | null>>
}

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [captionTexts, setCaptionTexts] = useState<MessageToSend[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    if (socket) {
      socket.on('ai-audio', (message: Message) => {
        console.log('ai-audio', message)
        const parsed = messageSchema.safeParse(message)
        if (!parsed.success) throw Error('Failed to parse message')

        setMessage(parsed.data)
        setLoading(false)
      })
    }
  }, [socket])

  useCaptionDeletion({ captionTexts, setCaptionTexts })

  return (
    <ChatContext.Provider
      value={{
        captionTexts,
        setCaptionTexts,
        loading,
        message,
        setMessage,
        setLoading,
        socket,
        setSocket,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
