'use client'
import { useState } from 'react'

const KANIT = "var(--font-kanit), sans-serif"
const PRET  = 'Pretendard, sans-serif'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    setLoading(false)
    if (res.ok) {
      window.location.href = '/admin/dashboard'
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Invalid password')
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#0D0D14',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: '#fff', borderRadius: 20,
        padding: '40px 36px',
        width: '100%', maxWidth: 380,
        boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ marginBottom: 8 }}><img src="/images/hamster-flash-flex.png" alt="" style={{ width: 48, height: 48, objectFit: 'contain' }} /></div>
          <h1 style={{ fontFamily: KANIT, fontSize: 22, fontWeight: 700, color: '#000', margin: '0 0 4px' }}>
            Hamstar Admin
          </h1>
          <p style={{ fontFamily: PRET, fontSize: 13, color: '#8A8A8A', margin: 0 }}>
            Enter your password to continue
          </p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontFamily: PRET, fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              style={{
                width: '100%', padding: '12px 14px',
                border: `1.5px solid ${error ? '#FF3B5C' : '#E0E0E0'}`,
                borderRadius: 10, fontSize: 15,
                fontFamily: PRET, outline: 'none',
                color: '#000', background: '#fff',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <p style={{ fontFamily: PRET, fontSize: 13, color: '#FF3B5C', margin: 0 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: '100%', padding: '13px',
              background: '#FFE790', border: 'none', borderRadius: 48.5,
              fontFamily: KANIT, fontSize: 15, fontWeight: 700, color: '#000',
              cursor: loading || !password ? 'not-allowed' : 'pointer',
              opacity: loading || !password ? 0.6 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
