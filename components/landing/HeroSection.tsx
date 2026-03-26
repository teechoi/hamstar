'use client'
import { useState } from 'react'
import { SITE } from '@/config/site'

const YELLOW = '#FFE790'
const DARK = '#0D0D14'
const KANIT = "var(--font-kanit), sans-serif"

export function HeroSection() {
  const [hov, setHov] = useState(false)

  return (
    <section id="hero" style={{
      position: 'relative',
      height: 662,
      background: DARK,
      overflow: 'hidden',
    }}>
      {/* Hero image — inset 107px left, 109px right, top 41px (Figma exact) */}
      <img
        src="/images/hero-hamsters.png"
        alt="Three hamsters ready to race"
        style={{
          position: 'absolute',
          top: 41,
          left: '8.35%',   // 107/1280
          right: '8.52%',  // 109/1280
          height: 577,
          objectFit: 'cover',
          objectPosition: 'center center',
        }}
      />

      {/* Gradient fades on left and right edges (matching Figma overlays) */}
      <div style={{
        position: 'absolute', top: 41, left: 0, width: '10%', height: 577,
        background: 'linear-gradient(to right, rgba(13,13,20,0.7) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 41, right: 0, width: '10%', height: 577,
        background: 'linear-gradient(to left, rgba(13,13,20,0.7) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Content overlay — heading at y=129, CTA at y=556 */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center',
        paddingTop: 129,
        paddingBottom: 42,
      }}>
        <h1 style={{
          fontFamily: KANIT,
          fontSize: 60,
          fontWeight: 700,
          color: '#fff',
          letterSpacing: -2,
          lineHeight: 1.0,
          marginBottom: 0,
          textShadow: '0 4px 40px rgba(0,0,0,0.4)',
        }}>
          Who Will Be The Hamstar?
        </h1>

        <p style={{
          fontFamily: 'Pretendard, sans-serif',
          fontSize: 20,
          color: '#FFE78F',
          fontWeight: 600,
          marginTop: 0,
        }}>
          Three hamsters race. One takes the wheel.
        </p>

        <div style={{ flex: 1 }} />

        {/* Round label */}
        <p style={{
          fontFamily: KANIT,
          fontSize: 12,
          color: 'rgba(255,255,255,0.7)',
          fontWeight: 400,
          marginBottom: 10,
          letterSpacing: 0.5,
        }}>
          Round 1 Coming Soon!
        </p>

        {/* CTA button */}
        <a
          href={SITE.stream.url}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            width: 150,
            padding: '5px 10px',
            background: '#735DFF',
            color: '#F8F9FA',
            border: 'none',
            borderRadius: 70,
            fontFamily: KANIT,
            fontSize: 14,
            fontWeight: 500,
            textDecoration: 'none',
            backdropFilter: 'blur(10px)',
            transform: hov ? 'scale(1.04)' : 'scale(1)',
            boxShadow: hov ? '0 8px 32px rgba(115,93,255,0.5)' : '0 4px 20px rgba(115,93,255,0.3)',
            transition: 'all 0.18s ease-out',
          }}
        >
          <span style={{ fontSize: 12 }}>▶</span>
          Watch Live Race
        </a>
      </div>
    </section>
  )
}
