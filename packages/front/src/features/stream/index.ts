import { useEffect } from 'react'
import TRTC, { type Client, type LocalStream } from 'trtc-js-sdk'
import { genTestUserSig } from '../../debug/GenerateTestUserSig'

const handleTRTC = async ({
  roomId,
  userId,
}: {
  roomId: number
  userId: string
}) => {
  const client = TRTC.createClient({
    mode: 'rtc',
    userId,
    ...genTestUserSig(userId),
  })
  client.on('stream-added', ({ stream }) => client.subscribe(stream))
  client.on('stream-subscribed', ({ stream }) =>
    stream.play('remoteStreamContainer')
  )

  await client.join({ roomId })
  const localStream = TRTC.createStream({
    userId,
    audio: true,
    video: true,
  })
  await localStream.initialize()
  localStream.play('localStreamContainer')
  await client.publish(localStream)

  return {
    client,
    localStream,
  }
}

export async function startSteam({
  setClient,
  setIsConnected,
  setLocalStream,
}: {
  setClient: (client: Client) => void
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>
  setLocalStream: (localStream: LocalStream) => void
}) {
  const { client, localStream } = await handleTRTC({ roomId: 1, userId: '1' })
  setClient(client)
  setIsConnected(true)
  setLocalStream(localStream)
}

export async function finishStream(
  client: Client | null,
  localStream: LocalStream | null,
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>
) {
  if (!localStream) return
  if (!client) throw Error('client is null')

  localStream.close()
  await client.leave()
  client.destroy()
  setIsConnected(false)
}

export function useSwitchDevice({
  localStream,
  cameraId,
  microphoneId,
}: {
  localStream: LocalStream | null
  cameraId: string | null
  microphoneId: string | null
}) {
  useEffect(() => {
    if (!localStream) return

    if (localStream.hasVideo() && cameraId)
      localStream.switchDevice('video', cameraId)

    if (localStream.hasAudio() && microphoneId)
      localStream.switchDevice('audio', microphoneId)
  }, [localStream, cameraId, microphoneId])
}
