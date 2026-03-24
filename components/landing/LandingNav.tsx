'use client'
import { useState, useEffect } from 'react'

const YELLOW = '#FFE790'
const DARK = '#0D0D14'
const KANIT = "var(--font-kanit), sans-serif"

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: scrolled ? 'rgba(13,13,20,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      transition: 'background 0.3s, backdrop-filter 0.3s',
    }}>
      {/* Tagline strip */}
      <div style={{
        textAlign: 'center', padding: '6px 0',
        fontSize: 14, fontWeight: 500, color: '#fff',
        fontFamily: KANIT,
        background: '#7B52FF',
      }}>
        The smallest sport on the internet.
      </div>

      {/* Nav row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 24px 14px',
      }}>
        {/* Spacer left (mirrors auth buttons width for centering) */}
        <div style={{ flex: 1 }} />

        {/* Center pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: 'Home',     id: 'hero'   },
            { label: 'Arena',    id: 'arena'  },
            { label: 'Pet',      id: 'racers' },
            { label: 'Sponsors', id: 'footer' },
          ].map(({ label, id }) => (
            <button key={label} onClick={() => scrollTo(id)} style={{
              padding: '8px 24px',
              background: YELLOW,
              border: 'none',
              borderRadius: 9999,
              color: DARK,
              fontSize: 14, fontWeight: 500,
              cursor: 'pointer',
              fontFamily: KANIT,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
            >
              {label}
            </button>
          ))}

          {/* How Hamstar Works */}
          <button onClick={() => scrollTo('about')} style={{
            padding: '8px 24px',
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            borderRadius: 9999,
            color: YELLOW,
            fontSize: 14, fontWeight: 500,
            cursor: 'pointer',
            fontFamily: KANIT,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.25)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)' }}
          >
            How Hamstar Works
          </button>
        </div>

        {/* Right: auth buttons */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
          <button style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: 14, fontWeight: 500,
            cursor: 'pointer',
            fontFamily: KANIT,
            padding: '8px 12px',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.7' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
          >
            Log In
          </button>
          <button style={{
            padding: '8px 22px',
            background: YELLOW,
            border: 'none',
            borderRadius: 9999,
            color: DARK,
            fontSize: 14, fontWeight: 600,
            cursor: 'pointer',
            fontFamily: KANIT,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
          >
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  )
}
