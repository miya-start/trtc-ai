import { CaptionText, Languages } from '../types'

export const Captions: React.FC<{
  captionTexts: CaptionText[]
  settingLanguage: Languages[number]['value']
}> = ({ captionTexts: captions, settingLanguage }) => (
  <div className="absolute bottom-0 bg-gray-800 text-3xl text-white opacity-80">
    {captions
      .sort((a, b) => a.time - b.time)
      .map(({ time, transcript, translates, userId }) => (
        <div className="" key={`${time}${userId}`}>
          <span className="text-2xl">{userId}: </span>
          {translates.has(settingLanguage)
            ? translates.get(settingLanguage)
            : transcript}
        </div>
      ))}
  </div>
)
