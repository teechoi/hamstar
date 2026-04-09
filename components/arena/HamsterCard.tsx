'use client'
import { useState } from 'react'
import { T } from '@/lib/theme'

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
      <div style={{ padding: '10px 25px 18px', width: '100%', textAlign: 'center' }}>
        <h3 style={{ fontFamily: KANIT, fontSize: 'clamp(16px, 1.8vw, 20px)', fontWeight: 500, color: '#000000', marginBottom: 4 }}>
          I&apos;m {name}
        </h3>
        <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 14, fontWeight: 400, color: '#8A8A8A', marginBottom: 12, whiteSpace: 'nowrap' }}>
          {tagline}
        </p>

        {/* Form row */}
        <div style={{ marginBottom: showBar ? 14 : 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 6 }}>
            {form && form.results.length > 0 ? (
              form.results.map((r, i) => (
                <span key={i} style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: r === 'W' ? T.win : T.coral,
                  color: '#fff',
                  fontSize: 11, fontWeight: 700, fontFamily: KANIT,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {r}
                </span>
              ))
            ) : (
              Array.from({ length: 5 }).map((_, i) => (
                <span key={i} style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: '#E9E9E9',
                  fontSize: 11, fontWeight: 700, fontFamily: KANIT,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#ccc',
                }}>
                  –
                </span>
              ))
            )}
          </div>
          {form && form.results.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 12, color: '#8A8A8A' }}>
                {form.winRate}% win rate
              </span>
              {form.streak > 1 && (
                <span style={{
                  fontFamily: 'Pretendard, sans-serif', fontSize: 12, fontWeight: 600,
                  color: form.streakType === 'W' ? T.win : T.coral,
                }}>
                  {form.streak}{form.streakType} streak
                </span>
              )}
            </div>
          )}
        </div>

        {/* Support bar */}
        {showBar && (
          <div style={{ marginBottom: 16, textAlign: 'left' }}>
            <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 13, color: '#8A8A8A', marginBottom: 6 }}>
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
              <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 14, color: '#000' }}>
                Supporters: {supporters}
              </span>
              <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 14, color: '#000' }}>
                {supportPool} SOL
              </span>
            </div>

            {/* Implied payout multiplier */}
            {totalPool > 0 && supportPool > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 10 }}>
                <span style={{ fontFamily: KANIT, fontWeight: 500, fontSize: 15, color: PURPLE }}>
                  {(totalPool / supportPool).toFixed(1)}x payout
                </span>
                <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 12, color: '#8A8A8A' }}>
                  if {name} wins
                </span>
              </div>
            )}
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
            Cheer {name}
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
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 12, color: '#8A8A8A', textAlign: 'center', margin: '8px 0 0' }}>
            No data yet
          </p>
        )}

        {isCheering && (
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 12, color: PURPLE, marginTop: 10, fontWeight: 600 }}>
            ✓ You&apos;re cheering for {name}
          </p>
        )}
      </div>
    </div>
  )
}
