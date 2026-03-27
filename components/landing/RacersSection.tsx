'use client'
import { useState } from 'react'
import { DecoImage } from '@/components/editor/DecoImage'
import { useIsMobile } from '@/components/ui/index'

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

const KANIT = "var(--font-kanit), sans-serif"

function RacerCard({ name, tagline, image }: Racer) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#FFFFFF',
        border: hov ? '3px solid #735DFF' : '1.5px solid #D5D5D5',
        borderRadius: 20,
        overflow: 'visible',
        display: 'flex', flexDirection: 'column',
        width: 265, height: 299,
        flexShrink: 0,
        position: 'relative',
        transform: hov ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hov ? '0 16px 48px rgba(115,93,255,0.35)' : '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out, border 0.2s ease-out',
        cursor: 'default',
      }}
    >
      {/* Image area — 265×187, radius [20,20,0,0], bg #DDDDDD */}
      <div style={{
        width: 265, height: 187,
        borderRadius: '20px 20px 0 0',
        background: '#DDDDDD',
        position: 'relative', overflow: 'hidden', flexShrink: 0,
      }}>
        <img
          src={image}
          alt={name}
          style={{
            position: 'absolute', left: 49, top: 20,
            width: 166, height: 149,
            objectFit: 'contain', objectPosition: 'center bottom',
          }}
        />
        {/* Cheer Me! badge — hover only */}
        {hov && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            width: 100, height: 30, borderRadius: 22,
            background: '#725DFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 14, color: '#FFFFFF', lineHeight: '17px' }}>
              Cheer Me!
            </span>
          </div>
        )}
      </div>

      {/* Info — centered, gap 5 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
        <p style={{ fontFamily: KANIT, fontWeight: 500, fontSize: 24, color: '#000000', lineHeight: '29px', margin: 0 }}>
          {name}
        </p>
        <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 16, color: '#8A8A8A', lineHeight: '19px', margin: 0 }}>
          {tagline}
        </p>
      </div>
    </div>
  )
}

export function RacersSection() {
  const isMobile = useIsMobile()

  return (
    <section id="racers" style={{
      background: '#F8F9FA',
      height: isMobile ? 'auto' : 684,
      minHeight: isMobile ? 0 : 684,
      position: 'relative',
      overflow: isMobile ? 'visible' : 'hidden',
      paddingBottom: isMobile ? 40 : 0,
    }}>
      {!isMobile && (
        <>
          <DecoImage id="racers-sunflower" className="section-deco" />
          <DecoImage id="racers-oats" className="section-deco" />
          <DecoImage id="racers-turbo" className="section-deco" />
        </>
      )}

      {isMobile ? (
        <div style={{ padding: '40px 24px 0' }}>
          {/* Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
            <img src="/images/sunflower-seed.png" alt="" style={{ width: 22, height: 33, objectFit: 'contain' }} />
            <h2 style={{ fontFamily: KANIT, fontWeight: 700, fontSize: 32, color: '#000000', lineHeight: '40px', margin: 0 }}>
              Meet the Racers
            </h2>
            <img src="/images/sunflower-seed.png" alt="" style={{ width: 22, height: 33, objectFit: 'contain' }} />
          </div>
          {/* Horizontal scroll cards */}
          <div style={{
            display: 'flex', gap: 16,
            overflowX: 'auto', paddingBottom: 8,
            WebkitOverflowScrolling: 'touch' as any,
            scrollbarWidth: 'none' as any,
          }}>
            {RACERS.map(r => <RacerCard key={r.name} {...r} />)}
          </div>
        </div>
      ) : (
        /* Desktop: 1280×684 canvas */
        <div style={{
          position: 'absolute', width: 1280, height: 684,
          left: '50%', transform: 'translateX(-50%)',
          zIndex: 60,
        }}>
          {/* Title — x=455, y=94 */}
          <div style={{
            position: 'absolute', left: 455, top: 94,
            width: 370, height: 48,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            <img src="/images/sunflower-seed.png" alt="" style={{ width: 29, height: 43, objectFit: 'contain' }} />
            <h2 style={{ fontFamily: KANIT, fontWeight: 700, fontSize: 40, color: '#000000', lineHeight: '48px', margin: 0 }}>
              Meet the Racers
            </h2>
            <img src="/images/sunflower-seed.png" alt="" style={{ width: 29, height: 43, objectFit: 'contain' }} />
          </div>
          {/* Cards — y=202, x=222, gap:20 */}
          <div style={{ position: 'absolute', top: 202, left: 222, display: 'flex', gap: 20 }}>
            {RACERS.map(r => <RacerCard key={r.name} {...r} />)}
          </div>
        </div>
      )}
    </section>
  )
}
