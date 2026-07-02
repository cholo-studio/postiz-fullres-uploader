'use client'
import { useState } from 'react'
import { upload } from '@vercel/blob/client'
import { makeThumbnail } from '@/lib/thumbnail'
import { isAllowedType, mediaKind } from '@/lib/validation'

type Status = { name: string; state: 'läuft' | 'fertig' | 'fehler'; message?: string }

export default function Uploader({ onDone }: { onDone: () => void }) {
  const [statuses, setStatuses] = useState<Status[]>([])

  async function handleFiles(files: FileList | null) {
    if (!files) return
    for (const file of Array.from(files)) {
      if (!isAllowedType(file.type)) {
        setStatuses((s) => [{ name: file.name, state: 'fehler', message: 'Dateityp nicht erlaubt' }, ...s])
        continue
      }
      setStatuses((s) => [{ name: file.name, state: 'läuft' }, ...s])
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
            filename: file.name, type: mediaKind(file.type), sizeBytes: file.size,
          }),
        })
        if (!res.ok) throw new Error((await res.json()).error ?? 'Fehler')
        setStatuses((s) => s.map((x) => x.name === file.name && x.state === 'läuft'
          ? { name: file.name, state: 'fertig' } : x))
        onDone()
      } catch (err) {
        setStatuses((s) => s.map((x) => x.name === file.name && x.state === 'läuft'
          ? { name: file.name, state: 'fehler', message: (err as Error).message } : x))
      }
    }
  }

  return (
    <section>
      <label style={{ display: 'block', border: '2px dashed var(--accent)', padding: 40,
        textAlign: 'center', borderRadius: 12, cursor: 'pointer' }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}>
        Bilder oder Videos hierher ziehen oder klicken zum Auswählen
        <input type="file" multiple accept="image/*,video/mp4" style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)} />
      </label>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {statuses.map((s, i) => (
          <li key={i} style={{ padding: 8 }}>
            {s.state === 'fertig' ? '✓' : s.state === 'fehler' ? '✕' : '…'} {s.name}
            {s.message ? ` — ${s.message}` : ''}
          </li>
        ))}
      </ul>
    </section>
  )
}
