import { ChangeEvent } from 'react'

export const Setting: React.FC<{
  roomId: number
  userId: string
  setRoomId: (roomId: number) => void
  setUserId: (userId: string) => void
  setDeviceId: (deviceId: string) => void
  cameras: MediaDeviceInfo[]
  startCall: () => void
  finishCall: () => void
}> = ({
  roomId,
  userId,
  setRoomId,
  setUserId,
  setDeviceId,
  cameras,
  startCall,
  finishCall,
}) => {
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
        <label htmlFor="cameraSelect">Camera:</label>
        <select
          id="cameraSelect"
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
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
  )
}
