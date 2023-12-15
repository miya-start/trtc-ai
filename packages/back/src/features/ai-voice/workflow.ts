import { ResultAsync } from 'neverthrow'
import { createQuery, createVoice } from './services.js'

export const createAudio = (model: string): ResultAsync<string, Error> =>
  createQuery(model).andThen(createVoice)
