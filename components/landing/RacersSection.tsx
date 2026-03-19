'use client'
import { useState } from 'react'
import { DecoImage } from '@/components/editor/DecoImage'

interface Racer {
  name: string
  tagline: string
  image: string
}

const RACERS: Racer[] = [
  { name: 'Dash',  tagline: 'The Speedster',    image: '/images/hamster-dash.png'  },
  { name: 'Flash', tagline: 'The Sprinter',     image: '/images/hamster-flash.png' },
  { name: 'Turbo', tagline: 'The Chaos Runner', image: '/images/hamster-turbo.png' },
]

function RacerCard({ name, tagline, image }: Racer) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff',
        border: '1.5px solid #D8D8D8',
        borderRadius: 20,
        padding: '28px 24px 20px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        flex: '1 1 220px', maxWidth: 280,
        transform: hov ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hov ? '0 12px 40px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
        cursor: 'default',
      }}
    >
      <img src={image} alt={name} style={{ width: 130, height: 130, objectFit: 'contain', marginBottom: 12 }} />
      <p style={{ fontWeight: 900, fontSize: 20, color: '#0D0D14', margin: 0 }}>{name}</p>
      <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0', fontWeight: 500 }}>{tagline}</p>
    </div>
  )
}

export function RacersSection() {
  return (
    <section id="racers" style={{
      background: '#F0F0F0',
      padding: '80px 24px 160px',
      position: 'relative',
    }}>
      <DecoImage id="racers-sunflower" className="section-deco" />
      <DecoImage id="racers-oats" className="section-deco" />
      <DecoImage id="racers-turbo" className="section-deco" />

      <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 48 }}>
          <img src="/images/sunflower-seed.png" alt="" style={{ width: 24, opacity: 0.8 }} />
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: '#0D0D14', letterSpacing: -0.5 }}>
            Meet the Racers
          </h2>
          <img src="/images/sunflower-seed.png" alt="" style={{ width: 24, opacity: 0.8 }} />
        </div>

        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          {RACERS.map(r => <RacerCard key={r.name} {...r} />)}
        </div>
      </div>
    </section>
  )
}
