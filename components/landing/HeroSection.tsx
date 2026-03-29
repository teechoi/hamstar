'use client'
import { useState } from 'react'
import { SITE } from '@/config/site'
import { useIsMobile } from '@/components/ui/index'

const KANIT = "var(--font-kanit), sans-serif"

export function HeroSection() {
  const [hov, setHov] = useState(false)
  const isMobile = useIsMobile()

  return (
    <section id="hero" style={{
      position: 'relative',
      height: 'clamp(580px, 52vw, 820px)',
      background: '#000000',
      overflow: 'hidden',
    }}>
      {/* Hero image — Figma: x:107, y:41, 1064×577 in 1280×662 frame */}
      <div style={{
        position: 'absolute',
        top: 41,
        bottom: 44,
        left: '8.4%',
        right: '8.5%',
      }}>
        <img
          src="/images/hero-hamsters.png"
          alt="Three hamsters ready to race"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            display: 'block',
          }}
        />
        {/* Gradient fades — Figma: left 14.7%, right 11.7%, top 21.7%, bottom 26.3% of image */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: 0, left: 0,    width: '14.7%', height: '100%', background: 'linear-gradient(to right, #000, transparent)' }} />
          <div style={{ position: 'absolute', top: 0, right: 0,   width: '11.7%', height: '100%', background: 'linear-gradient(to left,  #000, transparent)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0,    width: '100%',  height: '21.7%', background: 'linear-gradient(to bottom, #000, transparent)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%',  height: '26.3%', background: 'linear-gradient(to top,    #000, transparent)' }} />
        </div>
      </div>

      {/* Content overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center',
        paddingTop: isMobile ? 100 : 'clamp(110px, 10vw, 165px)',
        paddingBottom: 42,
        paddingLeft: isMobile ? 20 : 0,
        paddingRight: isMobile ? 20 : 0,
      }}>
        {/* Heading */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          width: isMobile ? '100%' : 'clamp(600px, 60vw, 900px)',
        }}>
          <h1 style={{
            fontFamily: KANIT,
            fontSize: isMobile ? 'clamp(28px, 7vw, 52px)' : 'clamp(52px, 4.7vw, 80px)',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: 0,
            lineHeight: isMobile ? 1.15 : 1.2,
            margin: 0,
          }}>
            Who Will Be The Hamstar?
          </h1>
          <p style={{
            fontFamily: 'Pretendard, sans-serif',
            fontSize: isMobile ? 15 : 'clamp(17px, 1.6vw, 26px)',
            color: '#FFE790',
            fontWeight: 600,
            lineHeight: isMobile ? '22px' : '30px',
            margin: isMobile ? '8px 0 0' : 0,
          }}>
            Three hamsters race. One takes the wheel.
          </p>
        </div>

        <div style={{ flex: 1 }} />

        {/* CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px', gap: 10 }}>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 12, fontWeight: 500, color: '#8a8a8a', margin: 0 }}>
            Round 1 Coming Soon!
          </p>
          <a
            href={SITE.stream.url}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, width: 150, height: 30, padding: '5px 10px',
              background: '#735DFF', color: '#F8F9FA',
              border: 'none', borderRadius: 70,
              fontFamily: KANIT, fontSize: 14, fontWeight: 500,
              textDecoration: 'none',
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
