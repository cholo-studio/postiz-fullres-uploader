'use client'
import { useState } from 'react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/login', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) window.location.href = '/'
    else setError('Falsches Passwort')
  }
  return (
    <main style={{ maxWidth: 360, margin: '15vh auto', padding: 24 }}>
      <h1 style={{ color: 'var(--primary)' }}>MI PERU Uploader</h1>
      <p>Bitte Team-Passwort eingeben.</p>
      <form onSubmit={submit}>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Passwort" style={{ width: '100%', padding: 12, fontSize: 16 }} />
        {error && <p style={{ color: 'var(--primary)' }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: 12, marginTop: 12,
          background: 'var(--primary)', color: '#fff', border: 0, fontSize: 16 }}>Anmelden</button>
      </form>
    </main>
  )
}
