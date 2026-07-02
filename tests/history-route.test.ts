import { beforeEach, expect, test } from 'vitest'
import { GET } from '@/app/api/history/route'

beforeEach(() => { process.env.SESSION_SECRET = 'test-secret-at-least-16-chars' })

test('unauthenticated request gets 401', async () => {
  const res = await GET(new Request('http://localhost/api/history'))
  expect(res.status).toBe(401)
})
