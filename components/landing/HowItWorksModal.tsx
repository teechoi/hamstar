'use client'
import { useState } from 'react'

const YELLOW = '#FFE790'
const DARK = '#0D0D14'
const KANIT = "var(--font-kanit), sans-serif"
const PURPLE = '#735DFF'

interface HowItWorksModalProps {
  onClose: () => void
  onEnterArena: () => void
}

const STEPS = [
  {
    num: 1,
    title: 'Pick Your Hamster',
    body: 'Choose the racer you believe will win.\nEach race features three hamsters.',
    image: '/images/carousel-pick-hamster.png',
    imageStyle: { width: 240, height: 180, objectFit: 'contain' as const },
    badge: { text: 'Support me!', color: PURPLE },
    note: null,
    cta: 'Next',
  },
  {
    num: 2,
    title: 'Join The Race Round',
    body: 'Join the race round before the countdown ends.\nEach hamster gathers supporters into their pool.',
    image: '/images/carousel-join-race.png',
    imageStyle: { width: 240, height: 200, objectFit: 'contain' as const },
    badge: null,
    note: null,
    cta: 'Next',
  },
  {
    num: 3,
    title: 'Watch The Live Race',
    body: 'The race is streamed live on Pump.fun.\nWatch the hamsters compete in real time',
    image: '/images/carousel-watch-race.png',
    imageStyle: { width: 240, height: 200, objectFit: 'contain' as const },
    badge: null,
    note: '*Races are streamed externally on Pump.fun.',
    cta: 'Next',
  },
  {
    num: 4,
    title: 'Champion Takes The Wheel',
    body: 'The winning hamster takes the wheel.\nSupporters of the champion share the reward pool.',
    image: '/images/carousel-champion.png',
    imageStyle: { width: 200, height: 210, objectFit: 'contain' as const },
    badge: null,
    note: null,
    cta: 'Enter The Arena',
  },
]

export function HowItWorksModal({ onClose, onEnterArena }: HowItWorksModalProps) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const handleCta = () => {
    if (isLast) {
      onEnterArena()
    } else {
      setStep(s => s + 1)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(15px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 26,
          width: '100%', maxWidth: 548,
          minHeight: 580,
          padding: '36px 40px 40px',
          fontFamily: KANIT,
          position: 'relative',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 20,
            background: 'none', border: 'none',
            fontSize: 22, cursor: 'pointer', color: '#999',
            fontFamily: KANIT, lineHeight: 1,
          }}
        >
          ×
        </button>

        {/* Image area */}
        <div style={{
          position: 'relative',
          height: 220,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          marginBottom: 20,
        }}>
          <img
            src={current.image}
            alt={current.title}
            style={current.imageStyle}
          />
          {current.badge && (
            <div style={{
              position: 'absolute', top: 8, right: 60,
              background: PURPLE,
              color: '#fff',
              borderRadius: 20,
              padding: '4px 14px',
              fontSize: 14, fontWeight: 500,
              fontFamily: KANIT,
              whiteSpace: 'nowrap',
            }}>
              {current.badge.text}
            </div>
          )}
        </div>

        {/* Dots */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 20,
        }}>
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              style={{
                width: i === step ? 20 : 8,
                height: 8,
                borderRadius: 9999,
                background: i === step ? DARK : '#d0d0d0',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.2s',
              }}
            />
          ))}
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: 24, fontWeight: 600, color: DARK,
          marginBottom: 12, textAlign: 'center',
        }}>
          {current.num}. {current.title}
        </h2>

        {/* Body */}
        <p style={{
          fontSize: 16, color: '#505050', fontWeight: 300,
          textAlign: 'center', lineHeight: 1.6,
          marginBottom: current.note ? 8 : 32,
          whiteSpace: 'pre-line',
        }}>
          {current.body}
        </p>

        {/* Note */}
        {current.note && (
          <p style={{
            fontSize: 13, color: '#949494', fontWeight: 300,
            textAlign: 'center', marginBottom: 32,
          }}>
            {current.note}
          </p>
        )}

        {/* CTA */}
        <CtaButton label={current.cta} onClick={handleCta} />
      </div>
    </div>
  )
}

function CtaButton({ label, onClick }: { label: string; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%',
        padding: '18px',
        background: YELLOW,
        border: 'none',
        borderRadius: 70,
        fontSize: 18, fontWeight: 600,
        color: DARK,
        cursor: 'pointer',
        fontFamily: KANIT,
        opacity: hov ? 0.85 : 1,
        transition: 'opacity 0.15s',
        marginTop: 'auto',
      }}
    >
      {label}
    </button>
  )
}
