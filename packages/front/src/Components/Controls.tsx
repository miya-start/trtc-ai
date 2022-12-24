import { useEffect, useState } from 'react'
import SpeechRecognition from 'react-speech-recognition'
import TRTC, { type LocalStream } from 'trtc-js-sdk'

export const Controls: React.FC<{
  localStream: LocalStream | null
}> = ({ localStream }) => {
  const [isMuted, setIsMuted] = useState(false)

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
    <div className="container">
      <div>
        <button
          onClick={() => {
            setIsMuted((prev) => !prev)
          }}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>
    </div>
  )
}
