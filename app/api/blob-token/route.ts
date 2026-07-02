import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { requireSession } from '@/lib/auth-guard'
import { isAllowedType } from '@/lib/validation'

export async function POST(request: Request): Promise<Response> {
  if (!(await requireSession(request))) {
    return Response.json({ error: 'Nicht angemeldet' }, { status: 401 })
  }
  const body = (await request.json()) as HandleUploadBody
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const mime = clientPayload ? (JSON.parse(clientPayload).type as string) : ''
        return {
          allowedContentTypes: isAllowedType(mime) ? [mime] : [],
          maximumSizeInBytes: 512 * 1024 * 1024,
        }
      },
      onUploadCompleted: async () => {},
    })
    return Response.json(result)
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 })
  }
}
