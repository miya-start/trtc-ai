import './style.css'
import TRTC, { Client, LocalStream } from 'trtc-js-sdk'
import {
  generateCameraOption,
  removeCameraListener,
  switchCamera,
} from './cameras'
import { genTestUserSig } from './debug/GenerateTestUserSig'
import { getData } from './store'

getData('/api/test').then((data) => {
  console.log(data)
})

generateCameraOption()

let client: Client
let localStream: LocalStream
let roomId = 1
let userId = 'user1'
document.getElementById('startCall')!.onclick = async function () {
  roomId =
    roomId ??
    parseInt(document.querySelector<HTMLInputElement>('#roomId')!.value)
  userId = document.querySelector<HTMLInputElement>('#userId')!.value || userId
  const { sdkAppId, userSig } = genTestUserSig(userId)
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
    switchCamera(localStream)
  } catch (error) {
    console.error(error)
  }
}

document.getElementById('finishCall')!.onclick = async function () {
  localStream.close()
  await client.leave()
  client.destroy()
  removeCameraListener()
}
