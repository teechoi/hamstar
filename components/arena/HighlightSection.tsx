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
        flex: '1 1 200px',
        borderRadius: 20,
        overflow: 'hidden',
        background: '#fff',
        boxShadow: hov ? '0 12px 32px rgba(0,0,0,0.13)' : '0 4px 16px rgba(0,0,0,0.07)',
        transform: hov ? 'translateY(-4px)' : 'none',
        transition: 'box-shadow 0.2s, transform 0.2s',
        cursor: 'pointer',
      }}
    >
      {/* Thumbnail — gray placeholder with centered play icon */}
      <div style={{
        width: '100%', height: 186,
        background: '#D5D5D5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <img
          src="/images/play-button.png"
          alt="Play"
          style={{
            width: 40, height: 40,
            transform: hov ? 'scale(1.12)' : 'scale(1)',
            transition: 'transform 0.15s',
          }}
        />
      </div>
      {/* Caption */}
      <div style={{ padding: '12px 16px 16px' }}>
        <p style={{ fontFamily: KANIT, fontSize: 14, fontWeight: 600, color: '#000000' }}>
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
      background: '#F8F9FA',
      position: 'relative',
      overflow: 'hidden',
      paddingTop: 'clamp(40px, 6vw, 72px)',
      paddingBottom: 0,
    }}>

      {/* Decorative: hamster ball top-left */}
      {!isMobile && (
        <img
          src="/images/hamster-ball.png"
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            top: 120,
            left: 'calc(50% - 700px)',
            width: 220,
            height: 'auto',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}

      {/* Content */}
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: isMobile ? '0 16px' : '0 24px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h2 style={{
            fontFamily: KANIT,
            fontSize: 'clamp(20px, 2.5vw, 24px)',
            fontWeight: 500,
            color: '#000',
            marginBottom: 8,
          }}>
            Hamstar Highlights
          </h2>
          <p style={{
            fontFamily: 'Pretendard, sans-serif',
            fontWeight: 500,
            fontSize: 16,
            color: '#8A8A8A',
          }}>
            Catch the best moments from recent races.
          </p>
        </div>

        {/* Winner bar */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: isMobile ? '16px 20px' : '20px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        }}>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 14, fontWeight: 500, color: '#8A8A8A' }}>
            Round {lastResult?.number ?? '—'} Winner
          </span>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 14, fontWeight: 500, color: '#000' }}>
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
        {/* Tiled oats — fill strip top-to-bottom, no yellow above */}
        <div style={{
          width: '100%',
          height: isMobile ? 100 : 175,
          backgroundImage: 'url(/images/oats-pile.png), url(/images/oats-pile.png)',
          backgroundRepeat: 'repeat-x, repeat-x',
          backgroundSize: '380px auto, 380px auto',
          backgroundPosition: '0px -15px, 190px -15px',
        }} />

        {/* Hamster headset — sits on oats, rises above */}
        {!isMobile && (
          <img
            src="/images/hamster-headset.png"
            alt=""
            aria-hidden
            style={{
              position: 'absolute',
              top: -100,
              right: 'calc(50% - 599px)',
              width: 189,
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
