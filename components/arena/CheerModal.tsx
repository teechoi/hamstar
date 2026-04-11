'use client'
import { useState, useEffect, useCallback } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { T } from '@/lib/theme'
import { HAMSTAR_MINT, HAMSTAR_SYMBOL, buildCheerTransaction } from '@/lib/hamstar-token'
import { SwapWidget } from '@/components/landing/SwapWidget'

const KANIT  = "var(--font-kanit), sans-serif"
const PRET   = 'Pretendard, sans-serif'
const SYMBOL = HAMSTAR_SYMBOL.replace('$', '')

const QUICK_PICKS = [100, 500, 1000, 5000]

interface CheerModalProps {
  petId:        string
  petName:      string
  multiplier:   number
  streakCount?: number
  onClose:      () => void
  onConfirm:    (petId: string, amountHamstar: number, txSignature?: string) => void
}

export function CheerModal({ petId, petName, multiplier, streakCount = 0, onClose, onConfirm }: CheerModalProps) {
  const { publicKey, connected, sendTransaction } = useWallet()
  const { connection }                            = useConnection()

  const [amount, setAmount]               = useState('500')
  const [step, setStep]                   = useState<'input' | 'confirmed'>('input')
  const [hovConfirm, setHovConfirm]       = useState(false)
  const [hamstarBalance, setHamstarBalance] = useState<number | null>(null)
  const [fetchingBalance, setFetchingBalance] = useState(false)
  const [submitting, setSubmitting]         = useState(false)
  const [txError, setTxError]               = useState<string | null>(null)

  const amountNum   = parseFloat(amount) || 0
  const streakBonus = streakCount >= 3 ? 0.4 : streakCount === 2 ? 0.2 : 0
  const payout      = (amountNum * multiplier).toFixed(0)
  const profit      = Math.max(0, (amountNum * multiplier) - amountNum)
  const canSubmit   = amountNum > 0 && (hamstarBalance ?? 0) >= amountNum
  const insufficient = amountNum > 0 && hamstarBalance !== null && hamstarBalance < amountNum

  // ── Balance fetch ──────────────────────────────────────────────────────────
  const refreshBalance = useCallback(async () => {
    if (!publicKey) { setHamstarBalance(null); return }
    setFetchingBalance(true)
    try {
      const accounts = await connection.getTokenAccountsByOwner(publicKey, {
        mint: new PublicKey(HAMSTAR_MINT),
      })
      if (accounts.value.length === 0) {
        setHamstarBalance(0)
      } else {
        const info = await connection.getTokenAccountBalance(accounts.value[0].pubkey)
        setHamstarBalance(parseFloat(info.value.uiAmountString ?? '0'))
      }
    } catch {
      setHamstarBalance(0)
    } finally {
      setFetchingBalance(false)
    }
  }, [publicKey, connection])

  useEffect(() => { refreshBalance() }, [refreshBalance])

  const handleConfirm = async () => {
    if (!publicKey) return
    setSubmitting(true)
    setTxError(null)
    try {
      let txSig: string | undefined
      const built = await buildCheerTransaction(publicKey, amountNum, connection)
      if (built) {
        // Token is live — send the real on-chain transfer
        txSig = await sendTransaction(built.tx, connection)
        await connection.confirmTransaction(
          { signature: txSig, blockhash: built.blockhash, lastValidBlockHeight: built.lastValidBlockHeight },
          'confirmed',
        )
        // Refresh balance after confirmed transfer
        await refreshBalance()
      }
      onConfirm(petId, amountNum, txSig)
      setStep('confirmed')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transaction failed'
      // Surface wallet rejection without the full error stack
      setTxError(msg.includes('rejected') || msg.includes('cancelled') ? 'Transaction cancelled.' : msg)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Determine view ─────────────────────────────────────────────────────────
  // get-token  — connected but zero HAMSTAR balance
  // cheer      — has balance (or not connected), can place cheer
  const view: 'get-token' | 'cheer' =
    connected && hamstarBalance !== null && hamstarBalance === 0 ? 'get-token' : 'cheer'

  const balanceFmt = hamstarBalance !== null
    ? hamstarBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })
    : null

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
          width: '100%', maxWidth: view === 'get-token' ? 460 : 400,
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
              {step === 'confirmed' ? 'Cheer locked in!' : `Cheer for ${petName}`}
            </h2>
            <p style={{ fontFamily: PRET, fontWeight: 500, fontSize: 13, color: 'rgba(0,0,0,0.5)', margin: 0 }}>
              {step === 'confirmed'
                ? 'Your cheer has been recorded!'
                : view === 'get-token'
                  ? `Swap SOL or USDC for ${SYMBOL} to cheer.`
                  : 'Pick your amount and lock in your support.'}
            </p>
          </div>
        </div>

        {/* ── Get $HAMSTAR first ── */}
        {step === 'input' && view === 'get-token' && (
          <div style={{ padding: '20px 24px 24px' }}>

            {/* SOL context banner */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(115,93,255,0.07) 0%, rgba(115,93,255,0.04) 100%)',
              border: `1.5px solid rgba(115,93,255,0.15)`,
              borderRadius: 14, padding: '14px 18px', marginBottom: 18,
              display: 'flex', alignItems: 'flex-start', gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'rgba(115,93,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>◎</div>
              <div>
                <p style={{ fontFamily: KANIT, fontWeight: 700, fontSize: 13, color: T.text, margin: '0 0 3px', letterSpacing: '-0.01em' }}>
                  This runs on Solana
                </p>
                <p style={{ fontFamily: PRET, fontWeight: 500, fontSize: 12, color: T.textMid, margin: 0, lineHeight: 1.5 }}>
                  Swap your SOL or USDC for <strong style={{ fontWeight: 700, color: T.text }}>${SYMBOL}</strong> below. Fast, cheap, non-custodial.
                </p>
              </div>
            </div>

            <SwapWidget onSwapComplete={refreshBalance} />

            <button
              onClick={onClose}
              style={{
                width: '100%', padding: '12px', marginTop: 12,
                background: 'transparent', border: 'none',
                fontFamily: PRET, fontSize: 13, fontWeight: 500, color: T.textMid,
                cursor: 'pointer',
              }}
            >
              ← Back to Arena
            </button>
          </div>
        )}

        {/* ── Cheer input ── */}
        {step === 'input' && view === 'cheer' && (
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

            {/* Odds + balance row */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: T.bg, border: `1.5px solid ${T.border}`,
              borderRadius: 14, padding: '13px 18px', marginBottom: 20,
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            }}>
              <div>
                <p style={{ fontFamily: KANIT, fontSize: 9, fontWeight: 700, color: '#c8c8c8', textTransform: 'uppercase', letterSpacing: 1.2, margin: '0 0 3px' }}>Current Odds</p>
                <span style={{ fontFamily: KANIT, fontWeight: 800, fontSize: 18, color: T.purple, letterSpacing: '-0.01em' }}>
                  {multiplier.toFixed(1)}x payout
                </span>
              </div>
              {balanceFmt !== null && (
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: KANIT, fontSize: 9, fontWeight: 700, color: '#c8c8c8', textTransform: 'uppercase', letterSpacing: 1.2, margin: '0 0 3px' }}>Your Balance</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end' }}>
                    <HamstarLogo size={14} />
                    <span style={{ fontFamily: KANIT, fontWeight: 700, fontSize: 15, color: T.text, letterSpacing: '-0.01em' }}>
                      {fetchingBalance ? '…' : balanceFmt}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Amount input */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                fontFamily: KANIT, fontWeight: 700, fontSize: 9,
                color: '#c8c8c8', textTransform: 'uppercase', letterSpacing: 1.2,
                display: 'block', marginBottom: 10,
              }}>
                Amount ({SYMBOL})
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  pointerEvents: 'none', display: 'flex', alignItems: 'center',
                }}>
                  <HamstarLogo size={22} />
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  style={{
                    width: '100%', padding: '15px 20px 15px 46px',
                    border: `1.5px solid ${insufficient ? 'rgba(255,59,92,0.4)' : T.border}`,
                    borderRadius: 18,
                    fontFamily: KANIT, fontSize: 22, fontWeight: 700,
                    letterSpacing: '-0.025em', color: T.text,
                    background: '#fff', outline: 'none', boxSizing: 'border-box',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                />
              </div>

              {insufficient && (
                <p style={{ fontFamily: PRET, fontWeight: 500, fontSize: 11, color: T.coral, margin: '6px 0 0 4px' }}>
                  Insufficient balance — <button onClick={() => setAmount(String(Math.floor(hamstarBalance!)))} style={{ background: 'none', border: 'none', color: T.purple, fontFamily: PRET, fontWeight: 700, fontSize: 11, cursor: 'pointer', padding: 0 }}>use max</button>
                </p>
              )}

              {/* Quick-pick amounts */}
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {QUICK_PICKS.map(v => (
                  <button
                    key={v}
                    onClick={() => setAmount(String(v))}
                    style={{
                      flex: 1, padding: '9px 4px',
                      background: amountNum === v ? T.yellow : T.bg,
                      border: 'none', borderRadius: 48.5,
                      fontFamily: KANIT, fontSize: 13, fontWeight: 700, color: T.text,
                      cursor: 'pointer', transition: 'all 0.12s',
                      boxShadow: amountNum === v ? '0 2px 10px rgba(255,215,0,0.35)' : 'none',
                    }}
                  >
                    {v >= 1000 ? `${v / 1000}k` : v}
                  </button>
                ))}
              </div>
            </div>

            {/* Projected payout */}
            {amountNum > 0 && (
              <div style={{
                background: 'rgba(115,93,255,0.06)',
                border: '1.5px solid rgba(115,93,255,0.15)',
                borderRadius: 16, padding: '14px 18px',
                marginBottom: 24,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontFamily: PRET, fontWeight: 500, fontSize: 13, color: T.textMid }}>
                    If {petName} wins, you get
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: KANIT, fontWeight: 800, fontSize: 22, color: T.purple, letterSpacing: '-0.025em' }}>
                    <HamstarLogo size={20} />{parseInt(payout).toLocaleString()}
                  </span>
                </div>
                <span style={{ fontFamily: PRET, fontWeight: 500, fontSize: 12, color: T.textMid }}>
                  +{Math.floor(profit).toLocaleString()} {SYMBOL} profit
                </span>
              </div>
            )}

            {/* Confirm */}
            <button
              onClick={handleConfirm}
              disabled={!canSubmit || submitting}
              onMouseEnter={() => setHovConfirm(true)}
              onMouseLeave={() => setHovConfirm(false)}
              style={{
                width: '100%', padding: '15px 20px',
                background: canSubmit && !submitting ? (hovConfirm ? T.limeDark : T.yellow) : T.bg,
                border: 'none', borderRadius: 48.5,
                fontFamily: KANIT, fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em',
                color: canSubmit && !submitting ? T.text : T.textMid,
                cursor: canSubmit && !submitting ? 'pointer' : 'default',
                transition: 'all 0.15s', marginBottom: txError ? 8 : 10,
                boxShadow: canSubmit && !submitting ? (hovConfirm ? T.shadowBtnYellow : '0 4px 18px rgba(255,215,0,0.28)') : 'none',
                opacity: canSubmit && !submitting ? 1 : 0.45,
              }}
            >
              {submitting
                ? 'Confirming on-chain…'
                : !connected
                  ? 'Connect wallet to cheer'
                  : `Cheer ${parseInt(payout).toLocaleString()} ${SYMBOL} on ${petName}`}
            </button>

            {txError && (
              <p style={{ fontFamily: PRET, fontWeight: 500, fontSize: 12, color: T.coral, textAlign: 'center', margin: '0 0 8px' }}>
                {txError}
              </p>
            )}

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
            <p style={{ fontFamily: PRET, fontWeight: 500, fontSize: 14, color: T.textMid, marginBottom: 24, lineHeight: 1.6 }}>
              You&apos;re cheering{' '}
              <strong style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, verticalAlign: 'middle' }}>
                <HamstarLogo size={14} />{amountNum.toLocaleString()} {SYMBOL}
              </strong>{' '}on {petName}.<br />
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
              {([
                { label: 'Your pick', value: petName,                         color: T.text,   sol: false },
                { label: 'Amount',    value: amountNum.toLocaleString(),       color: T.text,   sol: true  },
                { label: 'If win',    value: parseInt(payout).toLocaleString(), color: T.purple, sol: true  },
              ] as const).map(({ label, value, color, sol }) => (
                <div key={label} style={{ textAlign: 'left' }}>
                  <p style={{ fontFamily: KANIT, fontSize: 9, fontWeight: 700, color: '#c8c8c8', textTransform: 'uppercase', letterSpacing: 1.2, margin: '0 0 5px' }}>{label}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    {sol && <HamstarLogo size={13} />}
                    <p style={{ fontFamily: KANIT, fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', color, margin: 0 }}>{value}</p>
                  </div>
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

// ─── Hamstar token logo ───────────────────────────────────────────────────────

function HamstarLogo({ size = 28 }: { size?: number }) {
  const r = Math.round(size * 0.32)
  return (
    <div style={{
      width: size, height: size, borderRadius: r,
      background: T.yellow,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', flexShrink: 0,
    }}>
      <img src="/images/hamster-flash-flex.png" alt="" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
    </div>
  )
}

// ─── Buttons ─────────────────────────────────────────────────────────────────

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
