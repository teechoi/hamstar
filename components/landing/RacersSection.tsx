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
  const active = hov
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#FFFFFF',
        border: active ? '3px solid #735DFF' : '1.5px solid #D5D5D5',
        borderRadius: 20,
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
        width: 265,
        height: 299,
        flexShrink: 0,
        position: 'relative',
        transform: hov ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: active ? '0 16px 48px rgba(115,93,255,0.35)' : '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out, border 0.2s ease-out',
        cursor: 'default',
      }}
    >
      {/* Image area — 265×187, radius [20,20,0,0], bg #DDDDDD */}
      <div style={{
        width: 265,
        height: 187,
        borderRadius: '20px 20px 0 0',
        background: '#DDDDDD',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Hamster image — 166×149 at (49, 20) */}
        <img
          src={image}
          alt={name}
          style={{
            position: 'absolute',
            left: 49, top: 20,
            width: 166, height: 149,
            objectFit: 'contain',
            objectPosition: 'center bottom',
          }}
        />
        {/* Cheer Me! badge — top:10, left:10, 100×30, radius:22, bg:#725DFF */}
        {active && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            width: 100, height: 30,
            borderRadius: 22,
            background: '#725DFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: 'Pretendard, sans-serif',
              fontWeight: 500, fontSize: 14,
              color: '#FFFFFF',
              lineHeight: '17px',
            }}>
              Cheer Me!
            </span>
          </div>
        )}
      </div>

      {/* Info area — 265×112, centered, gap 5 */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 5,
      }}>
        <p style={{
          fontFamily: KANIT,
          fontWeight: 500, fontSize: 24,
          color: '#000000',
          lineHeight: '29px',
          margin: 0,
        }}>
          {name}
        </p>
        <p style={{
          fontFamily: 'Pretendard, sans-serif',
          fontWeight: 500, fontSize: 16,
          color: '#8A8A8A',
          lineHeight: '19px',
          margin: 0,
        }}>
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
      height: 684,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <DecoImage id="racers-sunflower" className="section-deco" />
      <DecoImage id="racers-oats" className="section-deco" />
      <DecoImage id="racers-turbo" className="section-deco" />

      {/* 1280×684 canvas, centered */}
      <div style={{
        position: 'absolute',
        width: 1280,
        height: 684,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 60,
      }}>

        {/* Title — x=455, y=94, 370×48, flex HORIZONTAL justify:CENTER gap:10 */}
        <div style={{
          position: 'absolute', left: 455, top: 94,
          width: 370, height: 48,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <img src="/images/sunflower-seed.png" alt="" style={{ width: 29, height: 43, objectFit: 'contain' }} />
          <h2 style={{
            fontFamily: KANIT,
            fontWeight: 700, fontSize: 40,
            color: '#000000',
            lineHeight: '48px',
            margin: 0,
            whiteSpace: 'nowrap',
          }}>
            Meet the Racers
          </h2>
          <img src="/images/sunflower-seed.png" alt="" style={{ width: 29, height: 43, objectFit: 'contain' }} />
        </div>

        {/* Cards — y=202, left card at x=222, gap:20 */}
        <div style={{
          position: 'absolute', top: 202, left: 222,
          display: 'flex', gap: 20,
        }}>
          {RACERS.map(r => <RacerCard key={r.name} {...r} />)}
        </div>

      </div>
    </section>
  )
}
