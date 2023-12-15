import { ResultAsync } from 'neverthrow'
import fetch from 'node-fetch'

const SPEAKER_ID = 1
const host = (path: string) => `http://localhost:50021${path}`

export const createQuery = (text: string): ResultAsync<string, Error> => {
  return ResultAsync.fromPromise(
    fetch(host(`/audio_query?speaker=${SPEAKER_ID}&text=${text}`), {
      method: 'POST',
    }),
    (error: unknown) =>
      new Error(`Failed to fetch audio query for ${text}: ${error as string}}`)
  )
    .andThen((response) =>
      ResultAsync.fromPromise(
        response.json(),
        (error: unknown) =>
          new Error(
            `Failed to parse audio query for ${text}: ${error as string}`
          )
      )
    )
    .map((json) => JSON.stringify(json))
}

export const createVoice = (query: string): ResultAsync<string, Error> => {
  return ResultAsync.fromPromise(
    fetch(host(`/synthesis?speaker=${SPEAKER_ID}`), {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/json',
      },
    }),
    () => new Error(`Failed to fetch audio for ${query}`)
  ).map(async (response) => {
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer).toString('base64')
  })
}
