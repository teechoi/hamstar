'use client'
import { useState, useEffect, useRef } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { VersionedTransaction } from '@solana/web3.js'
import { T } from '@/lib/theme'
import { HAMSTAR_MINT, HAMSTAR_SYMBOL, HAMSTAR_DECIMALS } from '@/lib/hamstar-token'

const KANIT = "var(--font-kanit), sans-serif"
const PRET  = 'Pretendard, sans-serif'

// ─── Token registry ───────────────────────────────────────────────────────────

type TokenKey = 'SOL' | 'USDC' | 'HAMSTAR'

interface TokenConfig {
  mint:        string
  symbol:      string
  name:        string
  decimals:    number
  logoUrl:     string | null   // null = use HamstarLogo component
  placeholder: boolean         // true = not yet deployed
}

const TOKENS: Record<TokenKey, TokenConfig> = {
  SOL: {
    mint:        'So11111111111111111111111111111111111111112',
    symbol:      'SOL',
    name:        'Solana',
    decimals:    9,
    logoUrl:     'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    placeholder: false,
  },
  USDC: {
    mint:        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol:      'USDC',
    name:        'USD Coin',
    decimals:    6,
    logoUrl:     'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    placeholder: false,
  },
  HAMSTAR: {
    mint:        HAMSTAR_MINT,
    symbol:      HAMSTAR_SYMBOL.replace('$', ''),
    name:        'Hamstar',
    decimals:    HAMSTAR_DECIMALS,
    logoUrl:     null,
    placeholder: HAMSTAR_MINT.includes('xxx'),
  },
}

const ALL_KEYS: TokenKey[] = ['SOL', 'USDC', 'HAMSTAR']

// ─── Jupiter types ────────────────────────────────────────────────────────────

interface QuoteResponse {
  inAmount:       string
  outAmount:      string
  priceImpactPct: string
  slippageBps:    number
  routePlan:      unknown[]
}

const SLIPPAGE_OPTS = [0.3, 0.5, 1] as const
type Slippage = typeof SLIPPAGE_OPTS[number]

// ─── Formatting helpers ───────────────────────────────────────────────────────

