import React, { createContext, useContext, useEffect, useState } from 'react'
import { type LipSync, messageSchema } from '../@types'
import { Socket } from 'socket.io-client'

const ChatContext = createContext<ChatContextType>({} as ChatContextType)

type Message = {
  animation: 'Idle' | 'Thinking' | 'Waving'
  audio: string
  facialExpression: 'angry' | 'sad' | 'smile' | 'surprised' | 'default'
  lipsync: LipSync
  text: string
}

type ChatContextType = {
  loading: boolean
  message: Message | null
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  setSocket: React.Dispatch<React.SetStateAction<Socket | null>>
  socket: Socket | null
}

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)

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

  return (
    <ChatContext.Provider
      value={{
        loading,
        message,
        setLoading,
        setSocket,
        socket,
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
