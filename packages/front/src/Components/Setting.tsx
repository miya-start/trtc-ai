import { useState, useEffect, ChangeEvent } from 'react'
import TRTC from 'trtc-js-sdk'

export type Languages = readonly [
  { label: 'English'; value: 'en' },
  { label: '日本語'; value: 'ja' }
]
const languages = [
  { label: 'English', value: 'en' },
  { label: '日本語', value: 'ja' },
] as const satisfies Languages

export const Setting: React.FC<{
  roomId: number
  userId: string
  setLanguage: (languageKey: Languages[number]['value']) => void
  setRoomId: (roomId: number) => void
  setUserId: (userId: string) => void
  setDeviceId: (deviceId: string) => void
  startCall: () => void
  finishCall: () => void
}> = ({
  roomId,
  userId,
  setLanguage,
  setRoomId,
  setUserId,
  setDeviceId,
  startCall,
  finishCall,
}) => {
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])

  useEffect(() => {
    TRTC.getCameras().then((devices) => {
      setCameras(devices)
    })
  }, [])

  return (
    <div className="container">
      <div>
        <label htmlFor="roomId">Room ID:</label>
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
        <label htmlFor="userId">User ID:</label>
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
          {languages.map(({ label, value }) => (
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
            setDeviceId(event.target.value)
          }
        >
          {cameras.map(({ deviceId, label }) => (
            <option value={deviceId} key={deviceId}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <button onClick={startCall}>Start Call</button>
      <button onClick={finishCall}>Finish Call</button>
    </div>
  )
}
