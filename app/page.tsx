'use client'
import { useState } from 'react'
import Uploader from '@/components/Uploader'
import HistoryGallery from '@/components/HistoryGallery'

export default function Home() {
  const [reloadKey, setReloadKey] = useState(0)
  return (
    <main style={{ maxWidth: 800, margin: '5vh auto', padding: 24 }}>
      <h1 style={{ color: 'var(--primary)' }}>MI PERU Uploader</h1>
      <p>Bilder &amp; Videos in voller Auflösung in die Postiz-Mediathek laden.</p>
      <Uploader onDone={() => setReloadKey((k) => k + 1)} />
      <HistoryGallery reloadKey={reloadKey} />
    </main>
  )
}
