'use client'
import { useState, useEffect, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletReadyState } from '@solana/wallet-adapter-base'
import { useIsMobile } from '@/components/ui/index'
import { T } from '@/lib/theme'

const KANIT = "var(--font-kanit), sans-serif"
const PRET  = 'Pretendard, sans-serif'

interface LoginModalProps {
  onClose: () => void
  loginTitle?: string
  loginSubtitle?: string
}

export function LoginModal({ onClose, loginTitle, loginSubtitle }: LoginModalProps) {
  const isMobile = useIsMobile()
  const { wallets, select, connect, connecting, connected, wallet } = useWallet()
  const [connectingName, setConnectingName] = useState<string | null>(null)
  const [err, setErr] = useState('')

  // Stable ref so effects always call the latest onClose
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  // Only close when we NEWLY connect — ignore if already connected when modal opens
  const alreadyConnected = useRef(connected)
  useEffect(() => {
    if (connected && !alreadyConnected.current) onCloseRef.current()
  }, [connected])

  // Reset spinner if wallet popup was dismissed without connecting
  useEffect(() => {
    if (!connecting && connectingName && !connected) {
      setConnectingName(null)
    }
  }, [connecting]) // eslint-disable-line react-hooks/exhaustive-deps

  // Deduplicate by name — some wallets (e.g. MetaMask) register via both
  // Wallet Standard and the legacy injected provider, showing up twice.
  const seen = new Set<string>()
  const uniqueWallets = wallets.filter(w => {
    if (seen.has(w.adapter.name)) return false
    seen.add(w.adapter.name)
    return true
  })

  const detected = uniqueWallets.filter(
    w => w.readyState === WalletReadyState.Installed || w.readyState === WalletReadyState.Loadable
  )
  const getable = uniqueWallets.filter(w => w.readyState === WalletReadyState.NotDetected)

  const handleSelect = (name: string) => {
    setErr('')
    setConnectingName(name)

    const found = uniqueWallets.find(w => w.adapter.name === name)
    if (!found) { setConnectingName(null); return }

    try {
      if (wallet?.adapter.name === name) {
        // Already selected — connect() works directly here (synchronous user gesture)
        connect().catch((e: any) => {
          setConnectingName(null)
          setErr(e?.message ?? 'Could not connect. Please try again.')
        })
      } else {
        // Switch wallet then connect the adapter directly — MUST stay in this
        // synchronous click handler so the browser allows the wallet popup.
        // Calling connect() inside a useEffect delays it past the user gesture
        // boundary and causes browsers to silently block the popup.
        select(name as any)
        found.adapter.connect().catch((e: any) => {
          setConnectingName(null)
          setErr(e?.message ?? 'Could not connect. Please try again.')
        })
      }
    } catch (e: any) {
      setConnectingName(null)
      setErr(e?.message ?? 'Could not open wallet. Please try again.')
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.7)',
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
          width: '100%',
          maxWidth: 460,
          maxHeight: isMobile ? '96vh' : '92vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
        }}
      >
        {/* ── Header ── */}
        <div style={{ padding: isMobile ? '24px 20px 16px' : '36px 32px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: isMobile ? 14 : 20 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, flexShrink: 0,
              background: T.yellow,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26,
              boxShadow: '0 4px 14px rgba(255,215,0,0.3)',
            }}>
              🐹
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <h2 style={{ fontFamily: KANIT, fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 800, color: T.text, margin: 0 }}>
                  {loginTitle ?? 'Connect Wallet'}
                </h2>
                <span style={{
                  fontFamily: KANIT, fontSize: 10, fontWeight: 700,
                  color: T.purple, background: 'rgba(115,93,255,0.1)',
                  padding: '2px 8px', borderRadius: 6, letterSpacing: 0.5,
                }}>HAMSTAR</span>
              </div>
              <p style={{ fontFamily: PRET, fontSize: 13, color: T.textMid, margin: 0 }}>
                {loginSubtitle ?? 'Connect your wallet to join the race.'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: isMobile ? '0 20px 24px' : '0 32px 28px' }}>

          {/* Error */}
          {err && (
            <div style={{
              background: '#FFF0F3', border: '1px solid rgba(255,59,92,0.2)',
              borderRadius: 12, padding: '10px 16px', marginBottom: 16,
              fontSize: 13, color: '#FF3B5C', fontFamily: PRET,
            }}>
              {err}
            </div>
          )}

          {/* Detected wallets */}
          {detected.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionLabel text="Available Wallets" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {detected.map(w => (
                  <WalletRow
                    key={w.adapter.name}
                    name={w.adapter.name}
                    icon={w.adapter.icon}
                    loading={connecting && connectingName === w.adapter.name}
                    onClick={() => handleSelect(w.adapter.name)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No wallets nudge */}
          {detected.length === 0 && (
            <div style={{
              background: 'rgba(255,231,144,0.12)',
              border: `1.5px dashed rgba(255,231,144,0.4)`,
              borderRadius: 16, padding: '16px 20px', marginBottom: 20,
              textAlign: 'center',
            }}>
              <p style={{ fontFamily: KANIT, fontSize: 13, fontWeight: 600, color: '#8A6A00', margin: '0 0 2px' }}>
                No wallets detected
              </p>
              <p style={{ fontFamily: PRET, fontSize: 12, color: T.textMid, lineHeight: 1.6, margin: 0 }}>
                Install one below — takes about 2 minutes.
              </p>
            </div>
          )}

          {/* Getable wallets grid */}
          {getable.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionLabel text={detected.length > 0 ? 'More Wallets' : 'Get a Wallet'} />
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8 }}>
                {getable.slice(0, 6).map(w => (
                  <WalletGetCard key={w.adapter.name} name={w.adapter.name} icon={w.adapter.icon} url={w.adapter.url} />
                ))}
              </div>
            </div>
          )}

          {/* Fallback curated list when no wallets detected and none getable */}
          {detected.length === 0 && getable.length === 0 && <GetStartedList />}

          {/* Footer links */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8 }}>
            {['Terms of Use', 'Privacy Policy'].map(link => (
              <a key={link} href="#" style={{ fontSize: 11, color: '#ccc', fontFamily: KANIT, textDecoration: 'none' }}>
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Wallet list items ─────────────────────────────────────────────────────────

function WalletRow({ name, icon, loading, onClick }: {
  name: string; icon: string; loading?: boolean; onClick: () => void
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '13px 16px',
        background: hov ? 'rgba(255,231,144,0.12)' : '#fff',
        border: `1.5px solid ${hov ? 'rgba(255,231,144,0.5)' : T.border}`,
        borderRadius: 16,
        cursor: loading ? 'wait' : 'pointer',
        transition: 'all 0.15s',
        width: '100%', textAlign: 'left',
      }}
    >
      <img src={icon} alt={name} width={36} height={36} style={{ borderRadius: 10, flexShrink: 0 }} />
      <span style={{ fontFamily: KANIT, fontSize: 15, fontWeight: 600, color: T.text, flex: 1 }}>
        {name}
      </span>
      {loading ? <Spinner /> : (
        <span style={{
          fontSize: 12, fontFamily: KANIT, fontWeight: 700,
          color: T.sub2,
          background: T.yellow,
          padding: '5px 14px', borderRadius: 48.5,
          display: 'flex', alignItems: 'center', gap: 5,
          flexShrink: 0,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
          Connect
        </span>
      )}
    </button>
  )
}

function WalletGetCard({ name, icon, url }: { name: string; icon: string; url: string }) {
  const [hov, setHov] = useState(false)
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '11px 14px',
        background: hov ? T.bg : '#fff',
        border: `1.5px solid ${hov ? T.borderDark : T.border}`,
        borderRadius: 14,
        textDecoration: 'none',
        transition: 'all 0.15s',
      }}
    >
      <img src={icon} alt={name} width={28} height={28} style={{ borderRadius: 8, flexShrink: 0 }} />
      <span style={{ fontFamily: KANIT, fontSize: 13, fontWeight: 500, color: T.text, flex: 1, lineHeight: 1.2 }}>
        {name}
      </span>
      <span style={{ fontSize: 12, color: '#ccc' }}>↗</span>
    </a>
  )
}

