'use client'
import { useState, useEffect } from 'react'

const GOLD = '#F5D050'
const DARK = '#0D0D14'

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
        fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)',
        letterSpacing: 0.3,
      }}>
        The smallest sport on the internet.
      </div>

      {/* Nav row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, padding: '8px 24px 14px',
        flexWrap: 'wrap',
      }}>
        {[
          { label: 'HOME',     id: 'hero'   },
          { label: 'ARENA',    id: 'arena'  },
          { label: 'PET',      id: 'racers' },
          { label: 'SPONSORS', id: 'footer' },
        ].map(({ label, id }) => (
          <button key={label} onClick={() => scrollTo(id)} style={{
            padding: '7px 20px',
            background: 'transparent',
            border: `1.5px solid ${GOLD}`,
            borderRadius: 9999,
            color: GOLD,
            fontSize: 12, fontWeight: 800,
            cursor: 'pointer', letterSpacing: 1,
            fontFamily: 'inherit',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLButtonElement).style.background = GOLD
            ;(e.currentTarget as HTMLButtonElement).style.color = DARK
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
            ;(e.currentTarget as HTMLButtonElement).style.color = GOLD
          }}
          >
            {label}
          </button>
        ))}

        {/* How Hamstar Works — dark pill */}
        <button onClick={() => scrollTo('about')} style={{
          padding: '7px 20px',
          background: 'rgba(255,255,255,0.12)',
          border: '1.5px solid rgba(255,255,255,0.2)',
          borderRadius: 9999,
          color: '#fff',
          fontSize: 12, fontWeight: 800,
          cursor: 'pointer', letterSpacing: 0.5,
          fontFamily: 'inherit',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.22)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)' }}
        >
          How Hamstar Works
        </button>
      </div>
    </nav>
  )
}
