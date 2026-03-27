'use client'
import { useState } from 'react'

const YELLOW = '#FFE790'
const KANIT = "var(--font-kanit), sans-serif"

interface TermsModalProps {
  onAccept: () => void
}

// Bullet dot y-positions relative to the image container (image-relative coords)
// Figma card-relative: y=290,302,325,338 → image starts at card y=22 → image-relative: 268,280,303,316
const BULLET_Y = [268, 280, 303, 316]

export function TermsModal({ onAccept }: TermsModalProps) {
  const [hov, setHov] = useState(false)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Card — 324×422, white, cornerRadius 20 */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 20,
        width: 324,
        height: 422,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
        flexShrink: 0,
      }}>

        {/* Hamster portrait image — 290×325, 22px from top */}
        <div style={{
          width: 290,
          height: 325,
          marginTop: 22,
          position: 'relative',
          flexShrink: 0,
        }}>
          <img
            src="/images/hamster-entry.png"
            alt="Hamstar"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* Bullet dots overlaid on image — Figma: 7×7, #D9D9D9, cornerRadius 1 */}
          {BULLET_Y.map((top, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 1,
                top,
                width: 7,
                height: 7,
                borderRadius: 1,
                background: '#D9D9D9',
                pointerEvents: 'none',
              }}
            />
          ))}
        </div>

        {/* CTA button — 280×35, yellow, cornerRadius 70, Kanit 500/14px */}
        <button
          onClick={onAccept}
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{
            width: 280,
            height: 35,
            marginTop: 20,
            background: YELLOW,
            border: 'none',
            borderRadius: 70,
            fontFamily: KANIT,
            fontSize: 14,
            fontWeight: 500,
            color: '#000000',
            cursor: 'pointer',
            flexShrink: 0,
            opacity: hov ? 0.88 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          I Understand & Enter Arena
        </button>

      </div>
    </div>
  )
}
