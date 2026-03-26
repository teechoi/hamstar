'use client'
import { useState } from 'react'
import { DecoImage } from '@/components/editor/DecoImage'

interface Racer {
  name: string
  tagline: string
  image: string
  featured?: boolean
}

const RACERS: Racer[] = [
  { name: 'Dash',  tagline: 'The Speedster',    image: '/images/hamster-dash.png'  },
  { name: 'Flash', tagline: 'The Sprinter',     image: '/images/hamster-flash.png', featured: true },
  { name: 'Turbo', tagline: 'The Chaos Runner', image: '/images/hamster-turbo.png' },
]

const KANIT = "var(--font-kanit), sans-serif"

function RacerCard({ name, tagline, image, featured }: Racer) {
  const [hov, setHov] = useState(false)
  const active = hov || featured
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff',
        border: active ? '3px solid #735DFF' : '1.5px solid #D5D5D5',
        borderRadius: 24,
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 265,
        flexShrink: 0,
        position: 'relative',
        transform: hov ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: active ? '0 16px 48px rgba(115,93,255,0.8)' : '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out, border 0.2s ease-out',
        cursor: 'default',
      }}
    >
      {(hov || featured) && (
        <div style={{
          position: 'absolute',
          top: -14,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#735DFF',
          color: '#fff',
          fontFamily: 'Pretendard, sans-serif',
          fontWeight: 600,
          fontSize: 14,
          padding: '4px 16px',
          borderRadius: 9999,
          whiteSpace: 'nowrap',
          zIndex: 2,
        }}>
          Cheer Me!
        </div>
      )}
      <div style={{ width: '100%', aspectRatio: '1 / 0.72', overflow: 'hidden', background: '#DDDDDD', borderRadius: '22px 22px 0 0' }}>
        <img
          src={image}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', padding: '20px 20px 0' }}
        />
      </div>
      <div style={{ padding: '20px 24px 28px', textAlign: 'center' }}>
        <p style={{ fontFamily: KANIT, fontWeight: 600, fontSize: 24, color: '#000', margin: 0, lineHeight: 1.1 }}>
          {name}
        </p>
        <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 'clamp(14px, 1.5vw, 20px)', color: '#8A8A8A', margin: '4px 0 0', lineHeight: 1.2 }}>
          {tagline}
        </p>
      </div>
    </div>
  )
}

export function RacersSection() {
  return (
    <section id="racers" style={{
      background: '#F8F9FA',
      padding: '80px 24px 160px',
      position: 'relative',
    }}>
      <DecoImage id="racers-sunflower" className="section-deco" />
      <DecoImage id="racers-oats" className="section-deco" />
      <DecoImage id="racers-turbo" className="section-deco" />

      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 60 }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 56 }}>
          <img src="/images/sunflower-seed.png" alt="" style={{ width: 28, opacity: 0.85 }} />
          <h2 style={{
            fontFamily: 'var(--font-kanit), sans-serif',
            fontWeight: 600,
            fontSize: 'clamp(32px, 5vw, 72px)',
            color: '#000',
            letterSpacing: -0.5,
            margin: 0,
          }}>
            Meet the Racers
          </h2>
          <img src="/images/sunflower-seed.png" alt="" style={{ width: 28, opacity: 0.85 }} />
        </div>

        <div style={{ display: 'flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap' }}>
          {RACERS.map(r => <RacerCard key={r.name} {...r} />)}
        </div>
      </div>
    </section>
  )
}
