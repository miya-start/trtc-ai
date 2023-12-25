import type OpenAI from 'openai'
import z from 'zod'

const AI = '面接AI'

const messageSchema = z.object({
  animation: z.enum(['Idle', 'Thinking', 'Waving']),
  facialExpression: z.enum(['angry', 'sad', 'smile', 'surprised', 'default']),
  text: z.string(),
})
export type ChatMessage = z.infer<typeof messageSchema> & {
  time: number
  userId: string
}

type Message = {
  role: 'system' | 'assistant' | 'user'
  content: string
}
const messages: Message[] = []

export const initMessages = (userId: string, hr = AI): ChatMessage => {
  const initialTranscript = `こんにちは、${userId}さん。${hr}と申します。よろしくお願いします。`

  messages.push(
    ...([
      {
        role: 'system',
        content: `
      HR_Intvw-EngMid; user=候補者; assistant=${hr}; Focus=Reactの技術力チェック; Process=HR質問50字以内→User回答→HR追加質問50字以内; Repeat=技術力の確認まで繰り返し; user称呼=${userId}さん;Assistant応答=JSON; JSON-Attribution=text, facialExpression, animation; facialExpression=smile, surprised, sad, angry, default; animation=Idle, Thinking, Waving; AllAttributions required; 応答は50字以内！`,
      },
      {
        role: 'assistant',
        content: `{${initialTranscript},"facialExpression":"smile","animation":"Idle"}`,
      },
    ] satisfies Message[])
  )

  return {
    text: initialTranscript,
    animation: 'Idle',
    facialExpression: 'smile',
    time: Date.now(),
    userId: hr,
  }
}

const genMessages = (transcript: string): Message[] => {
  const newMessage = {
    role: 'user',
    content: `{"text":${transcript},"facialExpression":"default","animation":"Idle"}`,
  } satisfies Message

  messages.push(newMessage)
  return [...messages, newMessage]
}

function safeJsonParse(str: string) {
  try {
    return JSON.parse(str)
  } catch (e) {
    return {
      text: str,
      facialExpression: 'default',
      animation: 'Idle',
    }
  }
}

export async function chat({
  openai,
  transcript,
  hr = AI,
}: {
  openai: OpenAI
  transcript: string
  hr?: string
}): Promise<ChatMessage> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    max_tokens: 1000,
    temperature: 0.6,
    messages: genMessages(transcript),
  })
  console.log(completion.choices[0].message)
  const content = completion.choices[0].message.content
  if (!content) throw Error('No content')
  const jsonParsed = safeJsonParse(content)
  const zodParsed = messageSchema.safeParse(jsonParsed)
  if (!zodParsed.success)
    throw Error(`Invalid message: ${JSON.stringify(zodParsed.error)}`)

  messages.push({
    role: 'assistant',
    content,
  } satisfies Message)

  return { ...zodParsed.data, time: Date.now(), userId: hr }
}
