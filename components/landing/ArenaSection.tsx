'use client'
import { useState } from 'react'
import { useCountdown } from '@/lib/hooks/useCountdown'
import { DecoImage } from '@/components/editor/DecoImage'
import { SITE } from '@/config/site'

const YELLOW = '#FFE790'
const DARK = '#0D0D14'
const KANIT = "var(--font-kanit), sans-serif"

function CountdownCard({ streamUrl, targetMs, isLive }: { streamUrl: string; targetMs: number; isLive: boolean }) {
  const { h, m, s } = useCountdown(targetMs)
  const [hov, setHov] = useState(false)
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div style={{
      position: 'relative',
      border: '3px solid #000',
      borderRadius: 50,
      overflow: 'hidden',
      maxWidth: 700,
      margin: '0 auto',
    }}>
      {/* Blurred background image */}
      <img src="/images/arena-bg-blurred.png" alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />

      <div style={{
        position: 'relative', zIndex: 1,
        padding: 'clamp(20px, 3vw, 32px) clamp(20px, 3.5vw, 36px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
      }}>
        {/* Left: badge + timer */}
        <div>
          <div style={{
            background: '#735dff',
            color: '#fff',
            fontFamily: KANIT, fontWeight: 600, fontSize: 13,
            padding: '5px 14px',
            borderRadius: 9999,
            letterSpacing: 0.5,
            display: 'inline-flex', alignItems: 'center', gap: 7,
            marginBottom: 12,
          }}>
            <span style={{
              width: 9, height: 9, borderRadius: '50%',
              background: isLive ? '#ff4444' : '#fff',
              display: 'inline-block',
              animation: 'pulse 1.5s ease-in-out infinite',
              flexShrink: 0,
            }} />
            {isLive ? 'LIVE NOW' : 'LIVE COUNTDOWN'}
          </div>

          {!isLive && (
            <p style={{ fontFamily: KANIT, fontWeight: 400, fontSize: 'clamp(14px, 2vw, 22px)', color: 'rgba(255,255,255,0.85)', margin: '0 0 4px' }}>
              Next Race Starts in
            </p>
          )}
          <div style={{
            fontFamily: KANIT,
            fontSize: 'clamp(36px, 7vw, 80px)',
            fontWeight: 700, color: YELLOW,
            letterSpacing: 2, lineHeight: 1,
            marginBottom: 16,
          }}>
            {isLive ? 'LIVE NOW' : `${pad(h)}:${pad(m)}:${pad(s)}`}
          </div>
          <p style={{ fontFamily: KANIT, color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(11px, 1.2vw, 15px)', margin: 0, fontWeight: 400 }}>
            Race will be streamed live on Pump.fun
          </p>
        </div>

        {/* Right: CTA */}
        <a href={streamUrl} target="_blank" rel="noopener noreferrer"
          onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: 'clamp(10px, 1.5vw, 14px) clamp(16px, 2.5vw, 28px)',
            background: YELLOW, color: DARK,
            border: '3px solid #000',
            borderRadius: 9999,
            fontFamily: KANIT, fontSize: 'clamp(13px, 1.4vw, 18px)', fontWeight: 700,
            textDecoration: 'none',
            whiteSpace: 'nowrap', flexShrink: 0,
            transform: hov ? 'scale(1.04)' : 'scale(1)',
            transition: 'all 0.18s ease-out',
          }}>
          ▶ Watch Live Race
        </a>
      </div>
    </div>
  )
}

export function ArenaSection({ targetMs, isLive }: { targetMs: number; isLive: boolean }) {
  return (
    <section id="arena" style={{
      background: '#F2F2F2',
      padding: '80px 24px 0',
      position: 'relative',
    }}>
      <DecoImage id="arena-oats" className="section-deco" />
      <DecoImage id="arena-trophy" className="section-deco" />
      <DecoImage id="arena-bridge" className="section-deco" />

      <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 20 }}>
          <img src="/images/sunflower-seed.png" alt="" style={{ width: 32, opacity: 0.85 }} />
          <h2 style={{
            fontFamily: KANIT,
            fontSize: 'clamp(36px, 5vw, 72px)',
            fontWeight: 600,
            color: '#000',
            margin: 0,
          }}>
            Hamstar Arena
          </h2>
          <img src="/images/sunflower-seed.png" alt="" style={{ width: 32, opacity: 0.85 }} />
        </div>

        <p style={{
          textAlign: 'center',
          fontFamily: KANIT,
          color: '#000',
          fontSize: 'clamp(14px, 1.6vw, 20px)',
          fontWeight: 400,
          marginBottom: 40,
        }}>
          Hamstar races are streamed live on Pump.fun. Watch the race and return to see the winner.
        </p>

        <CountdownCard streamUrl={SITE.stream.url} targetMs={targetMs} isLive={isLive} />
      </div>

      {/* Seed row */}
      <div style={{
        marginTop: 120,
        paddingBottom: 40,
        display: 'flex', justifyContent: 'center', gap: 'clamp(6px, 1.2vw, 16px)',
        flexWrap: 'wrap',
      }}>
        {Array.from({ length: 14 }).map((_, i) => (
          <img key={i} src="/images/sunflower-seed.png" alt=""
            style={{ width: 'clamp(20px, 2.5vw, 36px)', opacity: 0.7 }} />
        ))}
      </div>
    </section>
  )
}
