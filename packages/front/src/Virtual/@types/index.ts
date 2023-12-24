import { AnimationMixer } from 'three'
import z from 'zod'

export declare class AnimationMixerExtended extends AnimationMixer {
  stats: {
    actions: {
      inUse: number
    }
  }
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
export type LipSync = z.infer<typeof lipSyncSchema>

export const messageSchema = z.object({
  animation: z.enum(['Idle', 'Thinking', 'Waving']),
  audio: z.string(),
  facialExpression: z.enum(['angry', 'sad', 'smile', 'surprised', 'default']),
  lipSync: lipSyncSchema,
  time: z.number(),
  text: z.string(),
  userId: z.string(),
})
export type Message = z.infer<typeof messageSchema>
