'use client'
import { useState } from 'react'
import { T } from '@/lib/theme'

const KANIT = "var(--font-kanit), sans-serif"
const PRET  = 'Pretendard, sans-serif'

interface CheerModalProps {
  petId: string
  petName: string
  multiplier: number
  streakCount?: number
  onClose: () => void
  onConfirm: (petId: string, amountSol: number) => void
}

export function CheerModal({ petId, petName, multiplier, streakCount = 0, onClose, onConfirm }: CheerModalProps) {
  const [amount, setAmount]         = useState('0.5')
  const [step, setStep]             = useState<'input' | 'confirmed'>('input')
  const [hovConfirm, setHovConfirm] = useState(false)

  const amountNum   = parseFloat(amount) || 0
  const streakBonus = streakCount >= 3 ? 0.4 : streakCount === 2 ? 0.2 : 0
  const payout      = (amountNum * multiplier).toFixed(3)
  const profit      = ((amountNum * multiplier) - amountNum).toFixed(3)
  const canSubmit   = amountNum > 0

  const handleConfirm = () => {
    onConfirm(petId, amountNum)
    setStep('confirmed')
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 28,
          width: '100%', maxWidth: 400,
          position: 'relative',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1), 0 40px 80px rgba(77,67,83,0.18)',
          overflow: 'hidden',
        }}
      >
        {/* ── Yellow header ── */}
        <div style={{
          background: T.yellow,
          borderRadius: '28px 28px 0 0',
          padding: '22px 24px 20px',
          position: 'relative', overflow: 'hidden',
        }}>
          <img
            src="/images/cheese-hideout.png" alt=""
            style={{
              position: 'absolute', top: '50%', right: -14,
              transform: 'translateY(-50%) rotate(8deg)',
              width: 110, opacity: 0.28,
              pointerEvents: 'none', userSelect: 'none',
            }}
          />

          {/* Close button */}
          <CloseBtn onClick={onClose} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'rgba(0,0,0,0.08)', borderRadius: 6,
              padding: '3px 10px', marginBottom: 8,
            }}>
              <span style={{ fontFamily: KANIT, fontSize: 11, fontWeight: 700, color: T.sub2, letterSpacing: 0.5 }}>
                HAMSTAR ARENA
              </span>
            </div>
            <h2 style={{ fontFamily: KANIT, fontSize: 22, fontWeight: 800, color: T.text, margin: '0 0 4px', letterSpacing: '-0.025em' }}>
              Cheer for {petName}
            </h2>
            <p style={{ fontFamily: PRET, fontWeight: 500, fontSize: 13, color: 'rgba(0,0,0,0.5)', margin: 0 }}>
              {step === 'input'
                ? 'Pick your amount and lock in your support.'
                : 'Your cheer has been recorded!'}
            </p>
          </div>
        </div>

        {/* ── Input step ── */}
        {step === 'input' && (
          <div style={{ padding: '24px 28px 28px' }}>

            {/* Streak badge */}
            {streakCount >= 2 && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(115,93,255,0.08)', border: '1.5px solid rgba(115,93,255,0.2)',
                borderRadius: 14, padding: '10px 18px', marginBottom: 14,
              }}>
                <span style={{ fontFamily: PRET, fontWeight: 500, fontSize: 13, color: T.purple }}>
                  {streakCount}-race win streak
                </span>
                <span style={{ fontFamily: KANIT, fontWeight: 700, fontSize: 14, color: T.purple }}>
                  +{streakBonus}x weight bonus
                </span>
              </div>
            )}

            {/* Odds */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: T.bg, border: `1.5px solid ${T.border}`,
              borderRadius: 14, padding: '13px 18px',
              marginBottom: 20,
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            }}>
              <span style={{ fontFamily: PRET, fontWeight: 500, fontSize: 14, color: T.textMid }}>
                Current odds
              </span>
              <span style={{ fontFamily: KANIT, fontWeight: 800, fontSize: 18, color: T.purple, letterSpacing: '-0.01em' }}>
                {multiplier.toFixed(1)}x payout
              </span>
            </div>

            {/* Amount input */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                fontFamily: KANIT, fontWeight: 700, fontSize: 9,
                color: '#c8c8c8', textTransform: 'uppercase', letterSpacing: 1.2,
                display: 'block', marginBottom: 10,
              }}>
                Amount (SOL)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
                  fontFamily: KANIT, fontSize: 18, fontWeight: 700, color: T.textMid,
                  pointerEvents: 'none',
                }}>
                  ◎
                </span>
                <input
                  type="number"
                  min="0.01"
                  step="0.1"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  style={{
                    width: '100%', padding: '15px 20px 15px 46px',
                    border: `1.5px solid ${T.border}`, borderRadius: 18,
                    fontFamily: KANIT, fontSize: 22, fontWeight: 700,
                    letterSpacing: '-0.025em', color: T.text,
                    background: '#fff', outline: 'none', boxSizing: 'border-box',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                />
              </div>

              {/* Quick-pick amounts */}
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {[0.1, 0.5, 1.0, 2.0].map(v => (
                  <button
                    key={v}
                    onClick={() => setAmount(String(v))}
                    style={{
                      flex: 1, padding: '9px 4px',
                      background: amountNum === v ? T.yellow : '#fff',
                      border: `1.5px solid ${amountNum === v ? 'rgba(0,0,0,0.25)' : T.border}`,
                      borderRadius: 48.5,
                      fontFamily: KANIT, fontSize: 13, fontWeight: 700, color: T.text,
                      cursor: 'pointer', transition: 'all 0.12s',
                      boxShadow: amountNum === v ? '0 2px 8px rgba(255,215,0,0.3)' : 'none',
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Projected payout */}
            {canSubmit && (
              <div style={{
                background: 'rgba(115,93,255,0.06)',
                border: '1.5px solid rgba(115,93,255,0.15)',
                borderRadius: 16, padding: '14px 18px',
                marginBottom: 24,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <span style={{ fontFamily: PRET, fontWeight: 500, fontSize: 13, color: T.textMid }}>
                    If {petName} wins, you get
                  </span>
                  <span style={{ fontFamily: KANIT, fontWeight: 800, fontSize: 22, color: T.purple, letterSpacing: '-0.025em' }}>
                    ◎ {payout}
                  </span>
                </div>
                <span style={{ fontFamily: PRET, fontWeight: 500, fontSize: 12, color: T.textMid }}>
                  +{profit} SOL profit
                </span>
              </div>
            )}

            {/* Confirm */}
            <button
              onClick={handleConfirm}
              disabled={!canSubmit}
              onMouseEnter={() => setHovConfirm(true)}
              onMouseLeave={() => setHovConfirm(false)}
              style={{
                width: '100%', padding: '15px 20px',
                background: canSubmit ? (hovConfirm ? T.limeDark : T.yellow) : T.bg,
                border: canSubmit ? 'none' : `1.5px solid ${T.border}`,
                borderRadius: 48.5,
                fontFamily: KANIT, fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em',
                color: canSubmit ? T.text : T.textMid,
                cursor: canSubmit ? 'pointer' : 'default',
                transition: 'all 0.15s',
                marginBottom: 10,
                boxShadow: canSubmit ? (hovConfirm ? T.shadowBtnYellow : '0 4px 18px rgba(255,215,0,0.28)') : 'none',
                opacity: canSubmit ? 1 : 0.5,
              }}
            >
              Confirm Cheer
            </button>

            <button
              onClick={onClose}
              style={{
                width: '100%', padding: '11px',
                background: 'transparent', border: 'none',
                fontFamily: PRET, fontSize: 14, fontWeight: 500, color: T.textMid,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* ── Confirmed step ── */}
        {step === 'confirmed' && (
          <div style={{ padding: '32px 28px 36px', textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: T.yellow,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: T.shadowBtnYellow,
            }}>
              <img src="/images/hamster-champion.png" alt="" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
            </div>
            <h3 style={{ fontFamily: KANIT, fontSize: 22, fontWeight: 800, color: T.text, margin: '0 0 8px', letterSpacing: '-0.025em' }}>
              Cheer locked in!
            </h3>
            <p style={{ fontFamily: PRET, fontWeight: 500, fontSize: 14, color: T.textMid, marginBottom: 24, lineHeight: 1.6 }}>
              You&apos;re cheering <strong style={{ fontWeight: 700 }}>◎ {amountNum} SOL</strong> on {petName}.<br />
              Good luck!
            </p>

            {/* Summary */}
            <div style={{
              background: T.bg, border: `1.5px solid ${T.border}`,
              borderRadius: 16, padding: '16px 20px',
              display: 'flex', justifyContent: 'space-between',
              marginBottom: 24,
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            }}>
              {[
                { label: 'Your pick', value: petName,          color: T.text   },
                { label: 'Amount',    value: `◎ ${amountNum}`, color: T.text   },
                { label: 'If win',    value: `◎ ${payout}`,    color: T.purple },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ textAlign: 'left' }}>
                  <p style={{ fontFamily: KANIT, fontSize: 9, fontWeight: 700, color: '#c8c8c8', textTransform: 'uppercase', letterSpacing: 1.2, margin: '0 0 5px' }}>{label}</p>
                  <p style={{ fontFamily: KANIT, fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', color, margin: 0 }}>{value}</p>
                </div>
              ))}
            </div>

            <BackBtn onClick={onClose} />
          </div>
        )}
      </div>
    </div>
  )
}

function CloseBtn({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'absolute', top: 12, right: 12, zIndex: 2,
        background: hov ? 'rgba(0,0,0,0.14)' : 'rgba(0,0,0,0.08)',
        border: 'none', borderRadius: 8,
        width: 30, height: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: T.sub2, fontSize: 18, lineHeight: 1, cursor: 'pointer',
        transition: 'background 0.15s',
      }}
    >×</button>
  )
}

function BackBtn({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', padding: '15px 20px',
        background: hov ? T.limeDark : T.yellow,
        border: 'none', borderRadius: 48.5,
        fontFamily: KANIT, fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: T.text,
        cursor: 'pointer', transition: 'all 0.15s',
        boxShadow: hov ? T.shadowBtnYellow : '0 4px 18px rgba(255,215,0,0.28)',
      }}
    >
      Back to Arena
    </button>
  )
}
