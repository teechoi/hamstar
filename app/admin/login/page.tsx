'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { T, LimeButton } from '@/components/ui'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push('/admin/dashboard')
      } else {
        const data = await res.json()
        setError(data.error || 'Incorrect password')
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🐹</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: T.lime, letterSpacing: -0.5 }}>Hamstar Admin</div>
          <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>Sign in to manage your races</div>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} style={{
          background: '#FFFFFF08', border: `1.5px solid #FFFFFF18`,
          borderRadius: 16, padding: 28,
        }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: T.textMuted, marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Admin Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoFocus
            style={{
              width: '100%', padding: '12px 14px', marginBottom: 20,
              background: '#FFFFFF0A', border: `1.5px solid ${error ? T.coral : '#FFFFFF22'}`,
              borderRadius: 8, fontSize: 14, color: T.card, outline: 'none',
              fontFamily: 'inherit',
            }}
          />

          {error && (
            <div style={{ marginBottom: 16, fontSize: 13, color: T.coral, fontWeight: 600 }}>
              ⚠️ {error}
            </div>
          )}

          <LimeButton fullWidth onClick={() => {}}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </LimeButton>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#FFFFFF22' }}>
          hamstar.xyz admin panel
        </div>
      </div>
    </div>
  )
}
