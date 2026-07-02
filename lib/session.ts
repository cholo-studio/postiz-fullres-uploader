import { SignJWT, jwtVerify } from 'jose'

export const SESSION_COOKIE = 'miperu_session'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30

function key(secret: string): Uint8Array {
  return new TextEncoder().encode(secret)
}

export async function createSessionToken(secret: string): Promise<string> {
  return new SignJWT({ role: 'staff' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(key(secret))
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string,
): Promise<boolean> {
  if (!token) return false
  try {
    await jwtVerify(token, key(secret))
    return true
  } catch {
    return false
  }
}

export function readCookie(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined
  for (const part of cookieHeader.split(';')) {
    const [k, ...rest] = part.trim().split('=')
    if (k === name) return rest.join('=')
  }
  return undefined
}

export function sessionCookieAttributes(token: string): string {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}`
}

export function sessionCookieClearAttributes(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
}
