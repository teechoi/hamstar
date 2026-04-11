'use client'
import { useState, useEffect, useCallback } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { T } from '@/lib/theme'
import { HAMSTAR_MINT, HAMSTAR_SYMBOL, buildCheerTransaction } from '@/lib/hamstar-token'
import { SwapWidget } from '@/components/landing/SwapWidget'
import { useIsMobile } from '@/components/ui/index'

const KANIT  = "var(--font-kanit), sans-serif"
const PRET   = 'Pretendard, sans-serif'
const SYMBOL = HAMSTAR_SYMBOL.replace('$', '')

const QUICK_PICKS = [100, 500, 1000, 5000]

// True when the token hasn't launched yet or the race hasn't been created on-chain.
// In this mode cheers are recorded off-chain with no token transaction.
function isPreLaunchMode(mint: string, onChainRaceId: bigint | null): boolean {
  return mint.includes('xxx') || onChainRaceId === null
}

interface CheerModalProps {
  petId:           string
  petName:         string
  multiplier:      number
  streakCount?:    number
  hamsterIndex:    number        // 0 | 1 | 2 — maps pet to on-chain hamster slot
  onChainRaceId:   bigint | null // null = race not created on-chain yet
  onClose:         () => void
  onConfirm:       (petId: string, amountHamstar: number, txSignature?: string) => void
}

