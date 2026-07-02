import { afterEach, beforeEach, expect, test } from 'vitest'
import { POST } from '@/app/api/login/route'
import { SESSION_COOKIE } from '@/lib/session'

beforeEach(() => {
  process.env.SHARED_PASSWORD = 'geheim123'
  process.env.SESSION_SECRET = 'test-secret-at-least-16-chars'
})

function req(body: unknown): Request {
  return new Request('http://localhost/api/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

test('correct password returns 200 and sets the session cookie', async () => {
  const res = await POST(req({ password: 'geheim123' }))
  expect(res.status).toBe(200)
  expect(res.headers.get('set-cookie') ?? '').toContain(`${SESSION_COOKIE}=`)
})

test('wrong password returns 401 and no cookie', async () => {
  const res = await POST(req({ password: 'falsch' }))
  expect(res.status).toBe(401)
  expect(res.headers.get('set-cookie')).toBeNull()
  expect(await res.json()).toEqual({ error: 'Falsches Passwort' })
})

test('empty-string password returns 401', async () => {
  const res = await POST(req({ password: '' }))
  expect(res.status).toBe(401)
  expect(await res.json()).toEqual({ error: 'Falsches Passwort' })
})

test('missing SHARED_PASSWORD env returns 500', async () => {
  const saved = process.env.SHARED_PASSWORD
  delete process.env.SHARED_PASSWORD
  try {
    const res = await POST(req({ password: 'geheim123' }))
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'Server nicht konfiguriert' })
  } finally {
    process.env.SHARED_PASSWORD = saved
  }
})
