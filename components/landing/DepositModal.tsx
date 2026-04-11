'use client'
import { useState } from 'react'
import { useIsMobile } from '@/components/ui/index'
import { T } from '@/lib/theme'
import { HAMSTAR_MINT } from '@/lib/hamstar-token'
import { LegalModal, LEGAL_LINKS, type LegalModalType } from './LegalModal'
import { SwapWidget } from './SwapWidget'

const KANIT = "var(--font-kanit), sans-serif"
const PRET  = 'Pretendard, sans-serif'
const MONO  = 'monospace'

interface DepositModalProps {
  address?: string          // kept for callers — no longer used
  onClose: () => void
  onConnectWallet?: () => void  // kept for callers — no longer used
}

export function DepositModal({ onClose }: DepositModalProps) {
  const isMobile = useIsMobile()
  const [legalModal, setLegalModal] = useState<LegalModalType | null>(null)
  const [copiedMint, setCopiedMint] = useState(false)

  const copyMint = async () => {
    try {
      await navigator.clipboard.writeText(HAMSTAR_MINT)
      setCopiedMint(true)
      setTimeout(() => setCopiedMint(false), 2000)
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
                ◎ SOLANA MAINNET
              </span>
            </div>
            <h2 style={{ fontFamily: KANIT, fontSize: 22, fontWeight: 800, color: T.text, margin: '0 0 4px', letterSpacing: '-0.025em' }}>
              Get $HAMSTAR
            </h2>
            <p style={{ fontFamily: PRET, fontWeight: 500, fontSize: 13, color: 'rgba(0,0,0,0.5)', margin: 0 }}>
              Swap SOL or USDC for HAMSTAR to start cheering.
            </p>
          </div>
        </div>

        {/* ── Swap widget ── */}
        <div style={{ padding: isMobile ? '16px 20px 8px' : '20px 28px 12px' }}>
          <SwapWidget />

          {/* Contract address */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 16, padding: '11px 16px',
            background: T.bg, border: `1.5px solid ${T.border}`,
            borderRadius: 14,
          }}>
            <div style={{ minWidth: 0, flex: 1, marginRight: 10 }}>
              <p style={{ fontFamily: KANIT, fontSize: 9, fontWeight: 700, color: '#c8c8c8', textTransform: 'uppercase', letterSpacing: 1.2, margin: '0 0 3px' }}>
                Contract
              </p>
              <p style={{ fontFamily: HAMSTAR_MINT.includes('xxx') ? PRET : MONO, fontWeight: HAMSTAR_MINT.includes('xxx') ? 500 : 400, fontSize: 11, color: HAMSTAR_MINT.includes('xxx') ? T.textMid : T.text, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {HAMSTAR_MINT.includes('xxx') ? 'Launching soon' : HAMSTAR_MINT}
              </p>
            </div>
            {!HAMSTAR_MINT.includes('xxx') && (
              <button
                onClick={copyMint}
                style={{
                  flexShrink: 0,
                  background: copiedMint ? 'rgba(34,197,94,0.08)' : '#fff',
                  border: `1.5px solid ${copiedMint ? 'rgba(34,197,94,0.25)' : T.border}`,
                  borderRadius: 8, padding: '5px 10px',
                  fontFamily: KANIT, fontSize: 11, fontWeight: 700,
                  color: copiedMint ? '#15803D' : T.textMid,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {copiedMint ? '✓ Copied' : 'Copy'}
              </button>
            )}
          </div>
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

// ─── Close button ─────────────────────────────────────────────────────────────

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
