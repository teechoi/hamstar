'use client'
import { useState } from 'react'
import { T } from '@/lib/theme'
import { useIsMobile } from '@/components/ui/index'

const KANIT = "var(--font-kanit), sans-serif"
const PURPLE = T.purple

export interface PetForm {
  results: ('W' | 'L')[]
  winRate: number
  streak: number
  streakType: 'W' | 'L'
}

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
  totalPool?: number      // total SOL across all hamsters (for multiplier calc)
  isWinner?: boolean      // FINISHED: this pet won
  isCheering?: boolean    // user is cheering this pet
  isDarkHorse?: boolean   // pool share < 20% — show badge + upset bonus if winner
  form?: PetForm | null
  onCheer?: () => void
}

const PET_IMAGES: Record<string, string> = {
  dash:  '/images/dash.png',
  flash: '/images/flash-crop.jpeg',
  turbo: '/images/turbo-crop.png',
}


export function HamsterCard({
  id, name, tagline, arenaState,
  supportPct = 0, supporters = 0, supportPool = 0, totalPool = 0,
  isWinner = false, isCheering = false, isDarkHorse = false,
  form,
  onCheer,
}: HamsterCardProps) {
  const [hov, setHov] = useState(false)
  const isMobile = useIsMobile()
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
        ? '0 0 0 3px #FFD643, 0 0 30px rgba(255,214,67,0.9), 0 6px 16px rgba(255,214,67,0.15), 0 20px 40px rgba(77,67,83,0.10)'
        : '0 1px 2px rgba(115,93,255,0.04), 0 6px 16px rgba(115,93,255,0.06), 0 20px 40px rgba(77,67,83,0.07)',
      backdropFilter: dimmed ? 'blur(20px)' : 'none',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      width: '100%',
      opacity: dimmed ? 0.5 : 1,
      transition: 'opacity 0.3s, box-shadow 0.3s',
    }}>

      {/* Image area — taller on mobile for stronger visual impact */}
      <div style={{
        width: '100%', height: isMobile ? 220 : 175,
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
            background: T.live, color: '#fff',
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
            background: T.yellow, color: T.sub2,
            borderRadius: 20, padding: '3px 10px',
            fontSize: 11, fontWeight: 700, fontFamily: KANIT,
          }}>
            WINNER
          </div>
        )}
        {/* Dark horse badge — show during open/live when pool share is low */}
        {isDarkHorse && (isOpen || isLive) && (
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: 'rgba(0,0,0,0.72)', color: '#FFE790',
            borderRadius: 20, padding: '3px 10px',
            fontSize: 11, fontWeight: 700, fontFamily: KANIT,
            backdropFilter: 'blur(4px)',
          }}>
            DARK HORSE
          </div>
        )}
        {/* Upset bonus badge — show on the winning dark horse after a race */}
        {isDarkHorse && goldGlow && (
          <div style={{
            position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
            background: T.purple, color: T.purpleText,
            borderRadius: 20, padding: '4px 14px',
            fontSize: 11, fontWeight: 700, fontFamily: KANIT,
            whiteSpace: 'nowrap',
          }}>
            UPSET BONUS 1.5x
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px 20px 20px', width: '100%' }}>

        {/* Name + Tagline */}
        <h3 style={{ fontFamily: KANIT, fontSize: 'clamp(16px, 1.8vw, 20px)', fontWeight: 500, color: '#000000', letterSpacing: '-0.01em', marginBottom: 4, textAlign: 'center' }}>
          I&apos;m {name}
        </h3>
        <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 13, fontWeight: 400, color: '#8A8A8A', marginBottom: 10, textAlign: 'center' }}>
          {tagline}
        </p>

        {/* CTA */}
        {isOpen ? (
          <button
            onClick={onCheer}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
              width: '100%',
              padding: isMobile ? '16px' : '14px',
              background: PURPLE,
              border: 'none', borderRadius: 48.5,
              fontSize: isMobile ? 16 : 14, fontWeight: 700,
              color: '#fff', cursor: 'pointer',
              fontFamily: KANIT,
              transform: hov ? 'scale(1.02)' : 'scale(1)',
              boxShadow: hov ? '0 4px 20px rgba(115,93,255,0.45), 0 2px 8px rgba(115,93,255,0.25)' : '0 2px 8px rgba(115,93,255,0.15)',
              transition: 'all 0.15s ease-out',
              marginBottom: 16,
              minHeight: 52,
            }}
          >
            Cheer {name}
          </button>
        ) : (isLive || isFinished) ? (
          <div style={{
            width: '100%', padding: isMobile ? '16px' : '14px',
            background: '#e3e3e3', borderRadius: 48.5,
            fontSize: 14, fontWeight: 500,
            color: '#aaa', fontFamily: KANIT, textAlign: 'center',
            marginBottom: 16,
          }}>
            {isFinished ? 'Race Finished' : 'Closed'}
          </div>
        ) : (
          <div style={{
            width: '100%', padding: isMobile ? '16px' : '14px',
            background: '#d5d5d5', borderRadius: 48.5,
            fontSize: 14, fontWeight: 500,
            color: '#fff', fontFamily: KANIT, textAlign: 'center',
            marginBottom: 16,
          }}>
            Opens Soon
          </div>
        )}

        {/* Support bar */}
        {showBar && (
          <div>
            <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 13, color: '#8A8A8A', marginBottom: 6 }}>
              {supportPct}% of total support
            </p>
            <div style={{
              width: '100%', height: 8, background: '#E9E9E9',
              borderRadius: 4, overflow: 'hidden', marginBottom: 12,
            }}>
              <div style={{
                width: `${supportPct}%`, height: '100%',
                background: PURPLE, borderRadius: 4,
                transition: 'width 0.5s',
              }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 14, fontWeight: 400, color: '#000' }}>Supporters</span>
                <span style={{ fontFamily: KANIT, fontSize: 14, fontWeight: 500, color: '#000' }}>{supporters}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 14, fontWeight: 400, color: '#000' }}>Support Pool</span>
                <span style={{ fontFamily: KANIT, fontSize: 14, fontWeight: 500, color: '#000' }}>{supportPool.toFixed(1)} SOL</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
