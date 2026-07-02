import { timingSafeEqual } from 'crypto'
import { createSessionToken, sessionCookieAttributes } from '@/lib/session'

export async function POST(request: Request): Promise<Response> {
  const { password } = (await request.json().catch(() => ({}))) as { password?: string }
  const expected = process.env.SHARED_PASSWORD
  const secret = process.env.SESSION_SECRET
  if (!expected || !secret) {
    return Response.json({ error: 'Server nicht konfiguriert' }, { status: 500 })
  }
  const a = Buffer.from(password ?? '')
  const b = Buffer.from(expected)
  const match = a.length === b.length && timingSafeEqual(a, b)
  if (!match) {
    return Response.json({ error: 'Falsches Passwort' }, { status: 401 })
  }
  const token = await createSessionToken(secret)
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json', 'set-cookie': sessionCookieAttributes(token) },
  })
}
