import { kv } from '@vercel/kv'
import { requireSession } from '@/lib/auth-guard'
import { listEntries } from '@/lib/history'

export async function GET(request: Request): Promise<Response> {
  if (!(await requireSession(request))) {
    return Response.json({ error: 'Nicht angemeldet' }, { status: 401 })
  }
  const entries = await listEntries(kv)
  return Response.json({ entries })
}
