import { readCookie, verifySessionToken, SESSION_COOKIE } from '@/lib/session'

export async function requireSession(request: Request): Promise<boolean> {
  const secret = process.env.SESSION_SECRET
  if (!secret) return false
  const token = readCookie(request.headers.get('cookie'), SESSION_COOKIE)
  return verifySessionToken(token, secret)
}
