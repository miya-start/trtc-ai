export async function getData<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (res.ok) return res.json()
  throw Error(`Could not fetch ${url}, status code: ${res.status}`)
}
