'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { A } from '../theme'

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
    <div style={{ minHeight: '100vh', background: A.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🐹</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: A.gold, marginBottom: 6 }}>Hamstar Admin</div>
        <div style={{ fontSize: 13, color: A.textMuted, marginBottom: 36 }}>Race management dashboard</div>
        <button
          onClick={enter}
          disabled={loading}
          style={{
            padding: '14px 40px', background: A.gold, border: 'none', borderRadius: 14,
            color: A.goldText, fontSize: 16, fontWeight: 900, cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, fontFamily: 'inherit',
          }}
        >
          {loading ? 'Entering...' : 'Enter Admin →'}
        </button>
      </div>
    </div>
  )
}
