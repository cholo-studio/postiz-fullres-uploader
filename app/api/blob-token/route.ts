import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { requireSession } from '@/lib/auth-guard'
import { isAllowedType } from '@/lib/validation'

export async function POST(request: Request): Promise<Response> {
  if (!(await requireSession(request))) {
    return Response.json({ error: 'Nicht angemeldet' }, { status: 401 })
  }
  try {
    const body = (await request.json()) as HandleUploadBody
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        let mime = ''
        try { mime = clientPayload ? (JSON.parse(clientPayload).type as string) : '' } catch { mime = '' }
        return {
          allowedContentTypes: isAllowedType(mime) ? [mime] : [],
          maximumSizeInBytes: 512 * 1024 * 1024,
        }
      },
      onUploadCompleted: async () => {},
    })
    return Response.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload-Fehler'
    return Response.json({ error: message }, { status: 400 })
  }
}
