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
      overflow: 'hidden',
      background: DARK,
    }}>
      {/* Hero image */}
      <img
        src="/images/hero-hamsters.png"
        alt="Three hamsters ready to race"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center center',
        }}
      />

      {/* Bottom gradient */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '20%',
        background: 'linear-gradient(to top, rgba(13,13,20,0.5) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1,
        height: 662,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '140px 24px 48px',
      }}>
        <h1 style={{
          fontFamily: KANIT,
          fontSize: 'clamp(40px, 7vw, 110px)',
          fontWeight: 800,
          color: '#fff',
          letterSpacing: -2,
          lineHeight: 1.0,
          marginBottom: 20,
          textShadow: '0 4px 40px rgba(0,0,0,0.4)',
        }}>
          Who Will Be The Hamstar?
        </h1>

        <p style={{
          fontFamily: 'Pretendard, sans-serif',
          fontSize: 20,
          color: '#FFE78F',
          fontWeight: 600,
          marginBottom: 0,
        }}>
          Three hamsters race. One takes the wheel.
        </p>

        <div style={{ flex: 1 }} />

        {/* Round label */}
        <p style={{
          fontFamily: KANIT,
          fontSize: 'clamp(12px, 1.2vw, 15px)',
          color: 'rgba(255,255,255,0.7)',
          fontWeight: 400,
          marginBottom: 12,
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
