'use client'
import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useIsMobile } from '@/components/ui/index'
import { T } from '@/lib/theme'
import { HAMSTAR_SYMBOL, HAMSTAR_MINT, HAMSTAR_JUPITER_URL } from '@/lib/hamstar-token'
import { LegalModal, LEGAL_LINKS, type LegalModalType } from './LegalModal'

const KANIT = "var(--font-kanit), sans-serif"
const PRET  = 'Pretendard, sans-serif'
const MONO  = 'monospace'

interface DepositModalProps {
  address?: string
  onClose: () => void
  onConnectWallet?: () => void
}

export function DepositModal({ address = '', onClose, onConnectWallet }: DepositModalProps) {
  const isMobile = useIsMobile()
  const [copied, setCopied]         = useState(false)
  const [tab, setTab]               = useState<'sol' | 'hamstar'>('sol')
  const [legalModal, setLegalModal] = useState<LegalModalType | null>(null)
  const hasAddress = address.length > 0

  const copyAddress = async () => {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
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
          background: '#fff', borderRadius: 28,
          width: '100%', maxWidth: 440,
          position: 'relative',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1), 0 40px 80px rgba(77,67,83,0.18)',
          overflow: 'hidden',
        }}
      >
        {/* ── Yellow header ── */}
        <div style={{
          background: T.yellow,
          borderRadius: '28px 28px 0 0',
          padding: isMobile ? '16px 16px 14px' : '22px 22px 20px',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Cheese decoration */}
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
          <CloseBtn onClick={onClose} onYellow />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'rgba(0,0,0,0.08)', borderRadius: 6,
              padding: '3px 10px', marginBottom: 8,
            }}>
              <span style={{ fontFamily: KANIT, fontSize: 11, fontWeight: 700, color: T.sub2, letterSpacing: 0.5 }}>
                ◎ SOLANA MAINNET
              </span>
            </div>
            <h2 style={{ fontFamily: KANIT, fontSize: 22, fontWeight: 800, color: T.text, margin: '0 0 4px', letterSpacing: '-0.025em' }}>
              Deposit Funds
            </h2>
            <p style={{ fontFamily: PRET, fontSize: 13, color: 'rgba(0,0,0,0.5)', margin: 0 }}>
              {hasAddress
                ? 'Scan the QR code or copy your wallet address.'
                : 'Connect a wallet to get your deposit address.'}
            </p>
          </div>
        </div>

        {/* ── Tabs ── */}
        {hasAddress && (
          <div style={{
            display: 'flex',
            borderBottom: `1px solid ${T.border}`,
            background: '#fff',
          }}>
            {([['sol', '◎ Deposit SOL'], ['hamstar', `🪐 Get ${HAMSTAR_SYMBOL}`]] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  flex: 1, padding: '13px 12px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: tab === id ? `2.5px solid ${T.text}` : '2.5px solid transparent',
                  fontFamily: KANIT, fontSize: 13, fontWeight: 700,
                  color: tab === id ? T.text : T.textMid,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >{label}</button>
            ))}
          </div>
        )}

        {/* ── Body ── */}
        <div>
          {!hasAddress
            ? <NoWalletDeposit onConnect={onConnectWallet ?? onClose} />
            : tab === 'sol'
              ? <ConnectedDeposit address={address} copied={copied} onCopy={copyAddress} />
              : <GetHamstarTab />
          }
        </div>

        {/* ── Footer — legal links ── */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '4px 0', padding: '0 28px 20px' }}>
          {LEGAL_LINKS.filter(l => l.type !== 'welfare').map(({ type, label }, i, arr) => (
            <span key={type} style={{ display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => setLegalModal(type)}
                style={{ fontFamily: PRET, fontWeight: 500, fontSize: 12, color: '#B0B0B0', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >{label}</button>
              {i < arr.length - 1 && <span style={{ margin: '0 10px', color: '#E0E0E0', fontSize: 12 }}>·</span>}
            </span>
          ))}
        </div>
      </div>
      {legalModal && <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />}
    </div>
  )
}

// ─── SOL deposit tab ──────────────────────────────────────────────────────────

function ConnectedDeposit({ address, copied, onCopy }: { address: string; copied: boolean; onCopy: () => void }) {
  const isMobile = useIsMobile()

  return (
    <div style={{ padding: isMobile ? '16px 20px 4px' : '24px 28px 8px' }}>
      {/* QR card */}
      <div style={{
        background: T.bg,
        border: `1.5px solid ${T.border}`,
        borderRadius: 20,
        padding: isMobile ? '14px' : '20px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        marginBottom: 14,
        gap: isMobile ? 12 : 16,
      }}>
        {/* QR with yellow frame */}
        <div style={{
          padding: isMobile ? 8 : 12, borderRadius: 12,
          background: '#fff',
          boxShadow: `0 0 0 4px ${T.yellow}`,
        }}>
          <QRCodeSVG value={address} size={isMobile ? 120 : 148} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: KANIT, fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px' }}>
            Your Deposit Address
          </p>
          <p style={{ fontFamily: MONO, fontSize: 11, color: T.text, margin: 0, wordBreak: 'break-all', lineHeight: 1.6 }}>
            {address}
          </p>
        </div>
      </div>

      {/* Copy button */}
      <CopyBtn copied={copied} onClick={onCopy} />

      {/* SOL-only notice */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 8,
        background: T.yellowSoft,
        border: `1px solid rgba(255,200,0,0.2)`,
        borderRadius: 12, padding: '10px 14px',
        margin: '12px 0 8px',
      }}>
        <span style={{ fontSize: 14, flexShrink: 0 }}>◎</span>
        <p style={{ fontFamily: PRET, fontSize: 12, color: T.sub2, margin: 0, lineHeight: 1.5 }}>
          Send only <strong>SOL</strong> to this address on Solana mainnet. Other tokens may be lost.
        </p>
      </div>
    </div>
  )
}

