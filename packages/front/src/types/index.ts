import { LANGUAGES } from '../constants'

export type Languages = typeof LANGUAGES

export type CaptionText = MessageToSend & {
  translates: Map<Languages[number]['value'], string>
}

export type MessageToSend = {
  isTranscriptEnded: boolean
  language: Languages[number]['value']
  transcript: string
  time: number
  userId: string
}

export type MessageReceived = MessageToSend & {
  translates: readonly (readonly [Languages[number]['value'], string])[]
}
