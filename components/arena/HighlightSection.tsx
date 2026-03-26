'use client'
import { useState } from 'react'
import { PETS, type RaceResult } from '@/config/site'
// RaceResult type imported for prop typing

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
        flex: '1 1 280px', minWidth: 240, maxWidth: 400,
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: hov ? '0 12px 32px rgba(77,67,83,0.14)' : '0 4px 16px rgba(77,67,83,0.08)',
        transition: 'box-shadow 0.2s, transform 0.2s',
        transform: hov ? 'translateY(-4px)' : 'none',
        cursor: 'pointer',
        background: '#fff',
      }}
    >
      {/* Thumbnail */}
      <div style={{
        width: '100%', aspectRatio: '16/9',
        background: `linear-gradient(135deg, #e8e8e8 0%, #d0d0d0 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{
          width: 52, height: 52,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      {/* Caption */}
      <div style={{ padding: '12px 16px' }}>
        <p style={{ fontFamily: KANIT, fontSize: 14, fontWeight: 500, color: '#333' }}>
          {title}
        </p>
      </div>
    </div>
  )
}

export function HighlightSection({ lastResult }: HighlightSectionProps) {
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
      background: '#f8f9fa',
      padding: 'clamp(40px, 6vw, 80px) clamp(16px, 4vw, 48px)',
    }}>
      {/* Header */}
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: KANIT, fontSize: 'clamp(28px, 4vw, 48px)',
          fontWeight: 700, color: '#0D0D14', marginBottom: 8,
        }}>
          Hamstar Highlight
        </h2>
        <p style={{
          fontFamily: KANIT, fontSize: 'clamp(14px, 1.6vw, 20px)',
          color: '#555', marginBottom: 28,
        }}>
          Catch the best moments from recent races.
        </p>

        {/* Winner bar */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: '20px 32px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 4px 20px rgba(77,67,83,0.06)',
          marginBottom: 28,
          flexWrap: 'wrap', gap: 12,
        }}>
          <span style={{ fontFamily: KANIT, fontSize: 'clamp(16px, 2vw, 24px)', fontWeight: 700, color: '#0D0D14' }}>
            Round {lastResult?.number ?? '—'} Winner
          </span>
          <span style={{ fontFamily: KANIT, fontSize: 'clamp(16px, 2vw, 24px)', fontWeight: 700, color: '#0D0D14' }}>
            {winner?.name ?? '—'}
          </span>
        </div>

        {/* Video cards */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {clips.map((title, i) => (
            <VideoCard key={i} title={title} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
