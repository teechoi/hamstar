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
        background: A.sidebar, borderTop: `1px solid ${A.sidebarBorder}`,
        display: 'flex', overflowX: 'auto',
      }}>
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} style={{
              flex: 1, minWidth: 52, padding: '10px 4px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              textDecoration: 'none',
              borderTop: active ? `2px solid ${A.yellow}` : '2px solid transparent',
            }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', color: active ? A.yellow : A.sidebarMuted }}>
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
      borderRight: `1px solid ${A.sidebarBorder}`,
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
    }}>
      {/* Brand */}
      <div style={{ padding: '28px 24px 22px', borderBottom: `1px solid ${A.sidebarBorder}` }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: A.yellow, letterSpacing: -0.5 }}>
          🐹 Hamstar
        </div>
        <div style={{ fontSize: 11, color: A.sidebarMuted, marginTop: 3, letterSpacing: 1, textTransform: 'uppercase' }}>
          Admin Panel
        </div>
      </div>

      {/* Links */}
      <nav style={{ flex: 1, padding: '16px 14px', overflowY: 'auto' }}>
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', marginBottom: 4,
              borderRadius: 9999, textDecoration: 'none',
              background: active ? A.sidebarActive : 'transparent',
              border: `1.5px solid ${active ? A.yellow + '55' : 'transparent'}`,
              transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: active ? A.yellow : A.sidebarMuted }}>
                {label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '14px', borderTop: `1px solid ${A.sidebarBorder}` }}>
        <button onClick={logout} style={{
          width: '100%', padding: '10px 14px',
          background: 'transparent',
          border: `1.5px solid rgba(255,59,92,0.3)`,
          borderRadius: 9999, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
          color: '#FF3B5C', fontSize: 12, fontWeight: 700,
          fontFamily: 'inherit', transition: 'background 0.15s',
        }}>
          🚪 Logout
        </button>
      </div>
    </aside>
  )
}
