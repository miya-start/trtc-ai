import React, { useState, useEffect, type ChangeEvent } from 'react'
import TRTC from 'trtc-js-sdk'

export const Setting: React.FC<{
  roomId: number
  userId: string
  setRoomId: (roomId: number) => void
  setUserId: (userId: string) => void
  setCameraId: (cameraId: string) => void
  setMicrophoneId: (microphoneId: string) => void
  startCall: () => void
}> = ({ userId, setUserId, setCameraId, setMicrophoneId, startCall }) => {
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
    <>
      <div className="p-6 bg-gray-700 text-white">
        <div className="mb-6">
          <label htmlFor="userId" className="block mb-2 text-sm font-medium">
            User Name:
          </label>
          <input
            type="text"
            id="userId"
            className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
            placeholder='e.g. "John"'
            value={userId}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setUserId(e.target.value)
            }
          />
        </div>
        <div className="mb-6">
          <label htmlFor="language" className="block mb-2 text-sm font-medium">
            Language:
          </label>
        </div>
        <div className="mb-6">
          <label
            htmlFor="cameraSelect"
            className="block mb-2 text-sm font-medium"
          >
            Camera:
          </label>
          <select
            id="cameraSelect"
            className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
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
        <div className="mb-6">
          <label
            htmlFor="microphoneSelect"
            className="block mb-2 text-sm font-medium"
          >
            Microphone:
          </label>
          <select
            id="microphoneSelect"
            className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
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
        <button
          className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
          onClick={startCall}
        >
          Start Call
        </button>
      </div>
    </>
  )
}
