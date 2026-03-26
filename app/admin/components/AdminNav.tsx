'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useIsMobile } from '@/components/ui'
import { A } from '../theme'

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard',    icon: '📊' },
  { href: '/admin/race',      label: 'Race Control', icon: '🏁' },
  { href: '/admin/pets',      label: 'Hamsters',     icon: '🐹' },
  { href: '/admin/media',     label: 'Media',        icon: '🎥' },
  { href: '/admin/sponsors',  label: 'Sponsors',     icon: '🏆' },
  { href: '/admin/settings',  label: 'Settings',     icon: '⚙️' },
]

export function AdminNav() {
  const pathname = usePathname()
  const router   = useRouter()
  const isMobile = useIsMobile() ?? false

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  if (isMobile) {
    return (
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: A.sidebar, borderTop: `1px solid ${A.border}`,
        display: 'flex', overflowX: 'auto',
      }}>
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} style={{
              flex: 1, minWidth: 52, padding: '10px 4px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              textDecoration: 'none',
              borderTop: active ? `2px solid ${A.gold}` : '2px solid transparent',
            }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', color: active ? A.gold : A.textMuted }}>
                {label.split(' ')[0]}
              </span>
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: A.sidebar,
      borderRight: `1px solid ${A.border}`,
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
    }}>
      {/* Brand */}
      <div style={{ padding: '24px 20px 20px', borderBottom: `1px solid ${A.border}` }}>
        <div style={{ fontSize: 18, fontWeight: 900, color: A.gold, letterSpacing: -0.5 }}>
          🐹 Hamstar
        </div>
        <div style={{ fontSize: 11, color: A.textMuted, marginTop: 3, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Admin
        </div>
      </div>

      {/* Links */}
      <nav style={{ flex: 1, padding: '14px 12px', overflowY: 'auto' }}>
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', marginBottom: 2,
              borderRadius: 10, textDecoration: 'none',
              background: active ? A.goldSoft : 'transparent',
              borderLeft: `3px solid ${active ? A.gold : 'transparent'}`,
              transition: 'background 0.15s',
            }}>
              <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: active ? A.gold : A.textMid }}>
                {label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px', borderTop: `1px solid ${A.border}` }}>
        <button onClick={logout} style={{
          width: '100%', padding: '10px 12px',
          background: 'transparent',
          border: `1px solid ${A.red}44`,
          borderRadius: 8, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
          color: A.red, fontSize: 12, fontWeight: 700,
          fontFamily: 'inherit',
        }}>
          🚪 Logout
        </button>
      </div>
    </aside>
  )
}
