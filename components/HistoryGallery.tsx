'use client'
import { useEffect, useState } from 'react'

interface Entry {
  id: string; filename: string; type: string; thumbnailUrl: string; postizPath: string; uploadedAt: string
}

export default function HistoryGallery({ reloadKey }: { reloadKey: number }) {
  const [entries, setEntries] = useState<Entry[]>([])
  useEffect(() => {
    fetch('/api/history').then((r) => r.json()).then((d) => setEntries(d.entries ?? []))
  }, [reloadKey])
  return (
    <section style={{ marginTop: 32 }}>
      <h2>Zuletzt hochgeladen</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {entries.map((e) => (
          <figure key={e.id} style={{ margin: 0 }}>
            <img src={e.thumbnailUrl} alt={e.filename} style={{ width: '100%', borderRadius: 8 }} />
            <figcaption style={{ fontSize: 12 }}>
              {e.filename}
              <button style={{ display: 'block', marginTop: 4 }}
                onClick={() => navigator.clipboard.writeText(e.postizPath)}>Postiz-Link kopieren</button>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
