import { exec } from 'child_process'
import { promises as fs } from 'fs'
import type OpenAI from 'openai'
import z from 'zod'
import { type ChatMessage } from '../ai-chat'

const execCommand = (command: string) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout) => {
      if (error) reject(error)
      resolve(stdout)
    })
  })
}

const lipSyncMessage = async () => {
  const time = new Date().getTime()
  console.log(`Starting conversion for message`)
  await execCommand(
    `ffmpeg -y -i audios/message.mp3 audios/message.wav`
    // -y to overwrite the file
  )
  console.log(`Conversion done in ${new Date().getTime() - time}ms`)
  try {
    await execCommand(
      `./bin/rhubarb -f json -o audios/message.json audios/message.wav -r phonetic`
    )
  } catch (error) {
    lipSyncMessage()
  }
  // -r phonetic is faster but less accurate
  console.log(`Lip sync done in ${new Date().getTime() - time}ms`)
}

const lipSyncSchema = z.object({
  mouthCues: z.array(
    z.object({
      start: z.number(),
      end: z.number(),
      value: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'X']),
    })
  ),
})
type LipSync = z.infer<typeof lipSyncSchema>

const readJsonTranscript = async (file: string): Promise<LipSync> => {
  const data = await fs.readFile(file, 'utf8')
  const jsonParsed = JSON.parse(data)
  const zodParsed = lipSyncSchema.safeParse(jsonParsed)
  if (!zodParsed.success) {
    throw new Error(`Invalid message: ${JSON.stringify(zodParsed.error)}`)
  }
  return zodParsed.data
}

const audioFileToBase64 = async (file: string) => {
  const data = await fs.readFile(file)
  return data.toString('base64')
}

export const voice = async (message: ChatMessage, openai: OpenAI) => {
  // generate audio file
  const fileName = 'audios/message.mp3' // The name of your audio file
  const textInput = message.text as string
  const mp3 = await openai.audio.speech.create({
    model: 'tts-1-hd',
    voice: 'nova',
    input: textInput,
  })
  const buffer = Buffer.from(await mp3.arrayBuffer())
  await fs.writeFile(fileName, buffer)

  // generate lipSync
  await lipSyncMessage()
  const [audio, lipSync] = await Promise.all([
    audioFileToBase64(fileName),
    readJsonTranscript(`audios/message.json`),
  ])
  return {
    audio,
    lipSync,
    ...message,
  }
}
