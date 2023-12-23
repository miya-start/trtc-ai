import React, { createContext, useContext, useState } from 'react'
import { type LipSync, messageSchema } from '../@types'

const BACKEND_URL = 'http://localhost:3000'
const ChatContext = createContext<ChatContextType>({} as ChatContextType)

type Message = {
  facialExpression: 'angry' | 'sad' | 'smile' | 'surprised' | 'default'
  animation: 'Idle' | 'Thinking' | 'Waving'
  audio: string
  lipsync: LipSync
  text: string
}

type ChatContextType = {
  cameraZoomed: boolean
  chat: (message: string) => void
  message: Message | null
  loading: boolean
  setCameraZoomed: (cameraZoomed: boolean) => void
}

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const chat = async (message: string) => {
    setLoading(true)
    const data = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    })
    const resp = await data.json()
    const parsed = messageSchema.safeParse(resp.message)
    if (!parsed.success) {
      throw new Error('Failed to parse message')
    }

    setMessage(parsed.data)
    setLoading(false)
  }
  const [message, setMessage] = useState<Message | null>(null)
  const [loading, setLoading] = useState(false)
  const [cameraZoomed, setCameraZoomed] = useState(true)

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        loading,
        cameraZoomed,
        setCameraZoomed,
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
