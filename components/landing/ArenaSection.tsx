'use client'
import { useState } from 'react'
import { useCountdown } from '@/lib/hooks/useCountdown'
import { DecoImage } from '@/components/editor/DecoImage'
import { SITE } from '@/config/site'

const YELLOW = '#FFE790'
const DARK = '#0D0D14'
const KANIT = "var(--font-kanit), sans-serif"

function CountdownCard({ targetMs, isLive }: { streamUrl: string; targetMs: number; isLive: boolean }) {
  const { h, m, s } = useCountdown(targetMs)
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div style={{
      position: 'relative',
      borderRadius: 20,
      overflow: 'hidden',
      maxWidth: 765,
      height: 250,
      margin: '0 auto',
      boxShadow: '0 20px 30px rgba(77,67,83,0.3)',
    }}>
      {/* Blurred background image */}
      <img src="/images/arena-bg-blurred.png" alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />

      <div style={{
        position: 'relative', zIndex: 1,
        height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        padding: '0 32px',
        gap: 8,
      }}>
        <div style={{
          background: '#735DFF',
          color: '#fff',
          fontFamily: KANIT, fontWeight: 600, fontSize: 13,
          padding: '5px 14px',
          borderRadius: 22,
          letterSpacing: 0.5,
          display: 'inline-flex', alignItems: 'center', gap: 7,
          marginBottom: 4,
        }}>
          <span style={{
            width: 15, height: 15, borderRadius: '50%',
            background: isLive ? '#ff4444' : '#fff',
            display: 'inline-block',
            animation: 'pulse 1.5s ease-in-out infinite',
            flexShrink: 0,
          }} />
          {isLive ? 'LIVE NOW' : 'LIVE COUNTDOWN'}
        </div>

        {!isLive && (
          <p style={{ fontFamily: KANIT, fontWeight: 500, fontSize: 20, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
            Next Race Starts in
          </p>
        )}
        <div style={{
          fontFamily: KANIT,
          fontSize: 60,
          fontWeight: 700, color: YELLOW,
          letterSpacing: 2, lineHeight: 1,
        }}>
          {isLive ? 'LIVE NOW' : `${pad(h)}:${pad(m)}:${pad(s)}`}
        </div>
        <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, color: 'rgba(255,255,255,0.6)', fontSize: 18, margin: 0 }}>
          Race will be streamed live on Pump.fun
        </p>
      </div>
    </div>
  )
}

export function ArenaSection({ targetMs, isLive }: { targetMs: number; isLive: boolean }) {
  return (
    <section id="arena" style={{
      background: '#F8F9FA',
      padding: '80px 24px 0',
      position: 'relative',
    }}>
      <DecoImage id="arena-oats" className="section-deco" />
      <DecoImage id="arena-trophy" className="section-deco" />
      <DecoImage id="arena-bridge" className="section-deco" />

      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
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
          fontFamily: 'Pretendard, sans-serif',
          color: '#000',
          fontSize: 'clamp(14px, 1.6vw, 20px)',
          fontWeight: 500,
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
