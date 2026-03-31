'use client'
import { useState, useEffect } from 'react'
import type { HowItWorksStep } from '@/types'

const YELLOW = '#FFE790'
const DARK = '#000000'
const KANIT = "var(--font-kanit), sans-serif"
const PURPLE = '#735DFF'

interface HowItWorksModalProps {
  onClose: () => void
  onEnterArena: () => void
  steps?: HowItWorksStep[]
}

const DEFAULT_STEPS: HowItWorksStep[] = [
  {
    num: 1,
    title: 'Pick Your Hamster',
    body: 'Choose the racer you believe will win.\nEach race features three hamsters.',
    image: '/images/carousel-pick-hamster.png',
    badge: { text: 'Support me!', color: PURPLE },
    note: null,
    cta: 'Next',
  },
  {
    num: 2,
    title: 'Join The Race Round',
    body: 'Join the race round before the countdown ends.\nEach hamster gathers supporters into their pool.',
    image: '/images/carousel-join-race.png',
    badge: null,
    note: null,
    cta: 'Next',
  },
  {
    num: 3,
    title: 'Watch The Live Race',
    body: 'The race is streamed live on Pump.fun.\nWatch the hamsters compete in real time',
    image: '/images/carousel-watch-race.png',
    badge: null,
    note: '*Races are streamed externally on Pump.fun.',
    cta: 'Next',
  },
  {
    num: 4,
    title: 'Champion Takes The Wheel',
    body: 'The winning hamster takes the wheel.\nSupporters of the champion share the reward pool.',
    image: '/images/carousel-champion.png',
    badge: null,
    note: null,
    cta: 'Enter The Arena',
  },
]

export function HowItWorksModal({ onClose, onEnterArena, steps }: HowItWorksModalProps) {
  const [step, setStep] = useState(0)
  const STEPS = (steps && steps.length > 0) ? steps : DEFAULT_STEPS
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  // Preload all step images on mount so subsequent steps appear instantly
  useEffect(() => {
    STEPS.forEach(s => {
      if (!s.image) return
      const img = new Image()
      img.src = s.image
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 26,
          width: '100%', maxWidth: 480,
          padding: 'clamp(20px, 5vw, 32px) clamp(20px, 6vw, 36px) clamp(24px, 5vw, 36px)',
          fontFamily: KANIT,
          position: 'relative',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Image area */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: 280,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
        }}>
          <img
            src={current.image}
            alt={current.title}
            style={{ width: 'min(340px, 100%)', height: 270, objectFit: 'contain', objectPosition: 'center bottom' }}
          />
          {current.badge && (
            <div style={{
              position: 'absolute', top: 8, right: 'clamp(12px, 8vw, 60px)',
              background: PURPLE,
              color: '#fff',
              borderRadius: 48.5,
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
          fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 600, color: DARK,
          marginBottom: 12, textAlign: 'center',
        }}>
          {current.num}. {current.title}
        </h2>

        {/* Body */}
        <p style={{
          fontSize: 16, color: '#8A8A8A', fontFamily: 'Pretendard, sans-serif', fontWeight: 500,
          textAlign: 'center', lineHeight: 1.6,
          marginBottom: current.note ? 8 : 20,
          whiteSpace: 'pre-line',
        }}>
          {current.body}
        </p>

        {/* Note */}
        {current.note && (
          <p style={{
            fontSize: 13, color: '#949494', fontWeight: 300,
            textAlign: 'center', marginBottom: 20,
          }}>
            {current.note}
          </p>
        )}

        {/* CTA — pushed to bottom so card height stays consistent */}
        <div style={{ marginTop: 20, width: '100%' }}>
          <CtaButton label={current.cta} onClick={handleCta} />
        </div>
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
        borderRadius: 48.5,
        fontSize: 18, fontWeight: 600,
        color: DARK,
        cursor: 'pointer',
        fontFamily: KANIT,
        opacity: hov ? 0.85 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      {label}
    </button>
  )
}
