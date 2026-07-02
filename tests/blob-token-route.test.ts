import { beforeEach, expect, test } from 'vitest'
import { POST } from '@/app/api/blob-token/route'

beforeEach(() => { process.env.SESSION_SECRET = 'test-secret-at-least-16-chars' })

test('unauthenticated POST gets 401', async () => {
  const res = await POST(new Request('http://localhost/api/blob-token', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  }))
  expect(res.status).toBe(401)
})
