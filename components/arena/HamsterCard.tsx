'use client'
import { useState } from 'react'

const KANIT = "var(--font-kanit), sans-serif"

export interface HamsterCardProps {
  id: string
  name: string
  tagline: string
  color: string
  image: string
  status: 'UPCOMING' | 'LIVE' | 'FINISHED'
  totalSol?: number
  onCheer?: () => void
}

const PET_IMAGES: Record<string, string> = {
  dash:  '/images/hamster-dash.png',
  flash: '/images/hamster-flash.png',
  turbo: '/images/hamster-turbo.png',
}

export function HamsterCard({ id, name, tagline, color, status, totalSol, onCheer }: HamsterCardProps) {
  const [hov, setHov] = useState(false)
  const img = PET_IMAGES[id] ?? PET_IMAGES['dash']
  const isLive = status === 'LIVE'
  const isFinished = status === 'FINISHED'

  return (
    <div style={{
      background: '#fff',
      borderRadius: 32,
      boxShadow: '0 20px 40px rgba(77,67,83,0.08)',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      flex: '1 1 280px',
      minWidth: 240, maxWidth: 380,
    }}>
      {/* Image area */}
      <div style={{
        width: '100%', height: 220,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        background: 'linear-gradient(180deg, #f5f5f5 0%, #efefef 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <img
          src={img}
          alt={name}
          style={{ height: 210, width: 'auto', objectFit: 'contain', display: 'block' }}
        />
        {isLive && (
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: '#ff3b3b', color: '#fff',
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
      </div>

      {/* Info */}
      <div style={{ padding: '20px 24px 24px', width: '100%', textAlign: 'center' }}>
        <h3 style={{ fontFamily: KANIT, fontSize: 28, fontWeight: 600, color: '#0D0D14', marginBottom: 4 }}>
          I&apos;m {name}
        </h3>
        <p style={{ fontFamily: KANIT, fontSize: 16, color: '#818181', marginBottom: 16 }}>
          {tagline}
        </p>

        {/* Total */}
        {(isLive || isFinished) && totalSol !== undefined && (
          <p style={{ fontFamily: KANIT, fontSize: 14, color: '#aaa', marginBottom: 12 }}>
            {totalSol > 0 ? `${totalSol.toFixed(2)} SOL in pool` : 'No data yet'}
          </p>
        )}

        {/* CTA button */}
        {isLive ? (
          <button
            onClick={onCheer}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
              width: '100%', padding: '16px',
              background: hov ? color : color + 'dd',
              border: 'none', borderRadius: 48,
              fontSize: 18, fontWeight: 600,
              color: '#fff', cursor: 'pointer',
              fontFamily: KANIT, transition: 'all 0.15s',
              transform: hov ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            🎉 Cheer {name}!
          </button>
        ) : (
          <div style={{
            width: '100%', padding: '16px',
            background: '#d5d5d5',
            borderRadius: 48,
            fontSize: 18, fontWeight: 600,
            color: '#fff', fontFamily: KANIT,
            textAlign: 'center',
          }}>
            {isFinished ? 'Race finished' : 'Opens soon'}
          </div>
        )}

        {!isLive && !isFinished && (
          <p style={{ fontFamily: KANIT, fontSize: 14, color: '#8d8d8d', marginTop: 12 }}>
            No data yet
          </p>
        )}
      </div>
    </div>
  )
}