function GetStartedList() {
  return (
    <div style={{ marginBottom: 4 }}>
      <SectionLabel text="Get started free" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { name: 'Phantom',  url: 'https://phantom.com/download', accent: '#AB9FF2', desc: 'Most popular · Desktop + Mobile' },
          { name: 'Backpack', url: 'https://backpack.app',          accent: '#E33E3F', desc: 'By Coral · Desktop + Mobile' },
          { name: 'Solflare', url: 'https://solflare.com/download', accent: '#FC6A14', desc: 'Official Solana wallet' },
        ].map(w => (
          <a
            key={w.name}
            href={w.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '13px 16px',
              background: T.bg,
              borderRadius: 14,
              border: `1px solid ${T.border}`,
              textDecoration: 'none',
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: w.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: KANIT, fontSize: 15, fontWeight: 700, color: '#fff',
              flexShrink: 0,
            }}>
              {w.name[0]}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: KANIT, fontSize: 14, fontWeight: 600, color: T.text, margin: 0 }}>{w.name}</p>
              <p style={{ fontFamily: PRET, fontSize: 12, color: '#bbb', margin: '2px 0 0' }}>{w.desc}</p>
            </div>
            <span style={{ fontSize: 12, color: '#ccc' }}>↗</span>
          </a>
        ))}
      </div>
    </div>
  )
}

// ─── Shared primitives ─────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return (
    <p style={{
      fontFamily: KANIT, fontSize: 10, fontWeight: 700,
      color: '#bbb', textTransform: 'uppercase', letterSpacing: 1,
      margin: '0 0 10px',
    }}>
      {text}
    </p>
  )
}

function Spinner() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="12" cy="12" r="10" stroke="#E9E9E9" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={T.purple} strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
