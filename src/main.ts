import './style.css'
import TRTC, { Client, LocalStream } from 'trtc-js-sdk'

const sdkAppId = import.meta.env.VITE_SDKAPPID | 0
const userSig = import.meta.env.VITE_USERSIG

let roomId = 1
let userId = '1'
let client: Client
let localStream: LocalStream
document.getElementById('startCall')!.onclick = async function () {
  roomId =
    roomId ??
    parseInt(document.querySelector<HTMLInputElement>('#roomId')!.value)
  userId = userId ?? document.querySelector<HTMLInputElement>('#userId')!.value
  client = TRTC.createClient({ mode: 'rtc', sdkAppId, userId, userSig })
  client.on('stream-added', (event) => {
    const remoteStream = event.stream
    console.log('remote stream add streamId: ' + remoteStream.getId())
    client.subscribe(remoteStream)
  })
  client.on('stream-subscribed', (event) => {
    const remoteStream = event.stream
    remoteStream.play('remoteStreamContainer')
  })
  try {
    await client.join({ roomId })
    localStream = TRTC.createStream({ userId, audio: true, video: true })
    await localStream.initialize()
    localStream.play('localStreamContainer')
    await client.publish(localStream)
  } catch (error) {
    console.error(error)
  }
}
document.getElementById('finishCall')!.onclick = async function () {
  localStream.close()
  await client.leave()
  client.destroy()
}
