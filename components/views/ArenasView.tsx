// components/views/ArenasView.tsx
'use client'
import { useState } from 'react'
import { T, Tag, LimeButton, useIsMobile } from '../ui'
import { ROADMAP, SITE } from '@/config/site'

const STATUS_COLORS = {
  CURRENT: T.green,
  PLANNED: T.blue,
  VISION: T.violet,
  MYSTERY: T.textMuted,
}

export function ArenasView() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const isMobile = useIsMobile()

  const handleSubscribe = () => {
    if (email.includes('@')) setSubscribed(true)
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '24px 16px' : '48px 28px' }}>
      {/* Hero */}
      <div style={{ background: T.text, borderRadius: 20, padding: isMobile ? '32px 20px' : '52px 44px', marginBottom: 28, position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: T.lime }} />
        <div style={{ position: 'absolute', right: -20, bottom: -40, fontSize: isMobile ? 120 : 220, opacity: 0.04, pointerEvents: 'none', userSelect: 'none' }}>🏟</div>

        <Tag label="🚧 Coming Soon" color={T.lime} bg={T.lime + '22'} border={T.lime} />
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? 30 : 48, fontWeight: 900, color: T.card, marginTop: 16, marginBottom: 14, lineHeight: 1.1, letterSpacing: -1 }}>
          Arenas are{isMobile ? ' ' : <br />}being built 🏗️
        </h1>
        <p style={{ fontSize: isMobile ? 14 : 15, color: '#8892BB', maxWidth: 460, margin: '0 auto 28px', lineHeight: 1.8 }}>
          Starting simple. Growing into something the world hasn't seen. Every race builds toward the next arena.
        </p>

        {!subscribed ? (
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
              placeholder="your@email.com"
              style={{ padding: '12px 18px', borderRadius: 8, border: `2px solid #FFFFFF22`, background: '#FFFFFF0F', fontSize: 14, color: T.card, outline: 'none', width: isMobile ? '100%' : 250, fontFamily: 'inherit' }}
            />
            <LimeButton onClick={handleSubscribe}>Notify Me →</LimeButton>
          </div>
        ) : (
          <div style={{ fontSize: 16, color: T.lime, fontWeight: 900 }}>✓ You're on the list!</div>
        )}
      </div>

      {/* Roadmap */}
      <div style={{ fontSize: 9, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 3, marginBottom: 20 }}>
        Arena Roadmap
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {ROADMAP.map((item, i) => {
          const color = STATUS_COLORS[item.status]
          return (
            <div key={item.title} style={{ display: 'flex', gap: 14, position: 'relative' }}>
              {i < ROADMAP.length - 1 && (
                <div style={{ position: 'absolute', left: 22, top: 52, bottom: -6, width: 2, background: `linear-gradient(${T.borderDark},transparent)` }} />
              )}
              <div style={{ width: 44, height: 44, minWidth: 44, borderRadius: 12, background: item.status === 'CURRENT' ? color : color + '18', border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginTop: 4 }}>
                {item.icon}
              </div>
              <div style={{ flex: 1, background: T.card, border: `2px solid ${T.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{item.title}</div>
                  <Tag label={item.status} color={color} bg={color + '15'} border={color + '44'} />
                </div>
                <div style={{ fontSize: 13, color: T.textMid, lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* CTA bar */}
      <div style={{ marginTop: 16, background: T.lime, borderRadius: 14, padding: isMobile ? '20px 20px' : '20px 24px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 900, color: T.limeText, marginBottom: 4 }}>💛 Support Arena Construction</div>
          <div style={{ fontSize: 13, color: T.limeText, opacity: 0.8 }}>Every race builds toward the next arena. Watch us grow.</div>
        </div>
        <a href={SITE.stream.url} target="_blank" rel="noopener noreferrer"
          style={{ padding: '12px 24px', background: T.text, border: 'none', borderRadius: 10, color: T.lime, fontWeight: 900, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', textDecoration: 'none', display: 'inline-block' }}>
          Follow on pump.fun →
        </a>
      </div>
    </div>
  )
}
