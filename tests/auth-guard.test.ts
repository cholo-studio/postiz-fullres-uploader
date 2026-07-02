import { beforeEach, expect, test } from 'vitest'
import { requireSession } from '@/lib/auth-guard'
import { createSessionToken, sessionCookieAttributes } from '@/lib/session'

beforeEach(() => { process.env.SESSION_SECRET = 'test-secret-at-least-16-chars' })

test('accepts a request carrying a valid session cookie', async () => {
  const token = await createSessionToken(process.env.SESSION_SECRET!)
  const cookie = sessionCookieAttributes(token).split(';')[0]
  const req = new Request('http://localhost/api/blob-token', { headers: { cookie } })
  expect(await requireSession(req)).toBe(true)
})

test('rejects a request with no cookie', async () => {
  const req = new Request('http://localhost/api/blob-token')
  expect(await requireSession(req)).toBe(false)
})

test('rejects when SESSION_SECRET is unset', async () => {
  const saved = process.env.SESSION_SECRET
  delete process.env.SESSION_SECRET
  try {
    const req = new Request('http://localhost/api/blob-token')
    expect(await requireSession(req)).toBe(false)
  } finally {
    process.env.SESSION_SECRET = saved
  }
})
