'use client'
import { useState, useEffect, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletReadyState } from '@solana/wallet-adapter-base'
import { usePrivyLogin } from '@/components/wallet/Providers'
import { T } from '@/lib/theme'

const KANIT = "var(--font-kanit), sans-serif"
const PRET  = 'Pretendard, sans-serif'

interface LoginModalProps {
  onClose: () => void
  onLogin?: () => void
  onConnectPhantom?: () => void
  loginTitle?: string
  loginSubtitle?: string
}

type View = 'connect' | 'email'

export function LoginModal({ onClose, loginTitle, loginSubtitle }: LoginModalProps) {
  const { wallets, select, connecting, connected } = useWallet()
  const login = usePrivyLogin()
  const [view, setView] = useState<View>('connect')
  const [connectingName, setConnectingName] = useState<string | null>(null)
  const [err, setErr] = useState('')

  // Stable refs
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  // Only close when we NEWLY connect — ignore if already connected when modal opens
  const alreadyConnected = useRef(connected)
  useEffect(() => {
    if (connected && !alreadyConnected.current) onCloseRef.current()
  }, [connected])

  // Reset spinner if wallet popup was dismissed (connecting dropped without connecting)
  useEffect(() => {
    if (!connecting && connectingName && !connected) {
      setConnectingName(null)
    }
  }, [connecting]) // eslint-disable-line react-hooks/exhaustive-deps

  const detected = wallets.filter(
    w => w.readyState === WalletReadyState.Installed || w.readyState === WalletReadyState.Loadable
  )
  const getable = wallets.filter(w => w.readyState === WalletReadyState.NotDetected)

  const handleSelect = (name: string) => {
    setErr('')
    setConnectingName(name)
    try {
      select(name as any)
      // autoConnect:true on WalletProvider handles connect() automatically
      // after the selected wallet changes — no explicit connect() needed here
    } catch {
      setConnectingName(null)
      setErr('Could not open wallet. Please try again.')
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(20px)',
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
          maxHeight: '92vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
        }}
      >
        {view === 'connect'
          ? <ConnectView
              detected={detected}
              getable={getable}
              connecting={connecting}
              connectingName={connectingName}
              err={err}
              loginTitle={loginTitle}
              loginSubtitle={loginSubtitle}
              onSelect={handleSelect}
              onEmailView={() => setView('email')}
              onPrivyLogin={login}
            />
          : <EmailView onBack={() => setView('connect')} onPrivyLogin={login} />
        }
      </div>
    </div>
  )
}

// ─── Connect view ─────────────────────────────────────────────────────────────

