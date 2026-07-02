import { expect, test } from 'vitest'
import {
  createSessionToken, verifySessionToken, readCookie, sessionCookieAttributes, SESSION_COOKIE,
} from '@/lib/session'

const SECRET = 'test-secret-at-least-16-chars'

test('a freshly created token verifies', async () => {
  const token = await createSessionToken(SECRET)
  expect(await verifySessionToken(token, SECRET)).toBe(true)
})

test('an undefined or tampered token fails', async () => {
  expect(await verifySessionToken(undefined, SECRET)).toBe(false)
  expect(await verifySessionToken('garbage.token.value', SECRET)).toBe(false)
})

test('a token signed with a different secret fails', async () => {
  const token = await createSessionToken(SECRET)
  expect(await verifySessionToken(token, 'another-secret-16chars')).toBe(false)
})

test('readCookie extracts the named cookie', () => {
  const header = `foo=bar; ${SESSION_COOKIE}=abc123; baz=qux`
  expect(readCookie(header, SESSION_COOKIE)).toBe('abc123')
  expect(readCookie(null, SESSION_COOKIE)).toBeUndefined()
})

test('sessionCookieAttributes marks the cookie httpOnly and secure', () => {
  const value = sessionCookieAttributes('tok')
  expect(value).toContain(`${SESSION_COOKIE}=tok`)
  expect(value).toContain('HttpOnly')
  expect(value).toContain('Secure')
  expect(value).toContain('SameSite=Lax')
})
