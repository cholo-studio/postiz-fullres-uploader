import { expect, test, vi } from 'vitest'
import { uploadFromUrl } from '@/lib/postiz'

function mockFetch(status: number, body: unknown): typeof fetch {
  return vi.fn(async () =>
    new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }),
  ) as unknown as typeof fetch
}

test('posts the url with the raw auth header and returns the upload', async () => {
  const spy = mockFetch(200, { id: 'abc', name: 'foto.jpg', path: 'https://cdn/x/foto.jpg' })
  const result = await uploadFromUrl({
    apiKey: 'KEY123', url: 'https://blob/foto.jpg', apiBase: 'https://api.test/v1', fetchImpl: spy,
  })
  expect(result).toEqual({ id: 'abc', name: 'foto.jpg', path: 'https://cdn/x/foto.jpg' })
  const call = (spy as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
  expect(call[0]).toBe('https://api.test/v1/upload-from-url')
  expect((call[1] as RequestInit).headers).toMatchObject({ Authorization: 'KEY123' })
})

test('appends missing extension to path from source url (issue #1147)', async () => {
  const spy = mockFetch(200, { id: 'abc', path: 'https://cdn/x/abc' })
  const result = await uploadFromUrl({
    apiKey: 'K', url: 'https://blob/clip.mp4', apiBase: 'https://api.test/v1', fetchImpl: spy,
  })
  expect(result.path).toBe('https://cdn/x/abc.mp4')
})

test('parses extension from a source url that has a query string (#1147)', async () => {
  const spy = mockFetch(200, { id: 'abc', path: 'https://cdn/x/abc' })
  const result = await uploadFromUrl({
    apiKey: 'K', url: 'https://blob/clip.mp4?token=abc123', apiBase: 'https://api.test/v1', fetchImpl: spy,
  })
  expect(result.path).toBe('https://cdn/x/abc.mp4')
})

test('throws a German error on failure', async () => {
  const spy = mockFetch(401, { error: 'unauthorized' })
  await expect(
    uploadFromUrl({ apiKey: 'bad', url: 'https://blob/x.jpg', apiBase: 'https://api.test/v1', fetchImpl: spy }),
  ).rejects.toThrow(/Postiz-Upload fehlgeschlagen/)
})
