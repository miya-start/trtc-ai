import { Socket } from 'socket.io'

export type MessageReceived = {
  transcript: string
  time: number
  userId: string
}

export async function emitMessage({
  message,
  roomId,
  socket,
}: {
  message: MessageReceived
  roomId: string
  socket: Socket
}): Promise<void> {
  socket.to(roomId).emit('receive-message', message)
}