function ConnectView({
  detected, getable, connecting, connectingName, err,
  loginTitle, loginSubtitle, onSelect, onEmailView, onPrivyLogin,
}: {
  detected: ReturnType<typeof useWallet>['wallets']
  getable: ReturnType<typeof useWallet>['wallets']
  connecting: boolean
  connectingName: string | null
  err: string
  loginTitle?: string
  loginSubtitle?: string
  onSelect: (n: string) => void
  onEmailView: () => void
  onPrivyLogin: ReturnType<typeof usePrivyLogin>
}) {
  const noWallets = detected.length === 0

  return (
    <>
      {/* ── White header with yellow accent ── */}
      <div style={{ padding: '36px 32px 24px' }}>
        {/* Hamstar badge + icon row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
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
              <h2 style={{ fontFamily: KANIT, fontSize: 17, fontWeight: 800, color: T.text, margin: 0, whiteSpace: 'nowrap' }}>
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
      <div style={{ padding: '0 32px 28px' }}>

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
                  onClick={() => onSelect(w.adapter.name)}
                />
              ))}
            </div>
          </div>
        )}

        {/* No wallets nudge */}
        {noWallets && (
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {getable.slice(0, 6).map(w => (
                <WalletGetCard key={w.adapter.name} name={w.adapter.name} icon={w.adapter.icon} url={w.adapter.url} />
              ))}
            </div>
          </div>
        )}

        {/* Fallback curated list */}
        {noWallets && getable.length === 0 && <GetStartedList />}

        {/* Social / email — only shown when Privy is available */}
        {onPrivyLogin && (
          <>
            <ModalDivider label="or sign in with" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
              <PillBtn
                icon={<MailIcon />}
                label="Continue with Email"
                bg={T.bg}
                color={T.text}
                border={`1.5px solid ${T.border}`}
                hoverBg="#EEEEEE"
                onClick={onEmailView}
              />
              <PrivyGoogleBtn onLogin={onPrivyLogin} />
              <PrivyAppleBtn onLogin={onPrivyLogin} />
            </div>
            <p style={{ fontFamily: PRET, fontSize: 11, color: '#ccc', textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
              Email & social sign-in creates a free self-custodial Solana wallet. No seed phrase.
            </p>
          </>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8 }}>
          {['Terms of Use', 'Privacy Policy'].map(link => (
            <a key={link} href="#" style={{ fontSize: 11, color: '#ccc', fontFamily: KANIT, textDecoration: 'none' }}>
              {link}
            </a>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Email view ───────────────────────────────────────────────────────────────

function EmailView({ onBack, onPrivyLogin }: { onBack: () => void; onPrivyLogin: ReturnType<typeof usePrivyLogin> }) {
  const [email, setEmail] = useState('')

  const handleSubmit = () => {
    if (!email.trim() || !onPrivyLogin) return
    onPrivyLogin({ loginMethods: ['email'], prefill: { type: 'email', value: email } })
  }

  return (
    <>
      <div style={{ padding: '36px 32px 28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
            background: T.yellow,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
            boxShadow: '0 4px 14px rgba(255,215,0,0.3)',
          }}>✉️</div>
          <div>
            <h2 style={{ fontFamily: KANIT, fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 800, color: T.text, margin: '0 0 3px' }}>
              Sign in with Email
            </h2>
            <p style={{ fontFamily: PRET, fontSize: 13, color: T.textMid, margin: 0 }}>
              We'll create a free Solana wallet for you.
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: T.purple, fontSize: 13, fontFamily: KANIT, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
            marginBottom: 20, padding: 0,
          }}
        >
          ← Back to wallets
        </button>

        <PrivyEmailLoginSection email={email} onEmailChange={setEmail} onSubmit={handleSubmit} />

        {onPrivyLogin && (
          <>
            <ModalDivider label="or continue with" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
              <PrivyGoogleBtn onLogin={onPrivyLogin} />
              <PrivyAppleBtn onLogin={onPrivyLogin} />
            </div>
          </>
        )}
      </div>
    </>
  )
}

// ─── Privy social login buttons ───────────────────────────────────────────────

function PrivyEmailLoginSection({
  email, onEmailChange, onSubmit,
}: { email: string; onEmailChange: (v: string) => void; onSubmit: () => void }) {
  return (
    <>
      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={e => onEmailChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSubmit()}
        style={{
          width: '100%', padding: '14px 16px',
          borderRadius: 14, border: `1.5px solid ${T.border}`,
          fontSize: 15, fontFamily: PRET, color: T.text,
          outline: 'none', marginBottom: 12, boxSizing: 'border-box',
        }}
      />
      <PillBtn
        label="Continue with Email"
        bg={T.yellow}
        color={T.text}
        hoverBg="#F5D850"
        onClick={onSubmit}
      />
    </>
  )
}

function PrivyGoogleBtn({ onLogin }: { onLogin: NonNullable<ReturnType<typeof usePrivyLogin>> }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={() => onLogin({ loginMethods: ['google'] })}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        width: '100%', padding: '13px 20px',
        background: hov ? T.bg : '#fff',
        border: `1.5px solid ${T.border}`,
        borderRadius: 48.5,
        fontSize: 14, fontWeight: 600, color: T.text,
        cursor: 'pointer', fontFamily: KANIT,
        transition: 'background 0.15s',
      }}
    >
      <GoogleIcon />
      Continue with Google
    </button>
  )
}

function PrivyAppleBtn({ onLogin }: { onLogin: NonNullable<ReturnType<typeof usePrivyLogin>> }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={() => onLogin({ loginMethods: ['apple'] })}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        width: '100%', padding: '13px 20px',
        background: hov ? '#222' : '#111',
        border: 'none',
        borderRadius: 48.5,
        fontSize: 14, fontWeight: 600, color: '#fff',
        cursor: 'pointer', fontFamily: KANIT,
        transition: 'background 0.15s',
      }}
    >
      <AppleIcon />
      Continue with Apple
    </button>
  )
}

// ─── Wallet list items ────────────────────────────────────────────────────────

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

// ─── Get-started fallback ─────────────────────────────────────────────────────

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

// ─── Shared primitives ────────────────────────────────────────────────────────

function PillBtn({ icon, label, bg, color, border, hoverBg, onClick }: {
  icon?: React.ReactNode; label: string; bg: string; color: string
  border?: string; hoverBg: string; onClick: () => void
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        width: '100%', padding: '13px 20px',
        background: hov ? hoverBg : bg,
        border: border ?? 'none',
        borderRadius: 48.5,
        fontSize: 14, fontWeight: 600, color,
        cursor: 'pointer', fontFamily: KANIT,
        transition: 'background 0.15s',
      }}
    >
      {icon}
      {label}
    </button>
  )
}

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

function ModalDivider({ label = 'or' }: { label?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 0' }}>
      <div style={{ flex: 1, height: 1, background: T.border }} />
      <span style={{ fontSize: 11, color: '#ccc', fontFamily: KANIT, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: T.border }} />
    </div>
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

// ─── Icons ────────────────────────────────────────────────────────────────────

function MailIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}
