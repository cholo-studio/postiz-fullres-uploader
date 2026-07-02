'use client'
import { useState } from 'react'
import { upload } from '@vercel/blob/client'
import { makeThumbnail } from '@/lib/thumbnail'
import { isAllowedType, mediaKind } from '@/lib/validation'
import { lang } from '@/lib/branding'
import { getStrings } from '@/lib/strings'

const t = getStrings(lang)

type Status = { id: string; name: string; state: 'running' | 'done' | 'error'; message?: string }

export default function Uploader({ onDone }: { onDone: () => void }) {
  const [statuses, setStatuses] = useState<Status[]>([])

  async function handleFiles(files: FileList | null) {
    if (!files) return
    for (const file of Array.from(files)) {
      const id = crypto.randomUUID()
      if (!isAllowedType(file.type)) {
        setStatuses((s) => [{ id, name: file.name, state: 'error', message: t.typeNotAllowed }, ...s])
        continue
      }
      const kind = mediaKind(file.type)
      if (!kind) {
        setStatuses((s) => [{ id, name: file.name, state: 'error', message: t.typeNotAllowed }, ...s])
        continue
      }
      setStatuses((s) => [{ id, name: file.name, state: 'running' }, ...s])
      try {
        const thumb = await makeThumbnail(file)
        const original = await upload(file.name, file, {
          access: 'public', handleUploadUrl: '/api/blob-token',
          clientPayload: JSON.stringify({ type: file.type }),
        })
        const thumbUp = await upload(`thumb-${file.name}.jpg`, thumb, {
          access: 'public', handleUploadUrl: '/api/blob-token',
          clientPayload: JSON.stringify({ type: 'image/jpeg' }),
        })
        const res = await fetch('/api/finalize', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            originalBlobUrl: original.url, thumbnailBlobUrl: thumbUp.url,
            filename: file.name, type: kind, sizeBytes: file.size,
          }),
        })
        if (!res.ok) throw new Error((await res.json()).error ?? t.genericError)
        setStatuses((s) => s.map((x) => x.id === id && x.state === 'running'
          ? { id, name: file.name, state: 'done' } : x))
        onDone()
      } catch (err) {
        setStatuses((s) => s.map((x) => x.id === id && x.state === 'running'
          ? { id, name: file.name, state: 'error', message: (err as Error).message } : x))
      }
    }
  }

  return (
    <section>
      <label style={{ display: 'block', border: '2px dashed var(--accent)', padding: 40,
        textAlign: 'center', borderRadius: 12, cursor: 'pointer' }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}>
        {t.dropzone}
        <input type="file" multiple accept="image/*,video/mp4" style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)} />
      </label>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {statuses.map((s) => (
          <li key={s.id} style={{ padding: 8 }}>
            {s.state === 'done' ? '✓' : s.state === 'error' ? '✕' : '…'} {s.name}
            {s.message ? ` — ${s.message}` : ''}
          </li>
        ))}
      </ul>
    </section>
  )
}
