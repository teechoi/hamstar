'use client'
import { useState } from 'react'
import { PETS, type RaceResult } from '@/config/site'
import { useIsMobile } from '@/components/ui/index'

const KANIT = "var(--font-kanit), sans-serif"

interface HighlightSectionProps {
  lastResult?: RaceResult
}

function VideoCard({ title, index }: { title: string; index: number }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: '1 1 260px', minWidth: 220, maxWidth: 400,
        borderRadius: 20,
        border: '3px solid #000',
        overflow: 'hidden',
        background: '#fff',
        boxShadow: hov ? '0 12px 32px rgba(0,0,0,0.13)' : '0 4px 16px rgba(0,0,0,0.07)',
        transform: hov ? 'translateY(-4px)' : 'none',
        transition: 'box-shadow 0.2s, transform 0.2s',
        cursor: 'pointer',
      }}
    >
      {/* Thumbnail */}
      <div style={{
        width: '100%', aspectRatio: '16/9',
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <img
          src="/images/video-thumbnail.png"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <img
          src="/images/play-button.png"
          alt="Play"
          style={{
            position: 'relative', zIndex: 1,
            width: 48, height: 48,
            transform: hov ? 'scale(1.12)' : 'scale(1)',
            transition: 'transform 0.15s',
          }}
        />
      </div>
      {/* Caption */}
      <div style={{ padding: '12px 16px 16px' }}>
        <p style={{ fontFamily: KANIT, fontSize: 14, fontWeight: 600, color: '#0D0D14' }}>
          {title}
        </p>
      </div>
    </div>
  )
}

export function HighlightSection({ lastResult }: HighlightSectionProps) {
  const isMobile = useIsMobile()
  const winner = lastResult
    ? PETS.find(p => p.id === lastResult.positions[0])
    : null

  const clips = [
    `Round ${lastResult?.number ?? 1} — Race Start`,
    `Round ${lastResult?.number ?? 1} — Final Lap`,
    `Round ${lastResult?.number ?? 1} — Victory Lap`,
  ]

  return (
    <section style={{
      background: '#FFE790',
      position: 'relative',
      paddingTop: 'clamp(40px, 6vw, 72px)',
      paddingBottom: 0,
    }}>

      {/* Decorative: hamster ball top-left */}
      {!isMobile && (
        <img
          src="/images/hamster-wheel-spin.png"
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            top: 16,
            left: -16,
            width: 150,
            height: 'auto',
            opacity: 0.95,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}

      {/* Content */}
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: `0 clamp(16px, 4vw, 48px)`,
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h2 style={{
            fontFamily: KANIT,
            fontSize: 'clamp(20px, 2.5vw, 28px)',
            fontWeight: 500,
            color: '#0D0D14',
            marginBottom: 8,
          }}>
            Hamstar Highlights
          </h2>
          <p style={{
            fontFamily: 'Pretendard, sans-serif',
            fontWeight: 500,
            fontSize: 16,
            color: '#6B5A00',
          }}>
            Catch the best moments from recent races.
          </p>
        </div>

        {/* Winner bar */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          border: '3px solid #000',
          padding: isMobile ? '16px 20px' : '18px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 24,
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        }}>
          <span style={{ fontFamily: KANIT, fontSize: 'clamp(15px, 1.8vw, 22px)', fontWeight: 700, color: '#0D0D14' }}>
            Round {lastResult?.number ?? '—'} Winner
          </span>
          <span style={{ fontFamily: KANIT, fontSize: 'clamp(15px, 1.8vw, 22px)', fontWeight: 700, color: '#0D0D14' }}>
            {winner?.name ?? '—'}
          </span>
        </div>

        {/* Video cards */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {clips.map((title, i) => (
            <VideoCard key={i} title={title} index={i} />
          ))}
        </div>
      </div>

      {/* Bottom decoration strip */}
      <div style={{
        position: 'relative',
        marginTop: 48,
        // overflow visible so headset can rise above the oats
        overflow: 'visible',
      }}>
        {/* Tiled oats — repeat-x so ~6 piles span the width */}
        <div style={{
          width: '100%',
          height: isMobile ? 100 : 160,
          backgroundImage: 'url(/images/oats-pile.png)',
          backgroundRepeat: 'repeat-x',
          backgroundSize: 'auto 100%',
          backgroundPosition: 'bottom center',
        }} />

        {/* Hamster headset — sits on oats, rises above */}
        {!isMobile && (
          <img
            src="/images/hamster-headset.png"
            alt=""
            aria-hidden
            style={{
              position: 'absolute',
              bottom: 40,
              right: 40,
              width: 220,
              height: 'auto',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />
        )}
      </div>
    </section>
  )
}
