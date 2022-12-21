import { useEffect, useState, useRef, ChangeEvent } from 'react'
import TRTC, { Client, LocalStream } from 'trtc-js-sdk'
import { genTestUserSig } from './debug/GenerateTestUserSig'
import { io, Socket } from 'socket.io-client'
import './style.css'

const App: React.FC = () => {
  const cameraSelect = useRef<HTMLSelectElement>(null)
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [client, setClient] = useState<Client | null>(null)
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [localStream, setLocalStream] = useState<LocalStream | null>(null)
  const [roomId, setRoomId] = useState(1)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [userId, setUserId] = useState('user1')

  const switchCamera = (ilocalStream: LocalStream) => {
    setLocalStream(ilocalStream)
  }

  const handleTRTC = async () => {
    const { sdkAppId, userSig } = genTestUserSig(userId)
    const iclient = TRTC.createClient({
      mode: 'rtc',
      sdkAppId,
      userId,
      userSig,
    })
    setClient(iclient)
    iclient.on('stream-added', (event) => {
      const remoteStream = event.stream
      console.log('remote stream add streamId: ' + remoteStream.getId())
      iclient.subscribe(remoteStream)
    })
    iclient.on('stream-subscribed', (event) => {
      const remoteStream = event.stream
      remoteStream.play('remoteStreamContainer')
    })

    try {
      await iclient.join({ roomId })
      const localStream = TRTC.createStream({
        userId,
        audio: true,
        video: true,
      })
      await localStream.initialize()
      localStream.play('localStreamContainer')
      await iclient.publish(localStream)
      switchCamera(localStream)
    } catch (error) {
      console.error(error)
    }
  }

  const handleSocket = () => {
    const isocket = io()
    setSocket(isocket)
    isocket.on('connect', () => {
      console.log('connected')
    })
  }

  const startCall = async () => {
    handleTRTC()
    handleSocket()
  }

  const finishCall = async () => {
    if (!localStream) return
    if (!client || !socket) {
      throw Error('client or socket is null')
    }
    localStream.close()
    await client.leave()
    client.destroy()
    socket.disconnect()
  }

  useEffect(() => {
    TRTC.getCameras().then((devices) => {
      setCameras(devices)
    })
  }, [])

  useEffect(() => {
    if (localStream && deviceId) {
      localStream.switchDevice('video', deviceId)
    }
  }, [localStream, deviceId])

  return (
    <>
      <div className="container">
        <div>
          <label htmlFor="roomId">Room ID:</label>
          <input
            type="number"
            id="roomId"
            value={roomId}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setRoomId(parseInt(e.target.value))
            }
          />
        </div>

        <label htmlFor="userId">User ID:</label>
        <input
          type="text"
          id="userId"
          value={userId}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setUserId(e.target.value)
          }
        />
        <div>
          <label htmlFor="cameraSelect">Camera:</label>
          <select
            id="cameraSelect"
            ref={cameraSelect}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
              setDeviceId(event.target.value)
            }
          >
            {cameras.map((device) => (
              <option value={device.deviceId} key={device.deviceId}>
                {device.label}
              </option>
            ))}
          </select>
        </div>
        <button onClick={startCall}>Start Call</button>
        <button onClick={finishCall}>Finish Call</button>
      </div>
      <div id="localStreamContainer" />
      <div id="remoteStreamContainer" />
    </>
  )
}

export default App