function fmtOut(rawAmount: string, token: TokenConfig): string {
  const n = parseInt(rawAmount) / Math.pow(10, token.decimals)
  if (token.decimals === 6) {
    // USDC-style: always 2dp
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  if (n >= 10_000) return Math.round(n).toLocaleString()
  if (n >= 1)      return n.toLocaleString(undefined, { maximumFractionDigits: 4 })
  return n.toLocaleString(undefined, { maximumFractionDigits: 6 })
}

function fmtRate(quote: QuoteResponse, inToken: TokenConfig, outToken: TokenConfig, inputAmt: string): string | null {
  const parsed = parseFloat(inputAmt)
  if (!parsed || parsed <= 0) return null
  const inRaw  = parsed * Math.pow(10, inToken.decimals)
  const outAmt = parseInt(quote.outAmount) / Math.pow(10, outToken.decimals)
  const rate   = outAmt / (inRaw / Math.pow(10, inToken.decimals))
  if (rate >= 1000) return `1 ${inToken.symbol} ≈ ${Math.round(rate).toLocaleString()} ${outToken.symbol}`
  if (rate >= 1)    return `1 ${inToken.symbol} ≈ ${rate.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${outToken.symbol}`
  return `1 ${inToken.symbol} ≈ ${rate.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${outToken.symbol}`
}

// ─── Main widget ──────────────────────────────────────────────────────────────

export function SwapWidget({ onSwapComplete }: { onSwapComplete?: () => void } = {}) {
  const { publicKey, sendTransaction, connected } = useWallet()
  const { connection } = useConnection()

  const [inKey,  setInKey]  = useState<TokenKey>('SOL')
  const [outKey, setOutKey] = useState<TokenKey>('HAMSTAR')
  const [inputAmt, setInputAmt]   = useState('')
  const [quote, setQuote]         = useState<QuoteResponse | null>(null)
  const [fetching, setFetching]   = useState(false)
  const [swapping, setSwapping]   = useState(false)
  const [slippage, setSlippage]   = useState<Slippage>(0.5)
  const [showSlip, setShowSlip]   = useState(false)
  const [error, setError]         = useState('')
  const [txSig, setTxSig]         = useState('')
  const [pressing, setPressing]   = useState(false)

  const abortRef = useRef<AbortController | null>(null)
  const inToken  = TOKENS[inKey]
  const outToken = TOKENS[outKey]
  const pairDisabled = inToken.placeholder || outToken.placeholder

  // ── Token selection with auto-reverse on conflict ──────────────────────────
  const selectIn = (k: TokenKey) => {
    if (k === outKey) { handleReverse(); return }
    setInKey(k)
    reset()
  }
  const selectOut = (k: TokenKey) => {
    if (k === inKey) { handleReverse(); return }
    setOutKey(k)
    reset()
  }

  const reset = () => { setInputAmt(''); setQuote(null); setError(''); setTxSig('') }

  const handleReverse = () => {
    setInKey(outKey)
    setOutKey(inKey)
    reset()
  }

  // ── Quote fetch ────────────────────────────────────────────────────────────
  useEffect(() => {
    setQuote(null)
    setError('')

    const parsed = parseFloat(inputAmt)
    if (pairDisabled || !inputAmt || isNaN(parsed) || parsed <= 0) return

    const timer = setTimeout(async () => {
      abortRef.current?.abort()
      abortRef.current = new AbortController()
      setFetching(true)

      try {
        const rawAmount = Math.floor(parsed * Math.pow(10, inToken.decimals)).toString()
        const params = new URLSearchParams({
          inputMint:   inToken.mint,
          outputMint:  outToken.mint,
          amount:      rawAmount,
          slippageBps: Math.round(slippage * 100).toString(),
          swapMode:    'ExactIn',
        })

        const res = await fetch(`https://lite-api.jup.ag/swap/v1/quote?${params}`, {
          signal: abortRef.current!.signal,
        })

        const json = await res.json()

        if (!res.ok || json.error) {
          const apiMsg: string = json.error ?? json.message ?? ''
          if (res.status === 429) throw new Error('rate_limit')
          if (apiMsg.toLowerCase().includes('route') || apiMsg.toLowerCase().includes('no route')) throw new Error('no_route')
          throw new Error(apiMsg || 'api_error')
        }

        if (!json.outAmount) throw new Error('no_route')
        setQuote(json as QuoteResponse)
      } catch (e: any) {
        if (e.name === 'AbortError') return
        const code = e.message ?? ''
        setError(
          code === 'rate_limit' ? 'Too many requests — wait a moment and try again.' :
          code === 'network'    ? 'Cannot reach Jupiter. Check your connection.' :
          code === 'no_route'   ? 'No route found for this pair.' :
          `Quote failed — ${code || 'please try again.'}`
        )
        setQuote(null)
      } finally {
        setFetching(false)
      }
    }, 400)

    return () => { clearTimeout(timer); abortRef.current?.abort() }
  }, [inputAmt, inKey, outKey, slippage, pairDisabled]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Swap ───────────────────────────────────────────────────────────────────
  const handleSwap = async () => {
    if (!quote || !publicKey) return
    setSwapping(true); setError(''); setTxSig('')

    try {
      const res = await fetch('https://lite-api.jup.ag/swap/v1/swap', {
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
      setTxSig(sig); setInputAmt(''); setQuote(null)
      onSwapComplete?.()
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

  const outFormatted = quote ? fmtOut(quote.outAmount, outToken) : ''
  const rateStr      = quote ? fmtRate(quote, inToken, outToken, inputAmt) : null
  const priceImpact  = quote ? parseFloat(quote.priceImpactPct) : 0

  return (
    <div>
      <style>{`
        .swap-input::-webkit-outer-spin-button,
        .swap-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .swap-input[type=number] { -moz-appearance: textfield; }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

        {/* ── Input row ── */}
        <TokenRow
          label="You pay"
          tokenKey={inKey}
          otherKey={outKey}
          onSelect={selectIn}
          editable
          value={inputAmt}
          onChange={setInputAmt}
        />

        {/* ── Reverse button — floats between cards ── */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '-6px 0', zIndex: 1, position: 'relative' }}>
          <div style={{ flex: 1, height: 1, background: T.border }} />
          <button
            onClick={handleReverse}
            onMouseDown={() => setPressing(true)}
            onMouseUp={() => setPressing(false)}
            onMouseLeave={() => setPressing(false)}
            style={{
              width: 34, height: 34, borderRadius: 10,
              background: T.purple,
              border: '3px solid #fff',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 10px', flexShrink: 0,
              transform: pressing ? 'scale(0.82)' : 'scale(1)',
              transition: pressing ? 'transform 0.06s ease' : 'transform 0.18s ease',
            } as React.CSSProperties}
          >
            <ReverseIcon />
          </button>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </div>

        {/* ── Output row ── */}
        <TokenRow
          label="You receive"
          tokenKey={outKey}
          otherKey={inKey}
          onSelect={selectOut}
          value={
            pairDisabled ? '' :
            fetching     ? '…' :
            outFormatted
          }
          outputHighlight={!!outFormatted && !pairDisabled}
          placeholderText={
            pairDisabled
              ? (inToken.placeholder ? `${inToken.symbol} launching soon` : `${outToken.symbol} launching soon`)
              : undefined
          }
        />

        {/* ── Rate + slippage ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 2px' }}>
          <span style={{ fontFamily: PRET, fontWeight: 500, fontSize: 11, color: T.textMid }}>
            {rateStr ?? <span style={{ visibility: 'hidden' }}>–</span>}
          </span>
          <button
            onClick={() => setShowSlip(s => !s)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: showSlip ? T.yellowSoft : 'transparent',
              border: `1.5px solid ${showSlip ? 'rgba(255,200,0,0.35)' : 'transparent'}`,
              borderRadius: 20, padding: '3px 9px 3px 7px',
              cursor: 'pointer', transition: 'all 0.15s',
              fontFamily: PRET, fontWeight: 500, fontSize: 11, color: showSlip ? T.sub2 : T.textMid,
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
                  flex: 1, padding: '8px 0',
                  background: slippage === s ? T.purple : '#fff',
                  border: `1.5px solid ${slippage === s ? T.purple : T.border}`,
                  borderRadius: 48.5,
                  fontFamily: KANIT, fontSize: 12, fontWeight: 700,
                  color: slippage === s ? '#fff' : T.textMid,
                  cursor: 'pointer', transition: 'all 0.15s',
                  boxShadow: slippage === s ? T.shadowBtnPurple : 'none',
                }}
              >{s}%</button>
            ))}
          </div>
        )}

        {/* Price impact */}
        {priceImpact > 1 && (
          <div style={{ background: T.coralSoft, border: '1px solid rgba(255,59,92,0.2)', borderRadius: 12, padding: '9px 14px' }}>
            <p style={{ fontFamily: PRET, fontWeight: 500, fontSize: 12, color: T.coral, margin: 0 }}>
              High price impact: {priceImpact.toFixed(2)}%
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: T.coralSoft, border: '1px solid rgba(255,59,92,0.2)', borderRadius: 12, padding: '9px 14px' }}>
            <p style={{ fontFamily: PRET, fontWeight: 500, fontSize: 12, color: T.coral, margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Success */}
        {txSig && (
          <div style={{
            background: 'rgba(0,197,102,0.08)', border: '1px solid rgba(0,197,102,0.25)',
            borderRadius: 12, padding: '10px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontFamily: PRET, fontWeight: 500, fontSize: 12, color: '#15803D' }}>Swap confirmed</span>
            <a
              href={`https://explorer.solana.com/tx/${txSig}`}
              target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: KANIT, fontSize: 11, fontWeight: 700, color: T.purple, textDecoration: 'none' }}
            >View ↗</a>
          </div>
        )}

        {/* ── Swap button ── */}
        <SwapBtn
          pairDisabled={pairDisabled}
          connected={connected}
          canSwap={!!quote && !swapping}
          loading={swapping || (fetching && !!inputAmt)}
          inToken={inToken}
          outToken={outToken}
          onSwap={handleSwap}
        />

        {/* Attribution */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 5, paddingBottom: 2 }}>
          <span style={{ fontFamily: PRET, fontWeight: 500, fontSize: 10, color: '#c8c8c8' }}>Powered by</span>
          <a href="https://jup.ag" target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: KANIT, fontSize: 10, fontWeight: 800, color: T.purple, textDecoration: 'none', letterSpacing: '-0.01em' }}>
            Jupiter
          </a>
        </div>

      </div>
    </div>
  )
}

