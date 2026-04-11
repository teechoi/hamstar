'use client'
import { useState, useEffect, useRef } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { VersionedTransaction } from '@solana/web3.js'
import { T } from '@/lib/theme'
import { HAMSTAR_MINT, HAMSTAR_SYMBOL, HAMSTAR_DECIMALS } from '@/lib/hamstar-token'

const KANIT = "var(--font-kanit), sans-serif"
const PRET  = 'Pretendard, sans-serif'
const SOL_MINT = 'So11111111111111111111111111111111111111112'

// Jupiter quote response (relevant fields only)
interface QuoteResponse {
  inAmount: string
  outAmount: string
  priceImpactPct: string
  slippageBps: number
  routePlan: unknown[]
}

const SLIPPAGE_OPTS = [0.3, 0.5, 1] as const
type Slippage = typeof SLIPPAGE_OPTS[number]

export function SwapWidget() {
  const { publicKey, sendTransaction, connected } = useWallet()
  const { connection } = useConnection()

  const [inputAmt, setInputAmt]     = useState('')
  const [quote, setQuote]           = useState<QuoteResponse | null>(null)
  const [fetching, setFetching]     = useState(false)
  const [swapping, setSwapping]     = useState(false)
  const [slippage, setSlippage]     = useState<Slippage>(0.5)
  const [showSlip, setShowSlip]     = useState(false)
  const [error, setError]           = useState('')
  const [txSig, setTxSig]           = useState('')

  const abortRef = useRef<AbortController | null>(null)
  const isPlaceholder = HAMSTAR_MINT.includes('xxx')

  // Debounced quote fetch
  useEffect(() => {
    setQuote(null)
    setError('')
    setTxSig('')

    const parsed = parseFloat(inputAmt)
    if (isPlaceholder || !inputAmt || isNaN(parsed) || parsed <= 0) return

    const timer = setTimeout(async () => {
      abortRef.current?.abort()
      abortRef.current = new AbortController()
      setFetching(true)

      try {
        const params = new URLSearchParams({
          inputMint: SOL_MINT,
          outputMint: HAMSTAR_MINT,
          amount: Math.floor(parsed * 1e9).toString(),
          slippageBps: Math.round(slippage * 100).toString(),
          onlyDirectRoutes: 'false',
        })
        const res = await fetch(`https://quote-api.jup.ag/v6/quote?${params}`, {
          signal: abortRef.current.signal,
        })
        if (!res.ok) throw new Error('no_route')
        const data: QuoteResponse = await res.json()
        setQuote(data)
      } catch (e: any) {
        if (e.name === 'AbortError') return
        setError('No routes found for this pair yet.')
        setQuote(null)
      } finally {
        setFetching(false)
      }
    }, 400)

    return () => {
      clearTimeout(timer)
      abortRef.current?.abort()
    }
  }, [inputAmt, slippage, isPlaceholder])

  const handleSwap = async () => {
    if (!quote || !publicKey) return
    setSwapping(true)
    setError('')
    setTxSig('')

    try {
      const res = await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: publicKey.toString(),
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: 'auto',
        }),
      })
      if (!res.ok) throw new Error('Failed to build swap transaction')
      const { swapTransaction } = await res.json()

      const tx = VersionedTransaction.deserialize(
        Uint8Array.from(atob(swapTransaction), c => c.charCodeAt(0))
      )
      const sig = await sendTransaction(tx, connection)
      setTxSig(sig)
      setInputAmt('')
      setQuote(null)
    } catch (e: any) {
      const msg = e?.message ?? ''
      if (msg.includes('rejected') || msg.includes('cancelled') || msg.includes('denied')) {
        setError('Transaction cancelled.')
      } else {
        setError('Swap failed — please try again.')
      }
    } finally {
      setSwapping(false)
    }
  }

  const outFormatted = quote
    ? (parseInt(quote.outAmount) / Math.pow(10, HAMSTAR_DECIMALS))
        .toLocaleString(undefined, { maximumFractionDigits: 0 })
    : ''

  const rate = quote && parseFloat(inputAmt) > 0
    ? Math.round(parseInt(quote.outAmount) / Math.pow(10, HAMSTAR_DECIMALS) / parseFloat(inputAmt))
        .toLocaleString()
    : null

  const priceImpact = quote ? parseFloat(quote.priceImpactPct) : 0
  const highImpact = priceImpact > 1

  return (
    <div>
      {/* Hide number input spinners globally for this widget */}
      <style>{`
        .swap-input::-webkit-outer-spin-button,
        .swap-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .swap-input[type=number] { -moz-appearance: textfield; }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

        {/* ── SOL input ── */}
        <TokenRow
          label="You pay"
          logo={<SolLogo />}
          symbol="SOL"
          editable
          value={inputAmt}
          onChange={setInputAmt}
          placeholder="0.00"
        />

        {/* ── Arrow ── */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '-3px 0' }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: T.purple,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13,
            boxShadow: '0 2px 8px rgba(115,93,255,0.35)',
          }}>↓</div>
        </div>

        {/* ── HAMSTAR output ── */}
        <TokenRow
          label="You receive"
          logo={<HamstarLogo />}
          symbol={HAMSTAR_SYMBOL.replace('$', '')}
          value={
            isPlaceholder ? '' :
            fetching      ? '…' :
            outFormatted  ? outFormatted : ''
          }
          placeholder={isPlaceholder ? 'Token launching soon' : '0'}
          placeholderMuted={isPlaceholder}
          highlight={!!outFormatted && !isPlaceholder}
        />

        {/* ── Rate + slippage ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px' }}>
          <span style={{ fontFamily: PRET, fontSize: 11, color: T.textMid }}>
            {rate
              ? <span>1 SOL ≈ <strong style={{ color: T.text }}>{rate}</strong> {HAMSTAR_SYMBOL}</span>
              : <span style={{ opacity: 0 }}>–</span>
            }
          </span>
          <button
            onClick={() => setShowSlip(s => !s)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: PRET, fontSize: 11, color: T.textMid,
            }}
          >
            <GearIcon /> {slippage}% slippage
          </button>
        </div>

        {/* Slippage picker */}
        {showSlip && (
          <div style={{ display: 'flex', gap: 6 }}>
            {SLIPPAGE_OPTS.map(s => (
              <button
                key={s}
                onClick={() => { setSlippage(s); setShowSlip(false) }}
                style={{
                  flex: 1, padding: '7px 0',
                  background: slippage === s ? T.purple : T.bg,
                  border: `1.5px solid ${slippage === s ? T.purple : T.border}`,
                  borderRadius: 10,
                  fontFamily: KANIT, fontSize: 12, fontWeight: 700,
                  color: slippage === s ? '#fff' : T.textMid,
                  cursor: 'pointer', transition: 'all 0.12s',
                }}
              >{s}%</button>
            ))}
          </div>
        )}

        {/* Price impact warning */}
        {highImpact && (
          <div style={{ background: T.coralSoft, border: '1px solid rgba(255,59,92,0.2)', borderRadius: 10, padding: '7px 12px' }}>
            <p style={{ fontFamily: PRET, fontSize: 12, color: T.coral, margin: 0 }}>
              High price impact: {priceImpact.toFixed(2)}%
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: T.coralSoft, border: '1px solid rgba(255,59,92,0.2)', borderRadius: 10, padding: '7px 12px' }}>
            <p style={{ fontFamily: PRET, fontSize: 12, color: T.coral, margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Success */}
        {txSig && (
          <div style={{
            background: 'rgba(0,197,102,0.08)', border: '1px solid rgba(0,197,102,0.25)',
            borderRadius: 10, padding: '8px 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontFamily: PRET, fontSize: 12, color: '#15803D' }}>Swap confirmed!</span>
            <a
              href={`https://explorer.solana.com/tx/${txSig}`}
              target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: KANIT, fontSize: 11, fontWeight: 700, color: T.purple, textDecoration: 'none' }}
            >View ↗</a>
          </div>
        )}

        {/* ── Swap button ── */}
        <SwapBtn
          isPlaceholder={isPlaceholder}
          connected={connected}
          canSwap={!!quote && !swapping}
          loading={swapping || (fetching && !!inputAmt)}
          onSwap={handleSwap}
        />

        {/* Jupiter attribution */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, paddingTop: 2 }}>
          <span style={{ fontFamily: PRET, fontSize: 10, color: '#ccc' }}>Powered by</span>
          <a
            href="https://jup.ag" target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: KANIT, fontSize: 10, fontWeight: 700, color: '#bbb', textDecoration: 'none', letterSpacing: 0.3 }}
          >Jupiter</a>
        </div>

      </div>
    </div>
  )
}

