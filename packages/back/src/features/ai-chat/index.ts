import type OpenAI from 'openai'
import z from 'zod'

const messageSchema = z.object({
  animation: z.enum(['Idle', 'Thinking', 'Waving']),
  facialExpression: z.enum(['angry', 'sad', 'smile', 'surprised', 'default']),
  text: z.string(),
})
export type ChatMessage = z.infer<typeof messageSchema> & {
  time: number
  userId: string
}

export async function chat({
  openai,
  transcript,
  userId,
  hr = '面接AI',
}: {
  openai: OpenAI
  transcript: string
  userId: string
  hr?: string
}): Promise<ChatMessage> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    max_tokens: 1000,
    temperature: 0.6,
    messages: [
      {
        role: 'system',
        content: `
          HR_Intvw-EngMid; user=候補者; assistant=${hr}; Focus=React技術力チェック; Process=HR質問→User回答→HR追加質問; Repeat=技術力確認まで繰り返し; user称呼=${userId}さん;Assistant応答=JSON; JSON-Attribution=text, facialExpression, animation; facialExpression=smile, surprised, sad, angry, default; animation=Idle, Thinking, Waving; AllAttributions required; 質問は簡潔に`,
      },
      {
        role: 'assistant',
        content: `{"text":"こんにちは、${userId}さん。${hr}と申します。よろしくお願いします。","facialExpression":"smile","animation":"Idle"}`,
      },
      {
        role: 'user',
        content: `{"text":${transcript},"facialExpression":"default","animation":"Idle"}`,
      },
    ],
  })
  console.log(completion.choices[0].message)
  const jsonParsed = JSON.parse(completion.choices[0].message.content || '')
  const zodParsed = messageSchema.safeParse(jsonParsed)
  if (!zodParsed.success) {
    throw new Error(`Invalid message: ${JSON.stringify(zodParsed.error)}`)
  }
  return { ...zodParsed.data, time: Date.now(), userId: hr }
}