// ─── Token row (shared for input + output) ────────────────────────────────────

function TokenRow({
  label, tokenKey, otherKey, onSelect,
  editable, value, onChange,
  outputHighlight, placeholderText,
}: {
  label:           string
  tokenKey:        TokenKey
  otherKey:        TokenKey
  onSelect:        (k: TokenKey) => void
  editable?:       boolean
  value:           string
  onChange?:       (v: string) => void
  outputHighlight?: boolean
  placeholderText?: string
}) {
  const token = TOKENS[tokenKey]

  return (
    <div style={{
      background: '#fff',
      border: `1.5px solid ${outputHighlight ? 'rgba(255,185,0,0.55)' : T.border}`,
      borderRadius: 18,
      padding: '14px 18px',
      boxShadow: outputHighlight
        ? '0 0 0 4px rgba(255,200,0,0.07), 0 1px 4px rgba(0,0,0,0.04)'
        : '0 1px 4px rgba(0,0,0,0.03)',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}>
      <p style={labelStyle}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
        <TokenSelector tokenKey={tokenKey} otherKey={otherKey} onSelect={onSelect} />

        {/* Amount */}
        {editable ? (
          <input
            className="swap-input"
            type="number" min="0" step="any"
            value={value}
            onChange={e => onChange?.(e.target.value)}
            placeholder="0"
            style={{
              flex: 1, textAlign: 'right',
              background: 'transparent', border: 'none', outline: 'none',
              fontFamily: KANIT, fontSize: 28, fontWeight: 700,
              color: value ? T.text : '#ddd',
              padding: 0, minWidth: 0, letterSpacing: '-0.025em',
            }}
          />
        ) : (
          <div style={{ flex: 1, textAlign: 'right' }}>
            {placeholderText ? (
              <span style={{ fontFamily: PRET, fontWeight: 500, fontSize: 12, color: T.textMid }}>{placeholderText}</span>
            ) : value === '…' ? (
              <span style={{ fontFamily: KANIT, fontSize: 26, fontWeight: 700, color: '#d0d0d0', letterSpacing: '-0.02em' }}>…</span>
            ) : value ? (
              <span style={{ fontFamily: KANIT, fontSize: 26, fontWeight: 700, color: T.text, letterSpacing: '-0.02em' }}>{value}</span>
            ) : (
              <span style={{ fontFamily: KANIT, fontSize: 26, fontWeight: 700, color: '#ddd', letterSpacing: '-0.02em' }}>0</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Token selector dropdown ──────────────────────────────────────────────────

function TokenSelector({ tokenKey, otherKey, onSelect }: {
  tokenKey: TokenKey
  otherKey: TokenKey
  onSelect: (k: TokenKey) => void
}) {
  const [open, setOpen] = useState(false)
  const token = TOKENS[tokenKey]

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: T.bg,
          border: `1.5px solid ${open ? T.borderDark : T.border}`,
          borderRadius: 48.5, padding: '6px 12px 6px 6px',
          cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s',
          boxShadow: open ? '0 1px 6px rgba(0,0,0,0.07)' : 'none',
        }}
      >
        <TokenLogo token={token} size={26} />
        <span style={{ fontFamily: KANIT, fontSize: 15, fontWeight: 700, color: T.text, letterSpacing: '-0.01em' }}>
          {token.symbol}
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 51,
            background: '#fff',
            border: `1.5px solid ${T.border}`,
            borderRadius: 14, boxShadow: T.shadowCard,
            overflow: 'hidden', minWidth: 150,
          }}>
            {ALL_KEYS.map(k => {
              const t = TOKENS[k]
              const isSelected = k === tokenKey
              const isOther    = k === otherKey
              return (
                <button
                  key={k}
                  onClick={() => { onSelect(k); setOpen(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '10px 14px',
                    background: isSelected ? T.yellowSoft : 'transparent',
                    border: 'none', textAlign: 'left',
                    cursor: 'pointer', transition: 'background 0.12s',
                    opacity: t.placeholder ? 0.5 : 1,
                  }}
                >
                  <TokenLogo token={t} size={24} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: KANIT, fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>
                      {t.symbol}
                      {t.placeholder && <span style={{ fontFamily: PRET, fontSize: 10, color: T.textMid, marginLeft: 5 }}>soon</span>}
                    </p>
                    <p style={{ fontFamily: PRET, fontWeight: 500, fontSize: 10, color: T.textMid, margin: 0 }}>{t.name}</p>
                  </div>
                  {isSelected && <CheckIcon />}
                  {isOther && !isSelected && (
                    <span style={{ fontFamily: PRET, fontSize: 9, color: T.textMid }}>↕ swap</span>
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

function SwapBtn({ pairDisabled, connected, canSwap, loading, inToken, outToken, onSwap }: {
  pairDisabled: boolean
  connected:    boolean
  canSwap:      boolean
  loading:      boolean
  inToken:      TokenConfig
  outToken:     TokenConfig
  onSwap:       () => void
}) {
  const [hov, setHov] = useState(false)

  if (pairDisabled) {
    const which = inToken.placeholder ? inToken.symbol : outToken.symbol
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '13px 20px', borderRadius: 48.5,
        background: T.yellowSoft, border: `1.5px solid rgba(255,200,0,0.35)`,
        fontFamily: KANIT, fontSize: 13, fontWeight: 700, color: T.sub2,
      }}>
        <img src="/images/hamster-flash-flex.png" alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />
        {which} launching soon
      </div>
    )
  }

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
      onClick={onSwap} disabled={disabled}
      onMouseEnter={() => { if (!disabled) setHov(true) }}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: '100%', padding: '15px 20px', borderRadius: 48.5,
        background: disabled ? T.bg : hov ? T.limeDark : T.yellow,
        border: disabled ? `1.5px solid ${T.border}` : 'none',
        fontFamily: KANIT, fontSize: 15, fontWeight: 800,
        letterSpacing: '-0.01em',
        color: disabled ? T.textMid : T.text,
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.15s',
        boxShadow: disabled ? 'none' : hov ? T.shadowBtnYellow : '0 4px 18px rgba(255,215,0,0.35)',
        opacity: disabled && !loading ? 0.45 : 1,
      }}
    >
      {loading ? <Spinner /> : <SwapIcon />}
      {loading ? 'Swapping…' : `Swap ${inToken.symbol} → ${outToken.symbol}`}
    </button>
  )
}

// ─── Token logo ───────────────────────────────────────────────────────────────

function TokenLogo({ token, size = 28 }: { token: TokenConfig; size?: number }) {
  const [failed, setFailed] = useState(false)

  if (token.logoUrl === null || (failed && token.logoUrl === null)) {
    return <HamstarLogo size={size} />
  }

  if (!failed) {
    return (
      <img
        src={token.logoUrl}
        alt={token.symbol}
        width={size} height={size}
        style={{ borderRadius: '50%', flexShrink: 0, display: 'block' }}
        onError={() => setFailed(true)}
      />
    )
  }

  if (token.symbol === 'SOL')  return <SolFallback  size={size} />
  if (token.symbol === 'USDC') return <UsdcFallback size={size} />
  return <HamstarLogo size={size} />
}

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
      <g fill="white" fillOpacity="0.92">
        <polygon points="8,10 22,10 24,8 10,8"/>
        <polygon points="8,17 22,17 24,15 10,15"/>
        <polygon points="10,24 24,24 22,22 8,22"/>
      </g>
    </svg>
  )
}

function UsdcFallback({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="16" cy="16" r="16" fill="#2775CA"/>
      <circle cx="16" cy="16" r="9" fill="none" stroke="white" strokeWidth="2.2"/>
      <line x1="16" y1="9" x2="16" y2="11.5" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="16" y1="20.5" x2="16" y2="23" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M19.5 13.5 C19.5 11.8 18 10.5 16 10.5 C14 10.5 12.5 11.8 12.5 13.5 C12.5 15.2 14 15.8 16 16.2 C18 16.6 19.5 17.2 19.5 19 C19.5 20.8 18 21.5 16 21.5 C14 21.5 12.5 20.2 12.5 18.5"
        stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

// ─── Shared icons ─────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontFamily: KANIT, fontSize: 9, fontWeight: 700,
  color: '#c8c8c8', textTransform: 'uppercase', letterSpacing: 1.2,
  margin: 0,
}

function ReverseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9"/>
      <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <polyline points="7 23 3 19 7 15"/>
      <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
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
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
      stroke={T.textMid} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}>
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
