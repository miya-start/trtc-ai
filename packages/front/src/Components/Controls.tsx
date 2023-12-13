import React, { useEffect } from 'react'
import SpeechRecognition from 'react-speech-recognition'
import TRTC, { type LocalStream } from 'trtc-js-sdk'

export const Controls: React.FC<{
  isMuted: boolean
  setIsMuted: React.Dispatch<React.SetStateAction<boolean>>
  finishCall: () => void
  localStream: LocalStream | null
}> = ({ isMuted, setIsMuted, finishCall, localStream }) => {
  useEffect(() => {
    if (!localStream) return
    if (isMuted) {
      SpeechRecognition.stopListening()
      localStream.muteAudio()
      const audioTrack = localStream.getAudioTrack()
      if (audioTrack) {
        // stop microphone capture
        audioTrack.stop()
      }
    } else {
      SpeechRecognition.startListening()
      const stream = TRTC.createStream({ audio: true, video: false })
      stream.initialize().then(() => {
        const audioTrack = stream.getAudioTrack()
        if (audioTrack) {
          localStream.replaceTrack(audioTrack)
        }
      })
    }
  }, [isMuted, localStream])

  return (
    <>
      <div>
        <button
          className="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800"
          onClick={() => {
            setIsMuted((prev) => !prev)
          }}
        >
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            {isMuted ? 'Unmute' : 'Mute'}
          </span>
        </button>
      </div>
      <button
        className="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800"
        onClick={finishCall}
      >
        <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
          End
        </span>
      </button>
    </>
  )
}
