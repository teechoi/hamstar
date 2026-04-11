'use client'
import { useState, useEffect } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import { useIsMobile } from '@/components/ui/index'
import { PublicKey } from '@solana/web3.js'
import { T } from '@/lib/theme'
import { getCheerHistory, type CheerEntry } from '@/lib/cheer-history'
import {
  getHamstarBalance, getFanTier, formatHamstar,
  HAMSTAR_SYMBOL,
} from '@/lib/hamstar-token'

const KANIT = "var(--font-kanit), sans-serif"
const PRET  = 'Pretendard, sans-serif'
const MONO  = 'monospace'

interface AccountModalProps {
  walletAddress?: string
  balance?: string
  onClose: () => void
  onDeposit: () => void
  onDisconnect: () => void
  onConnectWallet?: () => void
}

export function AccountModal({
  walletAddress, onClose, onDeposit, onDisconnect, onConnectWallet,
}: AccountModalProps) {
  const { connection } = useConnection()
  const [solBalance, setSolBalance]         = useState<number | null>(null)
  const [hamstarBalance, setHamstarBalance] = useState<number>(0)
  const [loadingBal, setLoadingBal]         = useState(false)
  const [copied, setCopied]                 = useState(false)
  const [history, setHistory]               = useState<CheerEntry[]>([])

  const hasWallet = !!walletAddress
  const short = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-6)}`
    : null

  useEffect(() => {
    if (!walletAddress) return
    setLoadingBal(true)
    Promise.all([
      connection.getBalance(new PublicKey(walletAddress)),
      getHamstarBalance(connection, walletAddress),
    ])
      .then(([lamports, hamstar]) => {
        setSolBalance(lamports / 1e9)
        setHamstarBalance(hamstar)
      })
      .catch(() => setSolBalance(null))
      .finally(() => setLoadingBal(false))
  }, [walletAddress, connection])

  useEffect(() => {
    if (!walletAddress) return
    setHistory(getCheerHistory(walletAddress))
  }, [walletAddress])

  const copyAddress = async () => {
    if (!walletAddress) return
    try {
      await navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* silent */ }
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
          background: '#fff',
          borderRadius: 28,
          width: '100%', maxWidth: 440,
          maxHeight: '96vh', overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1), 0 40px 80px rgba(77,67,83,0.18)',
        }}
      >
        {hasWallet
          ? <ConnectedView
              walletAddress={walletAddress!}
              short={short!}
              solBalance={solBalance}
              hamstarBalance={hamstarBalance}
              loadingBal={loadingBal}
              copied={copied}
              history={history}
              onCopy={copyAddress}
              onDeposit={onDeposit}
              onDisconnect={() => { onDisconnect(); onClose() }}
              onClose={onClose}
            />
          : <NoWalletView onConnect={() => { onConnectWallet?.(); onClose() }} onClose={onClose} />
        }
      </div>
    </div>
  )
}

// ─── Connected view ───────────────────────────────────────────────────────────

function ConnectedView({
  walletAddress, short, solBalance, hamstarBalance, loadingBal, copied, history,
  onCopy, onDeposit, onDisconnect, onClose,
}: {
  walletAddress: string
  short: string
  solBalance: number | null
  hamstarBalance: number
  loadingBal: boolean
  copied: boolean
  history: CheerEntry[]
  onCopy: () => void
  onDeposit: () => void
  onDisconnect: () => void
  onClose: () => void
}) {
  const isMobile = useIsMobile()
  const tier  = getFanTier(hamstarBalance)
  const wins  = history.filter(e => e.won === true).length
  const total = history.filter(e => e.won !== null).length

  return (
    <>
      {/* ── Yellow hero header ── */}
      <div style={{
        background: T.yellow,
        borderRadius: '28px 28px 0 0',
        padding: isMobile ? '16px 20px 0' : '22px 28px 0',
        position: 'relative', overflow: 'hidden',
      }}>
        <CloseBtnYellow onClick={onClose} />
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
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 14 }}>

            {/* Avatar — ring color driven by tier */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 62, height: 62, borderRadius: '50%',
                padding: 3, background: tier.ringGradient,
                boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
              }}>
                <div style={{
                  width: '100%', height: '100%', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #735DFF 0%, #AB9FF2 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 30,
                }}><img src="/images/hamster-flash-flex.png" alt="" style={{ width: '75%', height: '75%', objectFit: 'contain' }} /></div>
              </div>
              <div style={{
                position: 'absolute', bottom: 2, right: 2,
                width: 14, height: 14, borderRadius: '50%',
                background: T.win, border: `2.5px solid ${T.yellow}`,
              }} />
            </div>

            <div style={{ paddingBottom: 2 }}>
              {/* Fan tier badge — dynamic */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: tier.badgeBg, borderRadius: 6,
                padding: '2px 8px', marginBottom: 5,
              }}>
                <span style={{ fontFamily: KANIT, fontSize: 10, fontWeight: 700, color: tier.badgeColor, letterSpacing: 0.5 }}>
                  {tier.emoji} {tier.label.toUpperCase()}
                </span>
              </div>
              <p style={{ fontFamily: KANIT, fontSize: 22, fontWeight: 800, color: T.text, margin: 0, lineHeight: 1.1 }}>
                Hamstar Fan
              </p>
              <p style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(0,0,0,0.4)', margin: '4px 0 0' }}>
                {short}
              </p>
            </div>
          </div>

          {/* Stats strip: SOL · $HAMSTAR · Wins */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            borderTop: '1px solid rgba(0,0,0,0.08)',
          }}>
            {[
              { label: 'SOL',          value: loadingBal ? '…' : solBalance !== null ? `◎ ${solBalance.toFixed(3)}` : '—' },
              { label: HAMSTAR_SYMBOL, value: loadingBal ? '…' : formatHamstar(hamstarBalance) },
              { label: 'Wins',         value: total > 0 ? `${wins}/${total}` : '—' },
            ].map((s, i) => (
              <div key={s.label} style={{
                padding: '9px 0', textAlign: 'center',
                borderRight: i < 2 ? '1px solid rgba(0,0,0,0.08)' : 'none',
              }}>
                <p style={{ fontFamily: KANIT, fontSize: 15, fontWeight: 800, color: T.text, margin: 0 }}>{s.value}</p>
                <p style={{ fontFamily: PRET, fontSize: 10, color: 'rgba(0,0,0,0.4)', margin: '2px 0 0' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: isMobile ? '12px 16px 16px' : '14px 24px 20px' }}>

        {/* Wallet address card */}
        <div style={{
          background: T.bg, borderRadius: 16,
          border: `1px solid ${T.border}`,
          marginBottom: 10, overflow: 'hidden',
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: KANIT, fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 3px' }}>
              Wallet Address
            </p>
            <p style={{ fontFamily: MONO, fontSize: 11, color: T.text, margin: 0, wordBreak: 'break-all', lineHeight: 1.5 }}>
              {walletAddress}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
            <button
              onClick={onCopy}
              style={{
                background: copied ? T.winSoft : '#fff',
                border: `1.5px solid ${copied ? T.win : T.border}`,
                borderRadius: 10, padding: '7px 12px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5,
                transition: 'all 0.15s',
              }}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              <span style={{ fontFamily: KANIT, fontSize: 11, fontWeight: 700, color: copied ? T.win : T.textMid }}>
                {copied ? 'Copied!' : 'Copy'}
              </span>
            </button>
            <a
              href={`https://explorer.solana.com/address/${walletAddress}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                fontFamily: KANIT, fontSize: 11, fontWeight: 700, color: T.purple,
                textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                padding: '5px 12px', background: T.blueSoft, borderRadius: 8,
                cursor: 'pointer',
              }}
            >Explorer ↗</a>
          </div>
        </div>

        {/* Deposit SOL */}
        <DepositBtn onClick={onDeposit} />

        {/* Cheering history */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '12px 0 8px' }}>
          <p style={{ fontFamily: KANIT, fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
            Cheering History
          </p>
          {history.length > 0 && (
            <span style={{ fontFamily: KANIT, fontSize: 10, color: '#ccc' }}>
              {history.length} race{history.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {history.length === 0 ? (
          <div style={{
            background: 'rgba(255,231,144,0.1)',
            border: `1.5px dashed rgba(255,200,0,0.3)`,
            borderRadius: 16, padding: '16px 20px',
            textAlign: 'center', marginBottom: 12,
          }}>
            <img src="/images/hamster-flash-flex.png" alt="" style={{ width: 48, height: 48, objectFit: 'contain', marginBottom: 8 }} />
            <p style={{ fontFamily: KANIT, fontSize: 14, fontWeight: 700, color: T.text, margin: '0 0 3px' }}>
              No races cheered yet
            </p>
            <p style={{ fontFamily: PRET, fontSize: 12, color: T.textMid, margin: 0, lineHeight: 1.6 }}>
              Head to the Arena and cheer for your favourite hamster.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {history.map(entry => <CheerRow key={entry.round} entry={entry} />)}
          </div>
        )}

        <div style={{ height: 1, background: T.border, marginBottom: 10 }} />
        <DisconnectBtn onClick={onDisconnect} />
      </div>
    </>
  )
}

// ─── No wallet view ───────────────────────────────────────────────────────────

function NoWalletView({ onConnect, onClose }: { onConnect: () => void; onClose: () => void }) {
  return (
    <>
      <div style={{
        background: T.yellow, borderRadius: '28px 28px 0 0',
        padding: '40px 28px 36px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <CloseBtnYellow onClick={onClose} />
        <img
          src="/images/cheese-hideout.png" alt=""
          style={{
            position: 'absolute', bottom: -10, right: -14,
            width: 110, opacity: 0.28,
            transform: 'rotate(8deg)',
            pointerEvents: 'none', userSelect: 'none',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 70, height: 70, borderRadius: '50%',
            background: 'linear-gradient(135deg, #735DFF 0%, #AB9FF2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, margin: '0 auto 16px',
            boxShadow: '0 6px 20px rgba(115,93,255,0.3)',
          }}><img src="/images/hamster-flash-flex.png" alt="" style={{ width: '75%', height: '75%', objectFit: 'contain' }} /></div>
          <h2 style={{ fontFamily: KANIT, fontSize: 22, fontWeight: 800, color: T.text, margin: '0 0 8px' }}>
            No Wallet Connected
          </h2>
          <p style={{ fontFamily: PRET, fontSize: 13, color: 'rgba(0,0,0,0.5)', margin: 0, lineHeight: 1.6 }}>
            Connect a Solana wallet to cheer<br />for your favourite hamster.
          </p>
        </div>
      </div>
      <div style={{ padding: '24px 28px 28px' }}>
        <ConnectWalletBtn onClick={onConnect} />
      </div>
    </>
  )
}

// ─── Cheer row ────────────────────────────────────────────────────────────────

function CheerRow({ entry }: { entry: CheerEntry }) {
  const [hov, setHov] = useState(false)
  const dateStr = new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '11px 14px',
        background: hov ? 'rgba(255,231,144,0.1)' : T.bg,
        borderRadius: 14,
        border: `1px solid ${hov ? 'rgba(255,200,0,0.25)' : T.border}`,
        transition: 'all 0.15s',
      }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 11, flexShrink: 0,
        background: entry.petColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 19, boxShadow: `0 3px 10px ${entry.petColor}55`,
      }}>
        {entry.petEmoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: KANIT, fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>{entry.petName}</p>
        <p style={{ fontFamily: PRET, fontSize: 11, color: T.textMid, margin: '2px 0 0' }}>Round {entry.round} · {dateStr}</p>
      </div>
      <ResultBadge won={entry.won} />
    </div>
  )
}

function ResultBadge({ won }: { won: boolean | null }) {
  if (won === null) return (
    <span style={{ fontFamily: KANIT, fontSize: 10, fontWeight: 700, color: T.textMid, background: '#EFEFEF', padding: '4px 10px', borderRadius: 48.5 }}>Pending</span>
  )
  if (won) return (
    <span style={{ fontFamily: KANIT, fontSize: 10, fontWeight: 700, color: T.sub2, background: T.yellow, padding: '4px 10px', borderRadius: 48.5, display: 'flex', alignItems: 'center', gap: 4 }}>
      Won
    </span>
  )
  return (
    <span style={{ fontFamily: KANIT, fontSize: 10, fontWeight: 700, color: '#9A3412', background: 'rgba(239,68,68,0.1)', padding: '4px 10px', borderRadius: 48.5 }}>Lost</span>
  )
}

// ─── Close button ─────────────────────────────────────────────────────────────

function CloseBtnYellow({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'absolute', top: 12, right: 12, zIndex: 10,
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

// ─── Buttons ──────────────────────────────────────────────────────────────────

function DepositBtn({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: '100%', padding: '14px 20px', marginBottom: 10,
        background: hov ? T.limeDark : T.yellow,
        border: 'none', borderRadius: 48.5,
        fontFamily: KANIT, fontSize: 14, fontWeight: 700, color: T.text,
        cursor: 'pointer', transition: 'all 0.15s',
        boxShadow: hov ? '0 6px 20px rgba(255,215,0,0.4)' : '0 3px 12px rgba(255,215,0,0.2)',
      }}
    >
      <span style={{ fontSize: 15 }}>◎</span> Deposit SOL
    </button>
  )
}

function DisconnectBtn({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: '100%', padding: '12px 20px',
        background: hov ? 'rgba(255,59,92,0.05)' : '#fff',
        border: '1.5px solid rgba(255,59,92,0.2)', borderRadius: 48.5,
        fontFamily: KANIT, fontSize: 13, fontWeight: 600, color: T.coral,
        cursor: 'pointer', transition: 'all 0.15s',
      }}
    >
      <span style={{ fontSize: 14 }}>↩</span> Disconnect
    </button>
  )
}

function ConnectWalletBtn({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', padding: '15px 20px',
        background: hov ? '#222' : T.text,
        border: 'none', borderRadius: 48.5,
        fontFamily: KANIT, fontSize: 15, fontWeight: 700, color: T.yellow,
        cursor: 'pointer', transition: 'background 0.15s',
      }}
    >Connect Wallet</button>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.win} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
