'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const KANIT = 'var(--font-kanit), sans-serif'

export default function LoginPage() {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)

  const enter = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/login', { method: 'POST' })
    if (res.ok) router.push('/admin/dashboard')
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D0D14',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      fontFamily: KANIT,
    }}>
      {/* Glow blob */}
      <div style={{
        position: 'fixed', bottom: -200, left: -100,
        width: 600, height: 600, borderRadius: '50%',
        background: 'rgba(255,231,144,0.06)', filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🐹</div>
        <div style={{
          fontSize: 'clamp(28px, 4vw, 42px)',
          fontWeight: 900, color: '#FFE790',
          marginBottom: 8, letterSpacing: -0.5,
        }}>
          Hamstar Admin
        </div>
        <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', marginBottom: 40 }}>
          Race management dashboard
        </div>
        <button
          onClick={enter}
          disabled={loading}
          style={{
            padding: '16px 48px',
            background: '#FFE790',
            border: 'none',
            borderRadius: 9999,
            color: '#0D0D14',
            fontSize: 18,
            fontWeight: 900,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            fontFamily: KANIT,
            boxShadow: '0 20px 40px rgba(255,231,144,0.2)',
            transition: 'opacity 0.15s',
          }}
        >
          {loading ? 'Entering...' : 'Enter Admin →'}
        </button>
      </div>
    </div>
  )
}
