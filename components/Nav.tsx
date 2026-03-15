// components/Nav.tsx
'use client'
import { T, CheckerBar, LivePulse, useIsMobile } from './ui'

type Tab = 'Race' | 'Pets' | 'Community' | 'Arenas' | 'Sponsors'

interface NavProps {
  tab: Tab
  setTab: (t: Tab) => void
  isLive: boolean
}

const TABS: Tab[] = ['Race', 'Pets', 'Community', 'Arenas', 'Sponsors']

export function Nav({ tab, setTab, isLive }: NavProps) {
  const isMobile = useIsMobile()

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: T.card, borderBottom: `2px solid ${T.text}` }}>
      <CheckerBar />
      {isMobile ? (
        /* Mobile: two-row nav */
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {/* Row 1: Logo + status */}
          <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: T.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🐹</div>
              <span style={{ fontSize: 16, fontWeight: 900, color: T.text, letterSpacing: -0.5 }}>
                Ham<span style={{ color: T.blue }}>star</span>
              </span>
            </div>
            {isLive ? <LivePulse /> : (
              <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 700 }}>🕐 Upcoming</div>
            )}
          </div>
          {/* Row 2: Tabs (scrollable) */}
          <div style={{ borderTop: `1px solid ${T.border}`, overflowX: 'auto', display: 'flex', scrollbarWidth: 'none' }}>
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '9px 14px',
                background: tab === t ? T.text : 'transparent',
                color: tab === t ? T.lime : T.textMuted,
                border: 'none',
                borderRight: `1px solid ${T.border}`,
                fontSize: 11, fontWeight: 800, cursor: 'pointer',
                letterSpacing: 0.8, textTransform: 'uppercase',
                transition: 'all 0.15s', fontFamily: 'inherit',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Desktop: single-row nav */
        <div style={{ padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 62, maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: T.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🐹</div>
            <span style={{ fontSize: 20, fontWeight: 900, color: T.text, letterSpacing: -1 }}>
              Ham<span style={{ color: T.blue }}>star</span>
            </span>
          </div>
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
      )}
    </nav>
  )
}
