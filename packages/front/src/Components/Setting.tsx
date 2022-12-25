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
    <>
      <div className="p-6 bg-gray-700 text-white">
        <div className="mb-6">
          <label htmlFor="roomId" className="block mb-2 text-sm font-medium">
            Room Number:
          </label>
          <input
            type="text"
            id="roomId"
            className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
            placeholder='e.g. "1"'
            value={roomId}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setRoomId(Number(e.target.value))
            }
          />
        </div>
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
          <select
            id="language"
            className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
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
