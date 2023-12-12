import TRTC from 'trtc-js-sdk'
import { genTestUserSig } from '../../debug/GenerateTestUserSig'

export const handleTRTC = async ({
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
