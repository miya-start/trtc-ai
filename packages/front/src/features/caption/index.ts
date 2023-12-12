import { type MessageToSend } from '../../types'

export const DELETION_INTERVAL = 4000

export function insertCaption(
  prevs: MessageToSend[],
  next: MessageToSend,
  userId: string
): MessageToSend[] {
  const index = prevs.findLastIndex((prev) => prev.userId === userId)
  if (index === -1) return [...prevs, next]
  return [...prevs.slice(0, index), next, ...prevs.slice(index + 1)]
}
