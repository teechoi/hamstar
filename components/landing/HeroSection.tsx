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
      background: DARK,
      paddingTop: 105, // clear fixed ticker (35px) + nav (70px)
    }}>
      {/* Contained image box with side margins matching Figma (~108px each side) */}
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 clamp(16px, 8.5vw, 108px)',
        position: 'relative',
      }}>
        <img
          src="/images/hero-hamsters.png"
          alt="Three hamsters ready to race"
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            borderRadius: 12,
          }}
        />

        {/* Overlay: title + subtitle at top, CTA at bottom */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '32px 24px 40px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.35) 100%)',
          borderRadius: 12,
        }}>
          <h1 style={{
            fontFamily: KANIT,
            fontSize: 'clamp(28px, 5vw, 60px)',
            fontWeight: 700,
            color: '#fff',
            letterSpacing: -1,
            lineHeight: 1.1,
            marginBottom: 12,
            textShadow: '0 4px 40px rgba(0,0,0,0.4)',
          }}>
            Who Will Be The Hamstar?
          </h1>

          <p style={{
            fontFamily: 'Pretendard, sans-serif',
            fontSize: 20,
            color: '#FFE78F',
            fontWeight: 600,
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
      </div>
    </section>
  )
}
