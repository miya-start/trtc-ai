import SpeechRecognition from 'react-speech-recognition'

export function startSpeechRecognition(
  browserSupportsSpeechRecognition: boolean
): void {
  if (!browserSupportsSpeechRecognition) {
    throw Error('browser does not support speech recognition')
  }
  SpeechRecognition.startListening({ language: 'ja' })
}
