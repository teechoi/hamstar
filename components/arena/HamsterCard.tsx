'use client'
import { useState } from 'react'

const KANIT = "var(--font-kanit), sans-serif"
const PURPLE = '#735DFF'

export interface HamsterCardProps {
  id: string
  name: string
  tagline: string
  color: string
  image: string
  arenaState: 'PREPARING' | 'OPEN' | 'LIVE' | 'FINISHED'
  supportPct?: number     // 0–100, share of total support
  supporters?: number
  supportPool?: number    // SOL in pool for this pet
  isWinner?: boolean      // FINISHED: this pet won
  isCheering?: boolean    // user is cheering this pet
  onCheer?: () => void
}

const PET_IMAGES: Record<string, string> = {
  dash:  '/images/dash.png',
  flash: '/images/flash-crop.jpeg',
  turbo: '/images/turbo-crop.png',
}


export function HamsterCard({
  id, name, tagline, arenaState,
  supportPct = 0, supporters = 0, supportPool = 0,
  isWinner = false, isCheering = false,
  onCheer,
}: HamsterCardProps) {
  const [hov, setHov] = useState(false)
  const img = PET_IMAGES[id] ?? PET_IMAGES['dash']

  const isOpen     = arenaState === 'OPEN'
  const isLive     = arenaState === 'LIVE'
  const isFinished = arenaState === 'FINISHED'
  const showBar    = isOpen || isLive || isFinished
  const dimmed     = isFinished && !isWinner
  const goldGlow   = isFinished && isWinner

  return (
    <div style={{
      background: '#fff',
      borderRadius: 24,
      boxShadow: goldGlow
        ? '0 0 0 3px #FFD643, 0 0 30px rgba(255,214,67,1), 0 20px 40px rgba(77,67,83,0.08)'
        : '0 20px 40px rgba(77,67,83,0.06)',
      backdropFilter: dimmed ? 'blur(20px)' : 'none',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      width: '100%',
      opacity: dimmed ? 0.5 : 1,
      transition: 'opacity 0.3s, box-shadow 0.3s',
    }}>

      {/* Image area */}
      <div style={{
        width: '100%', height: 175,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        paddingBottom: 0,
        background: 'linear-gradient(180deg, #f5f5f5 0%, #efefef 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <img
          src={img}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center', display: 'block', position: 'absolute', inset: 0 }}
        />
        {isLive && (
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: '#FF3B5C', color: '#fff',
            borderRadius: 20, padding: '3px 10px',
            fontSize: 11, fontWeight: 700, fontFamily: KANIT,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#fff', display: 'inline-block',
              animation: 'pulse 1s ease-in-out infinite',
            }} />
            LIVE
          </div>
        )}
        {goldGlow && (
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: '#FFE790', color: '#503F00',
            borderRadius: 20, padding: '3px 10px',
            fontSize: 11, fontWeight: 700, fontFamily: KANIT,
          }}>
            🏆 WINNER
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '10px 25px 18px', width: '100%', textAlign: 'center' }}>
        <h3 style={{ fontFamily: KANIT, fontSize: 'clamp(16px, 1.8vw, 20px)', fontWeight: 500, color: '#000000', marginBottom: 4 }}>
          I&apos;m {name}
        </h3>
        <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 14, fontWeight: 400, color: '#8A8A8A', marginBottom: showBar ? 14 : 16, whiteSpace: 'nowrap' }}>
          {tagline}
        </p>

        {/* Support bar */}
        {showBar && (
          <div style={{ marginBottom: 16, textAlign: 'left' }}>
            <p style={{ fontFamily: KANIT, fontSize: 13, color: '#8D8D8D', marginBottom: 6 }}>
              {supportPct}% of total support
            </p>
            <div style={{
              width: '100%', height: 8, background: '#E9E9E9',
              borderRadius: 4, overflow: 'hidden', marginBottom: 6,
            }}>
              <div style={{
                width: `${supportPct}%`, height: '100%',
                background: PURPLE, borderRadius: 4,
                transition: 'width 0.5s',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: KANIT, fontSize: 14, color: '#000' }}>
                Supporters: {supporters}
              </span>
              <span style={{ fontFamily: KANIT, fontSize: 14, color: '#000' }}>
                {supportPool} SOL
              </span>
            </div>
          </div>
        )}

        {/* CTA */}
        {isOpen ? (
          <button
            onClick={onCheer}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
              width: '100%', padding: '14px',
              background: PURPLE,
              border: 'none', borderRadius: 48.5,
              fontSize: 14, fontWeight: 500,
              color: '#fff', cursor: 'pointer',
              fontFamily: KANIT, opacity: hov ? 0.85 : 1, transition: 'opacity 0.15s',
            }}
          >
            Cheer {name} 🎉
          </button>
        ) : (isLive || isFinished) ? (
          <div style={{
            width: '100%', padding: '14px',
            background: '#e3e3e3', borderRadius: 48.5,
            fontSize: 14, fontWeight: 500,
            color: '#aaa', fontFamily: KANIT, textAlign: 'center',
          }}>
            {isFinished ? 'Race Finished' : 'Closed'}
          </div>
        ) : (
          <div style={{
            width: '100%', padding: '14px',
            background: '#d5d5d5', borderRadius: 48.5,
            fontSize: 14, fontWeight: 500,
            color: '#fff', fontFamily: KANIT, textAlign: 'center',
          }}>
            Opens Soon
          </div>
        )}

        {arenaState === 'PREPARING' && (
          <p style={{ fontFamily: KANIT, fontWeight: 500, fontSize: 12, color: '#8D8D8D', textAlign: 'center', margin: '8px 0 0' }}>
            No data yet
          </p>
        )}

        {isCheering && (
          <p style={{ fontFamily: KANIT, fontSize: 12, color: PURPLE, marginTop: 10, fontWeight: 600 }}>
            ✓ You&apos;re cheering for {name}
          </p>
        )}
      </div>
    </div>
  )
}
