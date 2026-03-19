'use client'
import { useState } from 'react'
import { SITE } from '@/config/site'

const GOLD = '#F5D050'
const DARK = '#0D0D14'

export function HeroSection() {
  const [hov, setHov] = useState(false)

  return (
    <section id="hero" style={{
      position: 'relative',
      minHeight: '100vh',
      overflow: 'hidden',
      background: DARK,
    }}>
      {/* Hero image fills the entire section */}
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

      {/* Top gradient so nav text stays readable */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '35%',
        background: 'linear-gradient(to bottom, rgba(13,13,20,0.75) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Bottom gradient to fade into next section */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '20%',
        background: 'linear-gradient(to top, rgba(13,13,20,0.6) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Content — text at top, button at bottom */}
      <div style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '160px 24px 80px',
      }}>
        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(40px, 6vw, 82px)',
          fontWeight: 900,
          color: '#fff',
          letterSpacing: -2,
          lineHeight: 1.05,
          marginBottom: 16,
          textShadow: '0 4px 40px rgba(0,0,0,0.5)',
        }}>
          Who Will Be The Hamstar?
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 2vw, 20px)',
          color: 'rgba(255,255,255,0.75)',
          fontWeight: 500,
          marginBottom: 0,
        }}>
          Three hamsters race. One takes the wheel.
        </p>

        {/* Flex spacer pushes CTA to bottom */}
        <div style={{ flex: 1 }} />

        {/* CTA button */}
        <a
          href={SITE.stream.url}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{
            display: 'inline-block',
            padding: '16px 48px',
            background: hov ? '#e6bc2a' : GOLD,
            color: DARK,
            borderRadius: 9999,
            fontSize: 17, fontWeight: 900,
            textDecoration: 'none',
            letterSpacing: 0.3,
            boxShadow: hov ? `0 8px 32px rgba(245,208,80,0.55)` : `0 4px 20px rgba(245,208,80,0.35)`,
            transform: hov ? 'scale(1.04)' : 'scale(1)',
            transition: 'all 0.18s ease-out',
          }}
        >
          Watch Live Race
        </a>
      </div>
    </section>
  )
}
