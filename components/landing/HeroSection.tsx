'use client'
import { useState } from 'react'
import { SITE } from '@/config/site'

const KANIT = "var(--font-kanit), sans-serif"

export function HeroSection() {
  const [hov, setHov] = useState(false)

  return (
    <section id="hero" style={{
      position: 'relative',
      height: 662,
      background: '#000000',
      overflow: 'hidden',
    }}>
      {/* Hero image — 1064×577px at x:107, y:41 (per Figma 36:246) */}
      <div style={{
        position: 'absolute',
        top: 41,
        left: 0, right: 0,
        display: 'flex',
        justifyContent: 'center',
        height: 577,
      }}>
        <div style={{ position: 'relative', width: 'min(1064px, calc(100% - 214px))', height: '100%' }}>
          <img
            src="/images/hero-hamsters.png"
            alt="Three hamsters ready to race"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center', display: 'block' }}
          />
          {/* Edge gradient fades — measured from Figma overlay rectangles
              Left:   Rectangle 29 → 125px overlap into image = 125/1064 ≈ 12%
              Right:  Rectangle 31 →  92px overlap into image =  92/1064 ≈  9%
              Top:    Rectangle 32 → 125px from top           = 125/577  ≈ 22%
              Bottom: Rectangle 33 → 125px from bottom        = 125/577  ≈ 22% */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: 0, left: 0,    width: '12%',  height: '100%', background: 'linear-gradient(to right, #000, transparent)' }} />
            <div style={{ position: 'absolute', top: 0, right: 0,   width: '9%',   height: '100%', background: 'linear-gradient(to left,  #000, transparent)' }} />
            <div style={{ position: 'absolute', top: 0, left: 0,    width: '100%', height: '22%',  background: 'linear-gradient(to bottom, #000, transparent)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '22%',  background: 'linear-gradient(to top,    #000, transparent)' }} />
          </div>
        </div>
      </div>

      {/* Content overlay
          Heading container: x=279, y=129, w=722, h=102 (per Figma)
          CTA container:     x=560, y=556, w=159, h=74  (per Figma) */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center',
        paddingTop: 129,
        paddingBottom: 42,
      }}>
        {/* Heading block — 722×102px centered at x=279 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 722 }}>
          <h1 style={{
            fontFamily: KANIT,
            fontSize: 60,
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: 0,
            lineHeight: '72px',
            margin: 0,
          }}>
            Who Will Be The Hamstar?
          </h1>
          <p style={{
            fontFamily: 'Pretendard, sans-serif',
            fontSize: 20,
            color: '#FFE78F',
            fontWeight: 600,
            lineHeight: '30px',
            margin: 0,
          }}>
            Three hamsters race. One takes the wheel.
          </p>
        </div>

        <div style={{ flex: 1 }} />

        {/* CTA area — pad:10/10/10/10, gap:10, align:center (per Figma Frame 1430107013) */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
          padding: '10px',
          gap: 10,
        }}>
          {/* "Round 1 Coming Soon!" — Pretendard 500 12px #8a8a8a (per Figma) */}
          <p style={{
            fontFamily: 'Pretendard, sans-serif',
            fontSize: 12,
            fontWeight: 500,
            color: '#8a8a8a',
            margin: 0,
          }}>
            Round 1 Coming Soon!
          </p>

          {/* Watch Live button — 150×30px, bg #735dff, radius 70, pad 5/10/5/10 */}
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
              height: 30,
              padding: '5px 10px',
              background: '#735DFF',
              color: '#F8F9FA',
              border: 'none',
              borderRadius: 70,
              fontFamily: KANIT,
              fontSize: 14,
              fontWeight: 500,
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
