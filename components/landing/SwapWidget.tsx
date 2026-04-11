'use client'
import { useState, useEffect, useRef } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { VersionedTransaction } from '@solana/web3.js'
import { T } from '@/lib/theme'
import { HAMSTAR_MINT, HAMSTAR_SYMBOL, HAMSTAR_DECIMALS } from '@/lib/hamstar-token'

const KANIT = "var(--font-kanit), sans-serif"
const PRET  = 'Pretendard, sans-serif'

// ─── Token config ─────────────────────────────────────────────────────────────

const INPUT_TOKENS = {
  SOL: {
    mint:     'So11111111111111111111111111111111111111112',
    symbol:   'SOL',
    name:     'Solana',
    decimals: 9,
    logoUrl:  'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  },
  USDC: {
    mint:     'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol:   'USDC',
    name:     'USD Coin',
    decimals: 6,
    logoUrl:  'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
  },
} as const
type InputTokenKey = keyof typeof INPUT_TOKENS

interface QuoteResponse {
  inAmount: string
  outAmount: string
  priceImpactPct: string
  slippageBps: number
  routePlan: unknown[]
}

const SLIPPAGE_OPTS = [0.3, 0.5, 1] as const
type Slippage = typeof SLIPPAGE_OPTS[number]

// ─── Main widget ──────────────────────────────────────────────────────────────

export function SwapWidget() {
  const { publicKey, sendTransaction, connected } = useWallet()
  const { connection } = useConnection()

  const [inputToken, setInputToken] = useState<InputTokenKey>('SOL')
  const [inputAmt, setInputAmt]     = useState('')
  const [quote, setQuote]           = useState<QuoteResponse | null>(null)
  const [fetching, setFetching]     = useState(false)
  const [swapping, setSwapping]     = useState(false)
  const [slippage, setSlippage]     = useState<Slippage>(0.5)
  const [showSlip, setShowSlip]     = useState(false)
  const [error, setError]           = useState('')
  const [txSig, setTxSig]           = useState('')

  const abortRef   = useRef<AbortController | null>(null)
  const isPlaceholder = HAMSTAR_MINT.includes('xxx')
  const token = INPUT_TOKENS[inputToken]

  // Reset amount when switching input token
  const handleTokenChange = (key: InputTokenKey) => {
    setInputToken(key)
    setInputAmt('')
    setQuote(null)
    setError('')
    setTxSig('')
  }

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
        const rawAmount = Math.floor(parsed * Math.pow(10, token.decimals)).toString()
        const params = new URLSearchParams({
          inputMint:    token.mint,
          outputMint:   HAMSTAR_MINT,
          amount:       rawAmount,
          slippageBps:  Math.round(slippage * 100).toString(),
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

    return () => { clearTimeout(timer); abortRef.current?.abort() }
  }, [inputAmt, inputToken, slippage, isPlaceholder]) // eslint-disable-line react-hooks/exhaustive-deps

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
      if (!res.ok) throw new Error('build_failed')
      const { swapTransaction } = await res.json()

      const tx = VersionedTransaction.deserialize(
        Uint8Array.from(atob(swapTransaction), c => c.charCodeAt(0))
      )
      const sig = await sendTransaction(tx, connection)
      setTxSig(sig)
      setInputAmt('')
      setQuote(null)
    } catch (e: any) {
      const msg = (e?.message ?? '').toLowerCase()
      setError(
        msg.includes('reject') || msg.includes('cancel') || msg.includes('denied')
          ? 'Transaction cancelled.'
          : 'Swap failed — please try again.'
      )
    } finally {
      setSwapping(false)
    }
  }

  const outFormatted = quote
    ? (parseInt(quote.outAmount) / Math.pow(10, HAMSTAR_DECIMALS))
        .toLocaleString(undefined, { maximumFractionDigits: 0 })
    : ''

  const rate = quote && parseFloat(inputAmt) > 0
    ? Math.round(
        parseInt(quote.outAmount) / Math.pow(10, HAMSTAR_DECIMALS) / parseFloat(inputAmt)
      ).toLocaleString()
    : null

  const priceImpact = quote ? parseFloat(quote.priceImpactPct) : 0

  return (
    <div>
      <style>{`
        .swap-input::-webkit-outer-spin-button,
        .swap-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .swap-input[type=number] { -moz-appearance: textfield; }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

        {/* ── Input row ── */}
        <div style={{
          background: T.bg,
          border: `1.5px solid ${T.border}`,
          borderRadius: 16, padding: '11px 14px',
        }}>
          <p style={labelStyle}>You pay</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TokenSelector
              selected={inputToken}
              onSelect={handleTokenChange}
            />
            <input
              className="swap-input"
              type="number"
              min="0"
              step="any"
              value={inputAmt}
              onChange={e => setInputAmt(e.target.value)}
              placeholder="0.00"
              style={{
                flex: 1, textAlign: 'right',
                background: 'transparent', border: 'none', outline: 'none',
                fontFamily: KANIT, fontSize: 22, fontWeight: 700,
                color: inputAmt ? T.text : '#d0d0d0',
                padding: 0, minWidth: 0,
              }}
            />
          </div>
        </div>

        {/* ── Swap direction arrow ── */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '-3px 0' }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: T.purple,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(115,93,255,0.3)',
          }}>
            <ArrowDownIcon />
          </div>
        </div>

        {/* ── Output row ── */}
        <div style={{
          background: T.bg,
          border: `1.5px solid ${outFormatted && !isPlaceholder ? 'rgba(255,200,0,0.4)' : T.border}`,
          borderRadius: 16, padding: '11px 14px',
          transition: 'border-color 0.2s',
        }}>
          <p style={labelStyle}>You receive</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* HAMSTAR token badge (fixed) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <HamstarLogo />
              <span style={{ fontFamily: KANIT, fontSize: 15, fontWeight: 700, color: T.text }}>
                {HAMSTAR_SYMBOL.replace('$', '')}
              </span>
            </div>
            {/* Amount */}
            <div style={{ flex: 1, textAlign: 'right' }}>
              {isPlaceholder ? (
                <span style={{ fontFamily: PRET, fontSize: 12, color: T.textMid }}>
                  Launching soon
                </span>
              ) : fetching ? (
                <span style={{ fontFamily: KANIT, fontSize: 20, fontWeight: 700, color: '#d0d0d0' }}>…</span>
              ) : outFormatted ? (
                <span style={{ fontFamily: KANIT, fontSize: 22, fontWeight: 700, color: T.text }}>
                  {outFormatted}
                </span>
              ) : (
                <span style={{ fontFamily: KANIT, fontSize: 22, fontWeight: 700, color: '#d0d0d0' }}>0</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Rate + slippage ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1px 4px' }}>
          <span style={{ fontFamily: PRET, fontSize: 11, color: T.textMid }}>
            {rate ? <>1 {token.symbol} ≈ <strong style={{ color: T.text }}>{rate}</strong> {HAMSTAR_SYMBOL}</> : null}
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

        {/* Price impact */}
        {priceImpact > 1 && (
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
            <span style={{ fontFamily: PRET, fontSize: 12, color: '#15803D' }}>Swap confirmed</span>
            <a
              href={`https://explorer.solana.com/tx/${txSig}`}
              target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: KANIT, fontSize: 11, fontWeight: 700, color: T.purple, textDecoration: 'none' }}
            >View ↗</a>
          </div>
        )}

        {/* ── Action button ── */}
        <SwapBtn
          isPlaceholder={isPlaceholder}
          connected={connected}
          canSwap={!!quote && !swapping}
          loading={swapping || (fetching && !!inputAmt)}
          onSwap={handleSwap}
        />

        {/* Attribution */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
          <span style={{ fontFamily: PRET, fontSize: 10, color: '#ccc' }}>Powered by</span>
          <a
            href="https://jup.ag" target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: KANIT, fontSize: 10, fontWeight: 700, color: '#bbb', textDecoration: 'none' }}
          >Jupiter</a>
        </div>

      </div>
    </div>
  )
}

