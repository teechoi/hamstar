'use client'
import { useState } from 'react'
import { DecoImage } from '@/components/editor/DecoImage'
import { useIsMobile } from '@/components/ui/index'

interface Racer {
  name: string
  tagline: string
  image: string
  featured?: boolean
  imgW?: number
  imgH?: number
  imgLeft?: number
  imgTop?: number
}

const RACERS: Racer[] = [
  { name: 'Dash',  tagline: 'The Speedster',    image: '/images/hamster-dash.png'  },
  { name: 'Flash', tagline: 'The Sprinter',     image: '/images/hamster-flash.png', featured: true },
  // Turbo's PNG has extra whitespace — scale up to match apparent size of Dash/Flash
  { name: 'Turbo', tagline: 'The Chaos Runner', image: '/images/hamster-turbo.png', imgW: 210, imgH: 190, imgLeft: 27, imgTop: -21 },
]

const KANIT = "var(--font-kanit), sans-serif"

function RacerCard({ name, tagline, image, featured, imgW = 166, imgH = 149, imgLeft = 49, imgTop = 20 }: Racer) {
  const [hov, setHov] = useState(false)
  const active = hov
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#FFFFFF',
        border: 'none',
        borderRadius: 20,
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
        width: 265,
        height: 299,
        flexShrink: 0,
        position: 'relative',
        transform: hov ? 'translateY(-6px)' : 'translateY(0)',
        outline: active ? '3px solid #735DFF' : '1.5px solid #D5D5D5',
        boxShadow: active ? '0 8px 24px rgba(115,93,255,0.45)' : '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out, outline 0.2s ease-out',
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
            left: imgLeft, top: imgTop,
            width: imgW, height: imgH,
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
            background: '#735DFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: KANIT,
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
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <section id="racers" style={{ background: '#F8F9FA', padding: '48px 0 56px' }}>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32, padding: '0 24px' }}>
          <img src="/images/sunflower-seed.png" alt="" style={{ width: 22, height: 33, objectFit: 'contain' }} />
          <h2 style={{ fontFamily: KANIT, fontWeight: 700, fontSize: 32, color: '#000000', lineHeight: '40px', margin: 0 }}>
            Meet the Racers
          </h2>
          <img src="/images/sunflower-seed.png" alt="" style={{ width: 22, height: 33, objectFit: 'contain' }} />
        </div>
        {/* Horizontally scrollable cards */}
        <div style={{ overflowX: 'auto', scrollbarWidth: 'none', display: 'flex', gap: 16, padding: '0 24px 8px' }}>
          {RACERS.map(r => <RacerCard key={r.name} {...r} />)}
        </div>
      </section>
    )
  }

  return (
    <section id="racers" style={{
      background: '#F8F9FA',
      height: 684,
      position: 'relative',
    }}>
      {/* Clip container for behind-card decorations */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        <DecoImage id="racers-sunflower" className="section-deco" />
        <DecoImage id="racers-oats" className="section-deco" />
        <DecoImage id="racers-oats-2" className="section-deco" />
      </div>

      {/* Turbo pushup — above cards so it overlaps the Turbo card */}
      <DecoImage id="racers-turbo" className="section-deco" />

      {/* Title — centered, Figma y=94 */}
      <div style={{
        position: 'absolute', top: 94, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        zIndex: 60,
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

      {/* Cards — centered, Figma y=202, gap:20 */}
      <div style={{
        position: 'absolute', top: 202, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: 20,
        zIndex: 60,
        padding: '0 24px',
        boxSizing: 'border-box',
      }}>
        {RACERS.map(r => <RacerCard key={r.name} {...r} />)}
      </div>
    </section>
  )
}