export function CheerModal({ petId, petName, multiplier, streakCount = 0, hamsterIndex, onChainRaceId, onClose, onConfirm }: CheerModalProps) {
  const { publicKey, connected, sendTransaction } = useWallet()
  const { connection }                            = useConnection()
  const isMobile                                  = useIsMobile()

  const [amount, setAmount]                 = useState('500')
  const [step, setStep]                     = useState<'input' | 'confirmed'>('input')
  const [hovConfirm, setHovConfirm]         = useState(false)
  const [hamstarBalance, setHamstarBalance] = useState<number | null>(null)
  const [fetchingBalance, setFetchingBalance] = useState(false)
  const [submitting, setSubmitting]         = useState(false)
  const [txError, setTxError]               = useState<string | null>(null)

  const preLaunch    = isPreLaunchMode(HAMSTAR_MINT, onChainRaceId)

  const amountNum   = parseFloat(amount) || 0
  const streakBonus = streakCount >= 3 ? 0.4 : streakCount === 2 ? 0.2 : 0
  const payout      = (amountNum * multiplier).toFixed(0)
  const profit      = Math.max(0, (amountNum * multiplier) - amountNum)
  // In pre-launch mode, skip balance check — there's no live token yet
  const canSubmit    = preLaunch
    ? amountNum > 0
    : amountNum > 0 && (hamstarBalance ?? 0) >= amountNum
  const insufficient = !preLaunch && amountNum > 0 && hamstarBalance !== null && hamstarBalance < amountNum

  // ── Balance fetch ──────────────────────────────────────────────────────────
  const refreshBalance = useCallback(async () => {
    // Skip balance fetch in pre-launch — no live token to query
    if (!publicKey || HAMSTAR_MINT.includes('xxx')) { setHamstarBalance(null); return }
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
      const built = await buildCheerTransaction(publicKey, amountNum, connection, onChainRaceId, hamsterIndex)
      if (built) {
        txSig = await sendTransaction(built.tx, connection)
        await connection.confirmTransaction(
          { signature: txSig, blockhash: built.blockhash, lastValidBlockHeight: built.lastValidBlockHeight },
          'confirmed',
        )
        await refreshBalance()
      }
      onConfirm(petId, amountNum, txSig)
      setStep('confirmed')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transaction failed'
      setTxError(msg.includes('rejected') || msg.includes('cancelled') ? 'Transaction cancelled.' : msg)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Determine view ─────────────────────────────────────────────────────────
  // Pre-launch: always show cheer view (no token to swap for yet)
  const view: 'get-token' | 'cheer' =
    !preLaunch && connected && hamstarBalance !== null && hamstarBalance === 0
      ? 'get-token'
      : 'cheer'

  const balanceFmt = hamstarBalance !== null
    ? hamstarBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })
    : null

  // ── Layout: bottom sheet on mobile, centered modal on desktop ─────────────
  const overlayAlign = isMobile ? 'flex-end' : 'center'
  const sheetRadius  = isMobile ? '24px 24px 0 0' : '28px'
  const sheetMaxW    = isMobile ? undefined : (view === 'get-token' ? 460 : 400)

  return (
    <>
      <style>{`
        @keyframes slideUp   { from{opacity:0;transform:translateY(100%)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeInUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: overlayAlign, justifyContent: 'center',
          padding: isMobile ? 0 : 16,
        }}
        onClick={onClose}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: '#fff',
            borderRadius: sheetRadius,
            width: '100%',
            maxWidth: sheetMaxW,
            position: 'relative',
            boxShadow: isMobile
              ? '0 -8px 32px rgba(0,0,0,0.12), 0 -2px 8px rgba(0,0,0,0.06)'
              : '0 8px 32px rgba(0,0,0,0.1), 0 40px 80px rgba(77,67,83,0.18)',
            overflow: 'hidden',
            animation: isMobile ? 'slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)' : 'fadeInUp 0.22s ease-out',
            maxHeight: isMobile ? '92vh' : undefined,
            overflowY: isMobile ? 'auto' : 'hidden',
            // Bottom safe area inset for notch devices
            paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 0px)' : undefined,
          }}
        >
          {/* ── Pull handle on mobile ── */}
          {isMobile && (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.12)' }} />
            </div>
          )}

          {/* ── Yellow header ── */}
          <div style={{
            background: T.yellow,
            borderRadius: isMobile ? '20px 20px 0 0' : '28px 28px 0 0',
            padding: isMobile ? '16px 20px 18px' : '22px 24px 20px',
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
                  HAMSTAR ARENA
                </span>
              </div>
              <h2 style={{ fontFamily: KANIT, fontSize: isMobile ? 20 : 22, fontWeight: 800, color: T.text, margin: '0 0 4px', letterSpacing: '-0.025em' }}>
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
            <div style={{ padding: isMobile ? '16px 16px 20px' : '20px 24px 24px' }}>
              <SwapWidget onSwapComplete={refreshBalance} />
            </div>
          )}

          {/* ── Cheer input ── */}
          {step === 'input' && view === 'cheer' && (
            <div style={{ padding: isMobile ? '16px 16px 20px' : '24px 28px 28px' }}>

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
                  <p style={{ fontFamily: KANIT, fontSize: 11, fontWeight: 700, color: '#c8c8c8', textTransform: 'uppercase', letterSpacing: 1.2, margin: '0 0 3px' }}>Current Odds</p>
                  <span style={{ fontFamily: KANIT, fontWeight: 800, fontSize: 18, color: T.purple, letterSpacing: '-0.01em' }}>
                    {multiplier.toFixed(1)}x payout
                  </span>
                </div>
                {!preLaunch && balanceFmt !== null && (
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: KANIT, fontSize: 11, fontWeight: 700, color: '#c8c8c8', textTransform: 'uppercase', letterSpacing: 1.2, margin: '0 0 3px' }}>Your Balance</p>
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
                  fontFamily: KANIT, fontWeight: 700, fontSize: 11,
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
                  <p style={{ fontFamily: PRET, fontWeight: 500, fontSize: 11, color: T.coral, margin: '6px 0 0 4px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Insufficient balance —{' '}
                    <button
                      onClick={() => setAmount(String(Math.floor(hamstarBalance!)))}
                      style={{
                        background: 'none', border: 'none', color: T.purple,
                        fontFamily: PRET, fontWeight: 700, fontSize: 11,
                        cursor: 'pointer',
                        // Touch target: invisible padding around small text
                        padding: '6px 8px', margin: '-6px -8px',
                      }}
                    >
                      use max
                    </button>
                  </p>
                )}

                {/* Quick-pick amounts — 2×2 grid on mobile, 1 row on desktop */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
                  gap: 8,
                  marginTop: 10,
                }}>
                  {QUICK_PICKS.map(v => (
                    <button
                      key={v}
                      onClick={() => setAmount(String(v))}
                      style={{
                        padding: isMobile ? '12px 8px' : '9px 4px',
                        background: amountNum === v ? T.yellow : T.bg,
                        border: 'none', borderRadius: 48.5,
                        fontFamily: KANIT, fontSize: 13, fontWeight: 700, color: T.text,
                        cursor: 'pointer', transition: 'all 0.12s',
                        boxShadow: amountNum === v ? '0 2px 10px rgba(255,215,0,0.35)' : 'none',
                        minHeight: 44,
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
                  marginBottom: 20,
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

              {/* Pre-launch info banner */}
              {preLaunch && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  background: 'rgba(255,231,144,0.35)',
                  border: '1.5px solid rgba(255,214,67,0.4)',
                  borderRadius: 12, padding: '10px 14px', marginBottom: 16,
                }}>
                  <span style={{ fontSize: 15, flexShrink: 0, lineHeight: '20px' }}>⏳</span>
                  <p style={{ fontFamily: PRET, fontWeight: 500, fontSize: 12, color: T.sub2, margin: 0, lineHeight: 1.5 }}>
                    <strong style={{ fontWeight: 700 }}>Pre-launch mode</strong> — {SYMBOL} token not yet live.
                    Your cheer is recorded and will count when the token launches.
                  </p>
                </div>
              )}

              {/* Confirm */}
              <button
                onClick={handleConfirm}
                disabled={!canSubmit || submitting}
                onMouseEnter={() => setHovConfirm(true)}
                onMouseLeave={() => setHovConfirm(false)}
                style={{
                  width: '100%',
                  padding: isMobile ? '17px 20px' : '15px 20px',
                  background: canSubmit && !submitting ? (hovConfirm ? T.limeDark : T.yellow) : T.bg,
                  border: 'none', borderRadius: 48.5,
                  fontFamily: KANIT, fontSize: isMobile ? 16 : 15, fontWeight: 800, letterSpacing: '-0.01em',
                  color: canSubmit && !submitting ? T.text : T.textMid,
                  cursor: canSubmit && !submitting ? 'pointer' : 'default',
                  transition: 'all 0.15s', marginBottom: txError ? 8 : 10,
                  boxShadow: canSubmit && !submitting ? (hovConfirm ? T.shadowBtnYellow : '0 4px 18px rgba(255,215,0,0.28)') : 'none',
                  opacity: canSubmit && !submitting ? 1 : 0.45,
                  minHeight: 52,
                }}
              >
                {submitting
                  ? (preLaunch ? 'Recording cheer…' : 'Confirming on-chain…')
                  : !connected
                    ? 'Connect wallet to cheer'
                    : `Cheer ${parseInt(payout).toLocaleString()} ${SYMBOL} on ${petName}`}
              </button>

              {txError && (
                <p style={{
                  fontFamily: PRET, fontWeight: 500, fontSize: 12, color: T.coral,
                  textAlign: 'center', margin: '0 0 8px',
                  wordBreak: 'break-word', lineHeight: 1.5,
                }}>
                  {txError}
                </p>
              )}

            </div>
          )}

          {/* ── Confirmed step ── */}
          {step === 'confirmed' && (
            <div style={{ padding: isMobile ? '28px 20px 32px' : '32px 28px 36px', textAlign: 'center' }}>
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
                  { label: 'Your pick', value: petName,                          color: T.text,   sol: false },
                  { label: 'Amount',    value: amountNum.toLocaleString(),        color: T.text,   sol: true  },
                  { label: 'If win',    value: parseInt(payout).toLocaleString(), color: T.purple, sol: true  },
                ] as const).map(({ label, value, color, sol }) => (
                  <div key={label} style={{ textAlign: 'left' }}>
                    <p style={{ fontFamily: KANIT, fontSize: 11, fontWeight: 700, color: '#c8c8c8', textTransform: 'uppercase', letterSpacing: 1.2, margin: '0 0 5px' }}>{label}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      {sol && <HamstarLogo size={13} />}
                      <p style={{ fontFamily: KANIT, fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', color, margin: 0 }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      </div>
    </>
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

