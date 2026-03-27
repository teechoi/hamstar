'use client'
import { useState } from 'react'

const YELLOW = '#FFE790'
const DARK = '#0D0D14'
const KANIT = "var(--font-kanit), sans-serif"
const PURPLE = '#735DFF'

interface DepositModalProps {
  address?: string
  onClose: () => void
  onConnectWallet?: () => void
}

export function DepositModal({ address = '', onClose, onConnectWallet }: DepositModalProps) {
  const [copied, setCopied] = useState(false)
  const hasAddress = address.length > 0

  const copyAddress = async () => {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* silent */ }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(15px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: 26,
          width: '100%', maxWidth: 480,
          padding: '36px 40px 32px',
          fontFamily: KANIT, position: 'relative',
          textAlign: 'center',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 18,
          background: 'none', border: 'none',
          fontSize: 22, cursor: 'pointer', color: '#aaa',
          lineHeight: 1,
        }}>×</button>

        <h2 style={{ fontSize: 24, fontWeight: 600, color: DARK, marginBottom: 6 }}>
          Deposit Funds
        </h2>
        <p style={{ fontSize: 14, color: '#8A8A8A', fontFamily: 'Pretendard, sans-serif', marginBottom: 28 }}>
          Solana Chain
        </p>

        {hasAddress ? (
          /* ── Connected: show QR + address ── */
          <>
            <div style={{
              width: 180, height: 180,
              background: '#f7f7f7', borderRadius: 16,
              margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(77,67,83,0.06)',
            }}>
              <span style={{ fontSize: 11, color: '#bbb', lineHeight: 1.5, padding: '0 16px' }}>
                QR code<br />will appear here
              </span>
            </div>

            <p style={{ fontSize: 13, color: '#727272', marginBottom: 8 }}>
              Your deposit address
            </p>

            <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 28 }}>
              <div style={{
                background: 'rgba(255,231,144,0.18)', padding: '12px 20px',
                fontSize: 12, fontFamily: 'monospace', color: DARK,
                wordBreak: 'break-all',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '11px 11px 0 0',
              }}>
                {address}
              </div>
              <CopyButton copied={copied} onClick={copyAddress} />
            </div>
          </>
        ) : (
          /* ── Not connected: prompt wallet connection ── */
          <>
            <div style={{
              width: 180, height: 180,
              background: '#f7f7f7', borderRadius: 16,
              margin: '0 auto 24px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 4px 20px rgba(77,67,83,0.06)',
            }}>
              {/* Phantom ghost icon */}
              <svg width="48" height="48" viewBox="0 0 128 128" fill="none">
                <path d="M110.584 64.9142H99.142C99.142 41.7651 80.173 23 56.7724 23C33.6612 23 14.8716 41.3491 14.4308 64.1671C13.9728 87.8985 33.3299 108 57.151 108H60.6151C82.1958 108 110.584 89.2057 110.584 64.9142Z" fill="#AB9FF2" />
                <ellipse cx="77" cy="63" rx="7" ry="7" fill="white" />
                <ellipse cx="95" cy="63" rx="7" ry="7" fill="white" />
                <ellipse cx="77" cy="63" rx="3.5" ry="3.5" fill="#AB9FF2" />
                <ellipse cx="95" cy="63" rx="3.5" ry="3.5" fill="#AB9FF2" />
              </svg>
              <span style={{ fontSize: 12, color: '#aaa', fontFamily: KANIT }}>No wallet connected</span>
            </div>

            <p style={{ fontSize: 14, color: '#8A8A8A', fontFamily: 'Pretendard, sans-serif', marginBottom: 20, lineHeight: 1.5 }}>
              Connect your Phantom wallet to get<br />your personal deposit address.
            </p>

            <ConnectButton onClick={onConnectWallet ?? onClose} />

            <p style={{ fontSize: 12, color: '#bbb', marginTop: 14, marginBottom: 20 }}>
              Send only <strong style={{ color: '#888' }}>SOL</strong> to this address on Solana mainnet.
            </p>
          </>
        )}

        {/* Footer links */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
          {['Terms of Use', 'Risk Disclosure', 'Privacy Policy'].map(link => (
            <a key={link} href="#" style={{ fontSize: 12, color: '#bbb', textDecoration: 'none', fontFamily: KANIT }}>
              {link}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function CopyButton({ copied, onClick }: { copied: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'block', width: '100%', padding: '15px',
        background: YELLOW, border: 'none',
        borderRadius: '0 0 16px 16px',
        fontSize: 15, fontWeight: 600, color: DARK,
        cursor: 'pointer', fontFamily: KANIT,
        opacity: hov ? 0.85 : 1, transition: 'opacity 0.15s',
      }}
    >
      {copied ? '✓ Copied!' : 'Copy address'}
    </button>
  )
}

function ConnectButton({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, width: '100%', padding: '14px 20px',
        background: '#735DFF',
        border: 'none', borderRadius: 48.5,
        fontSize: 15, fontWeight: 600, color: '#fff',
        cursor: 'pointer', fontFamily: KANIT,
        opacity: hov ? 0.85 : 1, transition: 'opacity 0.15s',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 128 128" fill="none">
        <path d="M110.584 64.9142H99.142C99.142 41.7651 80.173 23 56.7724 23C33.6612 23 14.8716 41.3491 14.4308 64.1671C13.9728 87.8985 33.3299 108 57.151 108H60.6151C82.1958 108 110.584 89.2057 110.584 64.9142Z" fill="white" />
        <ellipse cx="77" cy="63" rx="7" ry="7" fill="#AB9FF2" />
        <ellipse cx="95" cy="63" rx="7" ry="7" fill="#AB9FF2" />
      </svg>
      Connect Phantom Wallet
    </button>
  )
}