// ─── Token selector ────────────────────────────────────────────────────────────

function TokenSelector({ selected, onSelect }: {
  selected: InputTokenKey
  onSelect: (k: InputTokenKey) => void
}) {
  const [open, setOpen] = useState(false)
  const token = INPUT_TOKENS[selected]

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {/* Trigger pill */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: '#fff',
          border: `1.5px solid ${open ? T.borderDark : T.border}`,
          borderRadius: 48.5, padding: '5px 10px 5px 5px',
          cursor: 'pointer', transition: 'border-color 0.15s',
        }}
      >
        <TokenLogo symbol={token.symbol} logoUrl={token.logoUrl} size={22} />
        <span style={{ fontFamily: KANIT, fontSize: 14, fontWeight: 700, color: T.text }}>
          {token.symbol}
        </span>
        <ChevronIcon open={open} />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Click-away backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 50 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 51,
            background: '#fff',
            border: `1.5px solid ${T.border}`,
            borderRadius: 14,
            boxShadow: T.shadowCard,
            overflow: 'hidden', minWidth: 140,
          }}>
            {(Object.keys(INPUT_TOKENS) as InputTokenKey[]).map(key => {
              const t = INPUT_TOKENS[key]
              const isSelected = selected === key
              return (
                <button
                  key={key}
                  onClick={() => { onSelect(key); setOpen(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    width: '100%', padding: '10px 14px',
                    background: isSelected ? T.yellowSoft : 'transparent',
                    border: 'none', cursor: 'pointer',
                    transition: 'background 0.12s',
                    textAlign: 'left',
                  }}
                >
                  <TokenLogo symbol={t.symbol} logoUrl={t.logoUrl} size={24} />
                  <div>
                    <p style={{ fontFamily: KANIT, fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>
                      {t.symbol}
                    </p>
                    <p style={{ fontFamily: PRET, fontSize: 10, color: T.textMid, margin: 0 }}>
                      {t.name}
                    </p>
                  </div>
                  {isSelected && (
                    <div style={{ marginLeft: 'auto' }}>
                      <CheckIcon />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}
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

  if (isPlaceholder) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: '13px 20px', borderRadius: 48.5,
      background: T.yellowSoft, border: `1.5px solid rgba(255,200,0,0.35)`,
      fontFamily: KANIT, fontSize: 13, fontWeight: 700, color: T.sub2,
    }}>
      <img src="/images/hamster-flash-flex.png" alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />
      Token launching soon
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
        opacity: disabled && !loading ? 0.5 : 1,
      }}
    >
      {loading ? <Spinner /> : <SwapIcon />}
      {loading ? 'Swapping…' : 'Swap'}
    </button>
  )
}

// ─── Token logo with CDN + fallback ──────────────────────────────────────────

function TokenLogo({ symbol, logoUrl, size = 28 }: { symbol: string; logoUrl: string; size?: number }) {
  const [failed, setFailed] = useState(false)

  if (!failed) {
    return (
      <img
        src={logoUrl}
        alt={symbol}
        width={size} height={size}
        style={{ borderRadius: '50%', flexShrink: 0, display: 'block' }}
        onError={() => setFailed(true)}
      />
    )
  }

  // Fallback SVGs if CDN fails
  if (symbol === 'SOL') return <SolFallback size={size} />
  return <UsdcFallback size={size} />
}

function SolFallback({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="sol-fb" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9945FF"/>
          <stop offset="100%" stopColor="#14F195"/>
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill="url(#sol-fb)"/>
      <g fill="white" fillOpacity="0.95">
        <polygon points="8,9.5 22.5,9.5 24,7.5 9.5,7.5"/>
        <polygon points="8,17 22.5,17 24,15 9.5,15"/>
        <polygon points="9.5,24.5 24,24.5 22.5,22.5 8,22.5"/>
      </g>
    </svg>
  )
}

function UsdcFallback({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="16" cy="16" r="16" fill="#2775CA"/>
      <circle cx="16" cy="16" r="9" fill="none" stroke="white" strokeWidth="2.5"/>
      <line x1="16" y1="9" x2="16" y2="23" stroke="white" strokeWidth="2.5"/>
      <line x1="11.5" y1="13" x2="20.5" y2="13" stroke="white" strokeWidth="2.5"/>
      <line x1="11.5" y1="19" x2="20.5" y2="19" stroke="white" strokeWidth="2.5"/>
    </svg>
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

const labelStyle: React.CSSProperties = {
  fontFamily: KANIT,
  fontSize: 9, fontWeight: 700,
  color: '#c0c0c0', textTransform: 'uppercase', letterSpacing: 1,
  margin: '0 0 7px',
}

function ArrowDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <polyline points="19 12 12 19 5 12"/>
    </svg>
  )
}

function SwapIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9"/>
      <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <polyline points="7 23 3 19 7 15"/>
      <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="10" height="10" viewBox="0 0 24 24" fill="none"
      stroke={T.textMid} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}
    >
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.purple} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

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
