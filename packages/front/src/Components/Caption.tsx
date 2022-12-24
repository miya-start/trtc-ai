import { CaptionText, Languages } from '../types'

export const Captions: React.FC<{
  captionTexts: CaptionText[]
  settingLanguage: Languages[number]['value']
}> = ({ captionTexts: captions, settingLanguage }) => (
  <div>
    {captions
      .sort((a, b) => a.time - b.time)
      .map(({ time, transcript, translates, userId }) => (
        <div key={`${time}${userId}`}>
          <span>{userId}: </span>
          {translates.has(settingLanguage)
            ? translates.get(settingLanguage)
            : transcript}
        </div>
      ))}
  </div>
)
