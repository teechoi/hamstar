'use client'
import { useState } from 'react'
import { useCountdown } from '@/lib/hooks/useCountdown'
import { SITE } from '@/config/site'

const GOLD = '#F5D050'
const DARK = '#0D0D14'

function CountdownCard({ streamUrl, targetMs, isLive }: { streamUrl: string; targetMs: number; isLive: boolean }) {
  const { h, m, s } = useCountdown(targetMs)
  const [hov, setHov] = useState(false)
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div style={{
      position: 'relative',
      borderRadius: 20,
      overflow: 'hidden',
      maxWidth: 600,
      margin: '0 auto',
      boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
    }}>
      <img src="/images/arena-bg-blurred.png" alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,13,20,0.65)' }} />
      <div style={{
        position: 'relative', zIndex: 1,
        padding: '40px 32px',
        textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      }}>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700, fontSize: 14, letterSpacing: 0.5, margin: 0 }}>
          {isLive ? 'Race is LIVE now!' : 'Next Race Starts in'}
        </p>
        <div style={{
          fontFamily: 'monospace',
          fontSize: 'clamp(36px, 6vw, 64px)',
          fontWeight: 900, color: '#fff',
          letterSpacing: 2, lineHeight: 1,
        }}>
          {isLive ? 'LIVE NOW' : `${pad(h)}:${pad(m)}:${pad(s)}`}
        </div>
        <a href={streamUrl} target="_blank" rel="noopener noreferrer"
          onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
          style={{
            display: 'inline-block', padding: '12px 36px',
            background: hov ? '#e6bc2a' : GOLD, color: DARK,
            borderRadius: 9999, fontSize: 15, fontWeight: 900,
            textDecoration: 'none',
            transform: hov ? 'scale(1.04)' : 'scale(1)',
            boxShadow: hov ? `0 6px 24px rgba(245,208,80,0.5)` : `0 3px 12px rgba(245,208,80,0.3)`,
            transition: 'all 0.18s ease-out', marginTop: 4,
          }}>
          Watch Live Race
        </a>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0, fontWeight: 500 }}>
          Race will be streamed live on Pump.fun
        </p>
      </div>
    </div>
  )
}

export function ArenaSection({ targetMs, isLive }: { targetMs: number; isLive: boolean }) {
  return (
    <section id="arena" style={{
      background: '#F0F0F0',
      padding: '80px 24px 0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top-right — oats pile */}
      <img src="/images/oats-pile.png" alt="" style={{
        position: 'absolute', right: -10, top: 10,
        width: 'clamp(130px, 18vw, 260px)',
        pointerEvents: 'none',
      }} />

      {/* Lower-left — trophy hamster */}
      <img src="/images/hamster-trophy.png" alt="" style={{
        position: 'absolute', left: 0, bottom: 90,
        width: 'clamp(130px, 15vw, 220px)',
        pointerEvents: 'none',
      }} />

      {/* Lower-right — wood bridge, partially off-screen */}
      <img src="/images/wood-bridge.png" alt="" style={{
        position: 'absolute', right: -20, bottom: 80,
        width: 'clamp(160px, 21vw, 310px)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
          <img src="/images/sunflower-seed.png" alt="" style={{ width: 24, opacity: 0.8 }} />
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: '#0D0D14', letterSpacing: -0.5 }}>
            Hamstar Arena
          </h2>
          <img src="/images/sunflower-seed.png" alt="" style={{ width: 24, opacity: 0.8 }} />
        </div>

        <p style={{ textAlign: 'center', color: '#555', fontSize: 15, marginBottom: 40, fontWeight: 500 }}>
          Hamstar races are streamed live on Pump.fun. Watch the race and return to see the winner.
        </p>

        <CountdownCard streamUrl={SITE.stream.url} targetMs={targetMs} isLive={isLive} />
      </div>

      {/* Seed row — individual seeds, enough margin to clear trophy + bridge */}
      <div style={{
        marginTop: 220,
        width: '100%',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        gap: 10, padding: '0 24px 40px',
        flexWrap: 'nowrap', overflow: 'hidden',
      }}>
        {Array.from({ length: 14 }).map((_, i) => (
          <img key={i} src="/images/sunflower-seed.png" alt=""
            style={{ width: 28, height: 'auto', opacity: 0.55, flexShrink: 0 }} />
        ))}
      </div>
    </section>
  )
}
