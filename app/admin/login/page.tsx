'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const KANIT = "var(--font-kanit), sans-serif"

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [err,      setErr]      = useState('')
  const router = useRouter()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push('/admin/dashboard')
        router.refresh()
      } else {
        setErr(data.error ?? 'Invalid password')
      }
    } catch {
      setErr('Network error — try again')
    }
    setLoading(false)
  }

  return (
    // Full-viewport overlay — sits above the layout sidebar
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#0D0D14',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 20,
        padding: '44px 40px',
        width: '100%', maxWidth: 380,
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🐹</div>
          <h1 style={{
            fontFamily: KANIT, fontSize: 22, fontWeight: 700,
            color: '#0D0D14', marginBottom: 4,
          }}>
            Hamstar Admin
          </h1>
          <p style={{ fontSize: 13, color: '#9A9A9A' }}>Enter your password to continue</p>
        </div>

        <form onSubmit={submit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block', fontSize: 11, fontWeight: 700,
              color: '#555555', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8,
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              required
              style={{
                width: '100%', padding: '12px 16px',
                borderRadius: 10, border: `1.5px solid ${err ? '#FF3B5C' : '#E0E0E0'}`,
                fontSize: 15, color: '#0D0D14', outline: 'none',
                transition: 'border-color 0.15s',
              }}
            />
          </div>

          {err && (
            <p style={{ fontSize: 13, color: '#FF3B5C', fontWeight: 600, marginBottom: 12 }}>
              {err}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: '100%', padding: '13px', borderRadius: 48.5, border: 'none',
              background: loading || !password ? '#E0E0E0' : '#FFE790',
              fontFamily: KANIT, fontSize: 15, fontWeight: 700,
              color: loading || !password ? '#9A9A9A' : '#0D0D14',
              cursor: loading || !password ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
