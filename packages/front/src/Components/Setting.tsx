import { useState, useEffect, type ChangeEvent } from 'react'
import TRTC from 'trtc-js-sdk'
import { LANGUAGES } from '../constants'
import { type Languages } from '../types'

export const Setting: React.FC<{
  roomId: number
  userId: string
  setLanguage: (languageKey: Languages[number]['value']) => void
  setRoomId: (roomId: number) => void
  setUserId: (userId: string) => void
  setCameraId: (cameraId: string) => void
  setMicrophoneId: (microphoneId: string) => void
  startCall: () => void
}> = ({
  roomId,
  userId,
  setLanguage,
  setRoomId,
  setUserId,
  setCameraId,
  setMicrophoneId,
  startCall,
}) => {
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([])

  useEffect(() => {
    TRTC.getCameras().then((devices) => {
      setCameras(devices)
    })
  }, [])

  useEffect(() => {
    TRTC.getMicrophones().then((devices) => {
      setMicrophones(devices)
    })
  }, [])

  return (
    <div className="container">
      <div>
        <label htmlFor="roomId">Room Number:</label>
        <input
          type="text"
          id="roomId"
          value={roomId}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setRoomId(Number(e.target.value))
          }
        />
      </div>
      <div>
        <label htmlFor="userId">User Name:</label>
        <input
          type="text"
          id="userId"
          value={userId}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setUserId(e.target.value)
          }
        />
      </div>
      <div>
        <label htmlFor="language">Language:</label>
        <select
          id="language"
          defaultValue={'ja'}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            setLanguage(event.target.value as Languages[number]['value'])
          }
        >
          {LANGUAGES.map(({ label, value }) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="cameraSelect">Camera:</label>
        <select
          id="cameraSelect"
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            setCameraId(event.target.value)
          }
        >
          {cameras.map(({ deviceId, label }) => (
            <option value={deviceId} key={deviceId}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="microphoneSelect">Microphone:</label>
        <select
          id="microphoneSelect"
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            setMicrophoneId(event.target.value)
          }
        >
          {microphones.map(({ deviceId, label }) => (
            <option value={deviceId} key={deviceId}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <button onClick={startCall}>Start Call</button>
    </div>
  )
}
