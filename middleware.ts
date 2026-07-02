import { NextRequest, NextResponse } from 'next/server'
import { readCookie, verifySessionToken, SESSION_COOKIE } from '@/lib/session'

export async function middleware(req: NextRequest) {
  const secret = process.env.SESSION_SECRET ?? ''
  const token = readCookie(req.headers.get('cookie'), SESSION_COOKIE)
  const ok = await verifySessionToken(token, secret)
  if (!ok) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = { matcher: ['/'] }
