import { MessageToSend } from '../types'

export const Captions: React.FC<{
  captionTexts: MessageToSend[]
}> = ({ captionTexts: captions }) => (
  <div className="absolute bottom-0 bg-gray-800 text-3xl text-white opacity-80">
    {captions
      .sort((a, b) => a.time - b.time)
      .map(({ time, transcript, userId }) => (
        <div className="" key={`${time}${userId}`}>
          <span className="text-2xl">{userId}: </span>
          {transcript}
        </div>
      ))}
  </div>
)
