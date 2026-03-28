'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { A } from '../theme'

export default function AdminLogin() {
  const router = useRouter()
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErr('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    })
    setLoading(false)
    if (res.ok) {
      router.push('/admin/dashboard')
    } else {
      setErr('Incorrect password')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: A.sidebar,
    }}>
      <form onSubmit={submit} style={{
        background: A.card, borderRadius: 20,
        padding: '48px 40px', width: 360,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🐹</div>
          <h1 style={{ fontFamily: 'var(--font-kanit), sans-serif', fontSize: 24, fontWeight: 700, color: A.text, marginBottom: 6 }}>
            Hamstar Admin
          </h1>
          <p style={{ fontSize: 14, color: A.textMuted }}>Enter your password to continue</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: A.textMid }}>Password</label>
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="••••••••"
            style={{
              padding: '12px 16px', borderRadius: 10,
              border: err ? `1.5px solid ${A.red}` : `1.5px solid ${A.borderMid}`,
              fontSize: 14, outline: 'none', background: A.pageBg,
            }}
          />
          {err && <p style={{ fontSize: 12, color: A.red }}>{err}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '14px', borderRadius: 48.5,
            background: A.yellow, border: 'none',
            fontFamily: 'var(--font-kanit), sans-serif',
            fontSize: 15, fontWeight: 700, color: A.yellowText,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s',
          }}
        >
          {loading ? 'Checking...' : 'Enter'}
        </button>
      </form>
    </div>
  )
}
