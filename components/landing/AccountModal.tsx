'use client'
import { useState } from 'react'

const YELLOW = '#FFE790'
const DARK = '#000000'
const KANIT = "var(--font-kanit), sans-serif"

interface AccountModalProps {
  walletAddress?: string
  balance?: string
  onClose: () => void
  onDeposit: () => void
  onDisconnect: () => void
  onConnectWallet?: () => void
}

export function AccountModal({
  walletAddress,
  balance,
  onClose,
  onDeposit,
  onDisconnect,
  onConnectWallet,
}: AccountModalProps) {
  const hasWallet = !!walletAddress
  const shortAddr = hasWallet
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-6)}`
    : null

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
          width: '100%', maxWidth: 400,
          padding: '36px 36px 28px',
          fontFamily: KANIT, position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 18,
          background: 'none', border: 'none',
          fontSize: 22, cursor: 'pointer', color: '#aaa', lineHeight: 1,
        }}>×</button>

        {/* Avatar */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: '#735DFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, margin: '0 auto 16px',
        }}>
          🐹
        </div>

        <h2 style={{ fontSize: 'clamp(16px, 3.5vw, 20px)', fontWeight: 600, color: DARK, textAlign: 'center', marginBottom: 4 }}>
          My Account
        </h2>

        {/* Wallet status */}
        {hasWallet ? (
          <div style={{
            background: '#f7f7f7', borderRadius: 12,
            padding: '12px 16px', margin: '16px 0',
          }}>
            <p style={{ fontSize: 11, color: '#aaa', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
              Wallet
            </p>
            <p style={{ fontSize: 13, fontFamily: 'monospace', color: DARK, wordBreak: 'break-all' }}>
              {shortAddr}
            </p>
            {balance && balance !== '0' && (
              <>
                <div style={{ height: 1, background: '#eee', margin: '10px 0' }} />
                <p style={{ fontSize: 11, color: '#aaa', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Balance
                </p>
                <p style={{ fontSize: 16, fontWeight: 600, color: DARK }}>{balance} USDT</p>
              </>
            )}
          </div>
        ) : (
          <div style={{
            background: '#F8F9FA', border: '1px dashed rgba(115,93,255,0.3)',
            borderRadius: 12, padding: '16px', margin: '16px 0',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 13, color: '#aaa', marginBottom: 12 }}>
              No wallet connected
            </p>
            <ConnectWalletBtn onClick={() => { onConnectWallet?.(); onClose() }} />
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          {hasWallet && (
            <ActionBtn
              label="Deposit Funds"
              icon="◎"
              bg={YELLOW}
              color={DARK}
              onClick={() => { onDeposit(); onClose() }}
            />
          )}
          <ActionBtn
            label="Disconnect"
            icon="↩"
            bg="#fff"
            color="#FF3B5C"
            border="1px solid rgba(255,59,92,0.2)"
            onClick={() => { onDisconnect(); onClose() }}
          />
        </div>
      </div>
    </div>
  )
}

function ActionBtn({
  label, icon, bg, color, border, onClick,
}: {
  label: string; icon: string; bg: string; color: string; border?: string; onClick: () => void
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: '13px 18px',
        background: bg, border: border ?? 'none',
        borderRadius: 48.5, fontSize: 14, fontWeight: 500,
        color, cursor: 'pointer', fontFamily: KANIT,
        opacity: hov ? 0.8 : 1, transition: 'opacity 0.15s',
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      {label}
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
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, width: '100%', padding: '11px 16px',
        background: '#735DFF',
        border: 'none', borderRadius: 48.5,
        fontSize: 13, fontWeight: 600, color: '#fff',
        cursor: 'pointer', fontFamily: KANIT,
        opacity: hov ? 0.85 : 1, transition: 'opacity 0.15s',
      }}
    >
      Connect Phantom Wallet
    </button>
  )
}