// ─── No wallet connected ──────────────────────────────────────────────────────

function NoWalletDeposit({ onConnect }: { onConnect: () => void }) {
  return (
    <div style={{ padding: '32px 28px 16px', textAlign: 'center' }}>
      <div style={{
        width: 76, height: 76, borderRadius: '50%',
        background: 'linear-gradient(135deg, #735DFF 0%, #AB9FF2 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px',
        boxShadow: '0 6px 20px rgba(115,93,255,0.3)',
      }}>
        <img src="/images/hamster-flash-flex.png" alt="" style={{ width: '60%', height: '60%', objectFit: 'contain' }} />
      </div>
      <p style={{ fontFamily: PRET, fontSize: 14, color: T.textMid, marginBottom: 24, lineHeight: 1.6 }}>
        Connect your Solana wallet to get<br />your personal deposit address.
      </p>
      <ConnectBtn onClick={onConnect} />
    </div>
  )
}

// ─── Get $HAMSTAR tab ─────────────────────────────────────────────────────────

function GetHamstarTab() {
  const [copiedMint, setCopiedMint] = useState(false)
  const [hovSwap, setHovSwap]       = useState(false)

  const copyMint = async () => {
    try {
      await navigator.clipboard.writeText(HAMSTAR_MINT)
      setCopiedMint(true)
      setTimeout(() => setCopiedMint(false), 2000)
    } catch { /* silent */ }
  }

  return (
    <div style={{ padding: '20px 20px 8px' }}>
      {/* Token hero card */}
      <div style={{
        background: T.yellowSoft,
        border: '1.5px solid rgba(255,200,0,0.3)',
        borderRadius: 18, padding: '16px 18px',
        marginBottom: 14,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 46, height: 46, borderRadius: 13, flexShrink: 0,
          background: T.yellow,
          border: '1.5px solid rgba(255,200,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img src="/images/hamster-flash-flex.png" alt="" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
        </div>
        <div>
          <p style={{ fontFamily: KANIT, fontSize: 11, color: T.textMid, margin: '0 0 2px', letterSpacing: 0.5 }}>
            HAMSTAR TOKEN
          </p>
          <p style={{ fontFamily: KANIT, fontSize: 20, fontWeight: 800, color: T.text, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            {HAMSTAR_SYMBOL}
          </p>
          <p style={{ fontFamily: PRET, fontSize: 12, color: T.textMid, margin: 0, lineHeight: 1.4 }}>
            Hold {HAMSTAR_SYMBOL} to unlock fan tiers and rewards.
          </p>
        </div>
      </div>

      {/* Token mint address */}
      <div style={{
        background: T.bg, border: `1px solid ${T.border}`,
        borderRadius: 14, overflow: 'hidden', marginBottom: 14,
      }}>
        <div style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>
          <p style={{ fontFamily: KANIT, fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 4px' }}>
            Token Contract
          </p>
          <p style={{ fontFamily: MONO, fontSize: 11, color: T.text, margin: 0, wordBreak: 'break-all', lineHeight: 1.5 }}>
            {HAMSTAR_MINT.includes('xxx') ? 'Coming soon — token launching shortly' : HAMSTAR_MINT}
          </p>
        </div>
        {!HAMSTAR_MINT.includes('xxx') && (
          <button
            onClick={copyMint}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              width: '100%', padding: '10px',
              background: copiedMint ? 'rgba(34,197,94,0.06)' : '#fff',
              border: 'none', cursor: 'pointer',
              fontFamily: KANIT, fontSize: 12, fontWeight: 700,
              color: copiedMint ? '#15803D' : T.textMid,
              transition: 'all 0.15s',
            }}
          >
            {copiedMint ? '✓ Copied!' : 'Copy contract address'}
          </button>
        )}
      </div>

      {/* Jupiter swap CTA — opens Jupiter directly in a new tab */}
      <a
        href={HAMSTAR_JUPITER_URL}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHovSwap(true)}
        onMouseLeave={() => setHovSwap(false)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', padding: '14px 20px',
          background: hovSwap ? T.limeDark : T.yellow,
          border: 'none', borderRadius: 48.5,
          fontFamily: KANIT, fontSize: 14, fontWeight: 700, color: T.text,
          textDecoration: 'none', transition: 'all 0.15s',
          boxShadow: hovSwap ? T.shadowBtnYellow : '0 4px 14px rgba(255,215,0,0.3)',
          marginBottom: 10,
        }}
      >
        🪐 Swap on Jupiter ↗
      </a>
    </div>
  )
}

// ─── Shared buttons ───────────────────────────────────────────────────────────

function CopyBtn({ copied, onClick }: { copied: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: '100%', padding: '14px 20px',
        background: copied ? 'rgba(34,197,94,0.08)' : hov ? T.limeDark : T.yellow,
        border: copied ? '1.5px solid rgba(34,197,94,0.25)' : 'none',
        borderRadius: 48.5,
        fontFamily: KANIT, fontSize: 14, fontWeight: 700,
        color: copied ? '#15803D' : T.text,
        cursor: 'pointer', transition: 'all 0.2s',
        boxShadow: copied ? 'none' : hov ? T.shadowBtnYellow : '0 3px 12px rgba(255,215,0,0.25)',
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? 'Address Copied!' : 'Copy Address'}
    </button>
  )
}

function ConnectBtn({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: '100%', padding: '14px 20px',
        background: T.text, border: 'none', borderRadius: 48.5,
        fontFamily: KANIT, fontSize: 14, fontWeight: 700, color: T.yellow,
        cursor: 'pointer', opacity: hov ? 0.85 : 1, transition: 'opacity 0.15s',
      }}
    >
      Connect Wallet
    </button>
  )
}

function CloseBtn({ onClick, onYellow }: { onClick: () => void; onYellow?: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'absolute', top: 12, right: 12, zIndex: 2,
        background: onYellow
          ? hov ? 'rgba(0,0,0,0.14)' : 'rgba(0,0,0,0.08)'
          : hov ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.04)',
        border: 'none', borderRadius: 8,
        width: 30, height: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: onYellow ? T.sub2 : T.textMid,
        fontSize: 18, lineHeight: 1, cursor: 'pointer',
        transition: 'background 0.15s',
      }}
    >×</button>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