// ─── Token row ────────────────────────────────────────────────────────────────

function TokenRow({
  label, logo, symbol, editable, value, onChange, placeholder, placeholderMuted, highlight,
}: {
  label: string
  logo: React.ReactNode
  symbol: string
  editable?: boolean
  value: string
  onChange?: (v: string) => void
  placeholder?: string
  placeholderMuted?: boolean
  highlight?: boolean
}) {
  return (
    <div style={{
      background: T.bg,
      border: `1.5px solid ${highlight ? 'rgba(255,200,0,0.35)' : T.border}`,
      borderRadius: 16,
      padding: '11px 14px',
      transition: 'border-color 0.15s',
    }}>
      <p style={{ fontFamily: KANIT, fontSize: 9, fontWeight: 700, color: '#c0c0c0', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 7px' }}>
        {label}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Token badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
          {logo}
          <span style={{ fontFamily: KANIT, fontSize: 15, fontWeight: 700, color: T.text }}>{symbol}</span>
        </div>

        {/* Amount */}
        {editable ? (
          <input
            className="swap-input"
            type="number"
            min="0"
            step="any"
            value={value}
            onChange={e => onChange?.(e.target.value)}
            placeholder={placeholder ?? '0.00'}
            style={{
              flex: 1, textAlign: 'right',
              background: 'transparent', border: 'none', outline: 'none',
              fontFamily: KANIT, fontSize: 22, fontWeight: 700,
              color: value ? T.text : '#d0d0d0',
              padding: 0, minWidth: 0,
            }}
          />
        ) : (
          <div style={{ flex: 1, textAlign: 'right' }}>
            {value ? (
              <span style={{ fontFamily: KANIT, fontSize: 22, fontWeight: 700, color: highlight ? T.text : T.text }}>
                {value}
              </span>
            ) : (
              <span style={{ fontFamily: KANIT, fontSize: placeholderMuted ? 12 : 22, fontWeight: placeholderMuted ? 500 : 700, color: '#c0c0c0' }}>
                {placeholder ?? '0'}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Swap button ──────────────────────────────────────────────────────────────

function SwapBtn({ isPlaceholder, connected, canSwap, loading, onSwap }: {
  isPlaceholder: boolean
  connected: boolean
  canSwap: boolean
  loading: boolean
  onSwap: () => void
}) {
  const [hov, setHov] = useState(false)
  const KANIT = "var(--font-kanit), sans-serif"

  if (isPlaceholder) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: '13px 20px', borderRadius: 48.5,
      background: T.yellowSoft, border: `1.5px solid rgba(255,200,0,0.35)`,
      fontFamily: KANIT, fontSize: 13, fontWeight: 700, color: T.sub2,
    }}>
      🐹 Token launching soon
    </div>
  )

  if (!connected) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '13px 20px', borderRadius: 48.5,
      background: T.bg, border: `1.5px solid ${T.border}`,
      fontFamily: KANIT, fontSize: 13, fontWeight: 700, color: T.textMid,
    }}>
      Connect wallet to swap
    </div>
  )

  const disabled = !canSwap || loading
  return (
    <button
      onClick={onSwap}
      disabled={disabled}
      onMouseEnter={() => { if (!disabled) setHov(true) }}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: '100%', padding: '14px 20px', borderRadius: 48.5,
        background: disabled ? T.bg : hov ? T.limeDark : T.yellow,
        border: disabled ? `1.5px solid ${T.border}` : 'none',
        fontFamily: KANIT, fontSize: 14, fontWeight: 700,
        color: disabled ? T.textMid : T.text,
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.15s',
        boxShadow: disabled ? 'none' : hov ? T.shadowBtnYellow : '0 4px 14px rgba(255,215,0,0.3)',
        opacity: disabled && !loading ? 0.55 : 1,
      }}
    >
      {loading ? <Spinner /> : '🪐'}
      {loading ? 'Swapping…' : 'Swap'}
    </button>
  )
}

// ─── Logos ────────────────────────────────────────────────────────────────────

function SolLogo() {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%',
      background: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: 12, fontWeight: 800,
      fontFamily: "var(--font-kanit), sans-serif",
      flexShrink: 0,
    }}>◎</div>
  )
}

function HamstarLogo() {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: 9,
      background: T.yellow,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', flexShrink: 0,
    }}>
      <img src="/images/hamster-flash-flex.png" alt="" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function GearIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.12)" strokeWidth="3"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke={T.sub2} strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}
