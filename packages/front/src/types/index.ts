export type MessageToSend = {
  role: 'system' | 'assistant' | 'user'
  transcript: string
  time: number
  userId: string
}
