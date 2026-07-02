export interface PostizUpload {
  id: string
  path: string
  name?: string
}

function extensionOf(url: string): string | null {
  const clean = url.split('?')[0].split('#')[0]
  const last = clean.substring(clean.lastIndexOf('/') + 1)
  const dot = last.lastIndexOf('.')
  return dot > 0 ? last.substring(dot + 1) : null
}

function hasExtension(path: string): boolean {
  const clean = path.split('?')[0].split('#')[0]
  const last = clean.substring(clean.lastIndexOf('/') + 1)
  return last.lastIndexOf('.') > 0
}

export async function uploadFromUrl(opts: {
  apiKey: string
  url: string
  apiBase?: string
  fetchImpl?: typeof fetch
}): Promise<PostizUpload> {
  const apiBase = opts.apiBase ?? 'https://api.postiz.com/public/v1'
  const doFetch = opts.fetchImpl ?? fetch
  const res = await doFetch(`${apiBase}/upload-from-url`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', Authorization: opts.apiKey },
    body: JSON.stringify({ url: opts.url }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Postiz-Upload fehlgeschlagen (${res.status}): ${text}`)
  }
  const data = (await res.json()) as PostizUpload
  if (data.path && !hasExtension(data.path)) {
    const ext = extensionOf(opts.url)
    if (ext) data.path = `${data.path}.${ext}`
  }
  return data
}
