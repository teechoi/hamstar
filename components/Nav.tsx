// components/Nav.tsx
'use client'
import { T, CheckerBar, LivePulse } from './ui'

type Tab = 'Race' | 'Pets' | 'Community' | 'Arenas' | 'Sponsors'

interface NavProps {
  tab: Tab
  setTab: (t: Tab) => void
  isLive: boolean
}

const TABS: Tab[] = ['Race', 'Pets', 'Community', 'Arenas', 'Sponsors']

export function Nav({ tab, setTab, isLive }: NavProps) {
  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: T.card, borderBottom: `2px solid ${T.text}` }}>
      <CheckerBar />
      <div style={{ padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 62, maxWidth: 1280, margin: '0 auto' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: T.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🐹</div>
          <span style={{ fontSize: 20, fontWeight: 900, color: T.text, letterSpacing: -1 }}>
            Hamstar<span style={{ color: T.blue }}>Hub</span>
          </span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, border: `2px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 18px',
              background: tab === t ? T.text : 'transparent',
              color: tab === t ? T.lime : T.textMuted,
              border: 'none',
              borderLeft: i > 0 ? `1px solid ${T.border}` : 'none',
              fontSize: 12, fontWeight: 800, cursor: 'pointer',
              letterSpacing: 0.8, textTransform: 'uppercase',
              transition: 'all 0.15s', fontFamily: 'inherit',
            }}>
              {t}
            </button>
          ))}
        </div>

        {isLive ? <LivePulse /> : (
          <div style={{ fontSize: 12, color: T.textMuted, fontWeight: 700 }}>
            🕐 Race Upcoming
          </div>
        )}
      </div>
    </nav>
  )
}
