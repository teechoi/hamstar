'use client'
import { useState } from 'react'
import { T } from '@/lib/theme'

const KANIT = "var(--font-kanit), sans-serif"
const PRET  = 'Pretendard, sans-serif'

interface CheerModalProps {
  petId: string
  petName: string
  multiplier: number
  streakCount?: number  // user's current consecutive win streak (0 = none)
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
        background: 'rgba(0,0,0,0.55)',
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
          boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
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
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'rgba(0,0,0,0.08)', borderRadius: 6,
              padding: '3px 10px', marginBottom: 8,
            }}>
              <span style={{ fontFamily: KANIT, fontSize: 11, fontWeight: 700, color: T.sub2, letterSpacing: 0.5 }}>
                🐹 HAMSTAR ARENA
              </span>
            </div>
            <h2 style={{ fontFamily: KANIT, fontSize: 22, fontWeight: 800, color: T.text, margin: '0 0 4px' }}>
              Cheer for {petName}
            </h2>
            <p style={{ fontFamily: PRET, fontSize: 13, color: 'rgba(0,0,0,0.5)', margin: 0 }}>
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
                borderRadius: 14, padding: '10px 18px', marginBottom: 12,
              }}>
                <span style={{ fontFamily: PRET, fontWeight: 600, fontSize: 13, color: T.purple }}>
                  {streakCount >= 3 ? '🔥' : '🔥'} {streakCount}-race win streak
                </span>
                <span style={{ fontFamily: KANIT, fontWeight: 700, fontSize: 14, color: T.purple }}>
                  +{streakBonus}x weight bonus
                </span>
              </div>
            )}

            {/* Odds */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: T.bg, borderRadius: 14, padding: '12px 18px',
              marginBottom: 20,
            }}>
              <span style={{ fontFamily: PRET, fontWeight: 500, fontSize: 14, color: T.textMid }}>
                Current odds
              </span>
              <span style={{ fontFamily: KANIT, fontWeight: 700, fontSize: 18, color: T.purple }}>
                {multiplier.toFixed(1)}x payout
              </span>
            </div>

            {/* Amount input */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                fontFamily: PRET, fontWeight: 500, fontSize: 13,
                color: T.textMid, display: 'block', marginBottom: 8,
              }}>
                Amount (SOL)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
                  fontFamily: KANIT, fontSize: 16, fontWeight: 600, color: T.textMid,
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
                    width: '100%', padding: '14px 20px 14px 44px',
                    border: `1.5px solid ${T.border}`, borderRadius: 48.5,
                    fontFamily: KANIT, fontSize: 16, fontWeight: 600, color: T.text,
                    background: '#fff', outline: 'none', boxSizing: 'border-box',
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
                      flex: 1, padding: '8px 4px',
                      background: amountNum === v ? T.yellow : T.bg,
                      border: `1.5px solid ${amountNum === v ? '#000' : T.border}`,
                      borderRadius: 48.5,
                      fontFamily: KANIT, fontSize: 12, fontWeight: 600, color: T.text,
                      cursor: 'pointer', transition: 'background 0.12s, border-color 0.12s',
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
                borderRadius: 14, padding: '14px 18px',
                marginBottom: 24,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <span style={{ fontFamily: PRET, fontWeight: 500, fontSize: 13, color: T.textMid }}>
                    If {petName} wins, you get
                  </span>
                  <span style={{ fontFamily: KANIT, fontWeight: 700, fontSize: 20, color: T.purple }}>
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
                width: '100%', padding: '16px',
                background: canSubmit ? (hovConfirm ? T.limeDark : T.yellow) : '#e8e8e8',
                border: canSubmit ? '2px solid #000' : 'none',
                borderRadius: 48.5,
                fontFamily: KANIT, fontSize: 16, fontWeight: 700,
                color: canSubmit ? T.text : '#aaa',
                cursor: canSubmit ? 'pointer' : 'default',
                transition: 'background 0.15s',
                marginBottom: 12,
                boxShadow: canSubmit ? '0 4px 16px rgba(255,231,144,0.5)' : 'none',
              }}
            >
              Confirm Cheer
            </button>

            <button
              onClick={onClose}
              style={{
                width: '100%', padding: '12px',
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
              fontSize: 36, margin: '0 auto 16px',
              boxShadow: '0 6px 20px rgba(255,231,144,0.6)',
            }}>
              🎉
            </div>
            <h3 style={{ fontFamily: KANIT, fontSize: 22, fontWeight: 700, color: T.text, margin: '0 0 8px' }}>
              Cheer locked in!
            </h3>
            <p style={{ fontFamily: PRET, fontSize: 14, color: T.textMid, marginBottom: 24, lineHeight: 1.6 }}>
              You&apos;re cheering <strong>◎ {amountNum} SOL</strong> on {petName}.<br />
              Good luck!
            </p>

            {/* Summary */}
            <div style={{
              background: T.bg, borderRadius: 14, padding: '16px 18px',
              display: 'flex', justifyContent: 'space-between',
              marginBottom: 24,
            }}>
              {[
                { label: 'Your pick',  value: petName,     color: T.text   },
                { label: 'Amount',     value: `◎ ${amountNum}`, color: T.text },
                { label: 'If win',     value: `◎ ${payout}`, color: T.purple },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ textAlign: 'left' }}>
                  <p style={{ fontFamily: PRET, fontSize: 11, color: T.textMid, margin: '0 0 4px' }}>{label}</p>
                  <p style={{ fontFamily: KANIT, fontSize: 15, fontWeight: 600, color, margin: 0 }}>{value}</p>
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

function BackBtn({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', padding: '16px',
        background: hov ? T.limeDark : T.yellow,
        border: '2px solid #000', borderRadius: 48.5,
        fontFamily: "var(--font-kanit), sans-serif", fontSize: 15, fontWeight: 700, color: T.text,
        cursor: 'pointer', transition: 'background 0.15s',
      }}
    >
      Back to Arena
    </button>
  )
}
