'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useIsMobile } from '@/components/ui'
import { T } from '@/components/ui'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/race', label: 'Race Control', icon: '🏁' },
  { href: '/admin/pets', label: 'Pets', icon: '🐹' },
  { href: '/admin/media', label: 'Media', icon: '🖼️' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
  { href: '/admin/sponsors', label: 'Sponsors', icon: '🏎️' },
]

export function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useIsMobile() ?? false

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  if (isMobile) {
    return (
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: T.text, borderTop: `2px solid #FFFFFF18`,
        display: 'flex', overflowX: 'auto',
      }}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} style={{
              flex: 1, minWidth: 56, padding: '10px 4px',
              background: 'transparent', textDecoration: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              borderTop: active ? `2px solid ${T.lime}` : '2px solid transparent',
            }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 800, color: active ? T.lime : T.textMuted, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                {item.label.split(' ')[0]}
              </span>
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <aside style={{
      width: 220, flexShrink: 0, background: T.text,
      borderRight: `2px solid #FFFFFF12`,
      display: 'flex', flexDirection: 'column',
      height: '100vh', overflowY: 'auto',
      position: 'sticky', top: 0, alignSelf: 'flex-start',
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 16px', borderBottom: `1px solid #FFFFFF12` }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: T.lime, letterSpacing: 1, textTransform: 'uppercase' }}>
          🐹 Hamstar
        </div>
        <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>Admin Panel</div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', marginBottom: 2,
              background: active ? T.lime + '18' : 'transparent',
              border: 'none',
              borderLeft: active ? `3px solid ${T.lime}` : '3px solid transparent',
              borderRadius: 8, cursor: 'pointer', textAlign: 'left',
              textDecoration: 'none', transition: 'all 0.1s',
            }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: active ? T.lime : T.textMuted }}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 10px', borderTop: `1px solid #FFFFFF12` }}>
        <button onClick={handleLogout} style={{
          width: '100%', padding: '10px 12px', background: 'transparent',
          border: `1px solid ${T.coral}44`, borderRadius: 8,
          color: T.coral, fontSize: 12, fontWeight: 700, cursor: 'pointer', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          🚪 Logout
        </button>
      </div>
    </aside>
  )
}
