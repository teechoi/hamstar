'use client'
import { useState, useRef, useEffect } from 'react'
import { SITE } from '@/config/site'
import { useIsMobile } from '@/components/ui/index'
import { T } from '@/lib/theme'

const KANIT = "var(--font-kanit), sans-serif"

interface HeroSectionProps {
  heroTitle?: string
  heroSubtitle?: string
  heroCtaTag?: string
  heroButtonText?: string
  streamUrl?: string
}

export function HeroSection({
  heroTitle = 'Who Will Be The Hamstar?',
  heroSubtitle = 'Three hamsters race. One takes the wheel.',
  heroCtaTag = 'Round 1 Coming Soon!',
  heroButtonText = 'Watch Live Race',
  streamUrl,
}: HeroSectionProps) {
  const [hov, setHov] = useState(false)
  const [muted, setMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isMobile = useIsMobile()

  // `autoPlay` removed from JSX — browsers evaluate autoplay policy at parse time and
  // can block it before React's `muted` prop even takes effect (known React bug).
  // Instead: set both the muted DOM property AND setAttribute before calling play(),
  // so the browser sees a definitively muted video and never blocks it.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = true
    v.setAttribute('muted', '')
    v.play().catch(() => { /* blocked even when muted — user will see first frame */ })
  }, [])

  function toggleSound() {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setMuted(videoRef.current.muted)
  }

  return (
    <section id="hero" style={{
      position: 'relative',
      height: '100vh',
      minHeight: 580,
      background: '#080614',
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
        <video
          ref={videoRef}
          src="/videos/hero.mp4"
          loop
          muted
          playsInline
          preload="auto"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            display: 'block',
          }}
        />
        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            zIndex: 10,
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            color: '#fff',
            backdropFilter: 'blur(4px)',
          }}
        >
          {muted ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            </svg>
          )}
        </button>
        {/* Gradient fades — Figma: left 14.7%, right 11.7%, top 21.7%, bottom 26.3% of image */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: 0, left: 0,    width: '14.7%', height: '100%', background: 'linear-gradient(to right, #080614, transparent)' }} />
          <div style={{ position: 'absolute', top: 0, right: 0,   width: '11.7%', height: '100%', background: 'linear-gradient(to left,  #080614, transparent)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0,    width: '100%',  height: '21.7%', background: 'linear-gradient(to bottom, #080614, transparent)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%',  height: '26.3%', background: 'linear-gradient(to top,    #080614, transparent)' }} />
        </div>
      </div>

      {/* Content overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center',
        paddingTop: isMobile ? 120 : 'clamp(130px, 12vw, 170px)',
        paddingBottom: 42,
        paddingLeft: isMobile ? 20 : 0,
        paddingRight: isMobile ? 20 : 0,
      }}>
        {/* Heading */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          width: isMobile ? '100%' : 'min(80vw, 1050px)',
        }}>
          <h1 style={{
            fontFamily: KANIT,
            fontSize: isMobile ? 'clamp(28px, 7vw, 52px)' : 'clamp(44px, 4.2vw, 64px)',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: isMobile ? '-0.025em' : '-0.035em',
            lineHeight: isMobile ? 1.1 : 1.1,
            margin: 0,
            whiteSpace: isMobile ? 'normal' : 'nowrap',
          }}>
            {heroTitle}
          </h1>
          <p style={{
            fontFamily: 'Pretendard, sans-serif',
            fontSize: isMobile ? 'clamp(13px, 4vw, 17px)' : 'clamp(17px, 1.6vw, 26px)',
            color: T.yellow,
            fontWeight: 500,
            lineHeight: isMobile ? '22px' : '30px',
            margin: isMobile ? '8px 0 0' : 0,
          }}>
            {heroSubtitle}
          </p>
        </div>

        <div style={{ flex: 1 }} />

        {/* CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px', gap: 10 }}>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 12, fontWeight: 500, color: '#8a8a8a', margin: 0 }}>
            {heroCtaTag}
          </p>
          <a
            href={streamUrl || SITE.stream.url}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, padding: isMobile ? '14px 28px' : '13px 28px',
              background: T.purple, color: T.bg,
              border: 'none', borderRadius: 48.5,
              fontFamily: KANIT, fontSize: 16, fontWeight: 500,
              textDecoration: 'none',
              transform: hov ? 'scale(1.04)' : 'scale(1)',
              boxShadow: hov ? '0 8px 32px rgba(115,93,255,0.5)' : '0 4px 20px rgba(115,93,255,0.3)',
              transition: 'all 0.18s ease-out',
            }}
          >
            <span style={{ fontSize: 15 }}>▶</span>
            {heroButtonText}
          </a>
        </div>
      </div>
    </section>
  )
}
