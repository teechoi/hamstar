'use client'
import { useState } from 'react'

const YELLOW = '#FFE790'
const DARK = '#000000'
const KANIT = "var(--font-kanit), sans-serif"

interface LoginModalProps {
  onClose: () => void
  onLogin: () => void
  loginTitle?: string
  loginSubtitle?: string
}

// ─── Social provider definitions ──────────────────────────────────────────────

const SOCIAL_PROVIDERS = [
  {
    name: 'X / Twitter',
    bg: '#000',
    color: '#fff',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: 'Discord',
    bg: '#5865F2',
    color: '#fff',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
  {
    name: 'Telegram',
    bg: '#26A5E4',
    color: '#fff',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    name: 'Phantom',
    bg: '#AB9FF2',
    color: '#fff',
    icon: (
      <svg width="22" height="22" viewBox="0 0 128 128" fill="none">
        <rect width="128" height="128" rx="64" fill="#AB9FF2" />
        <path d="M110.584 64.9142H99.142C99.142 41.7651 80.173 23 56.7724 23C33.6612 23 14.8716 41.3491 14.4308 64.1671C13.9728 87.8985 33.3299 108 57.151 108H60.6151C82.1958 108 110.584 89.2057 110.584 64.9142Z" fill="white" />
        <ellipse cx="77.0042" cy="63.0569" rx="6.63498" ry="6.56742" fill="#AB9FF2" />
        <ellipse cx="95.4" cy="63.0569" rx="6.63498" ry="6.56742" fill="#AB9FF2" />
      </svg>
    ),
  },
]

export function LoginModal({
  onClose,
  onLogin,
  loginTitle = 'Welcome to Hamstar Arena 🐹',
  loginSubtitle = 'A live-streamed blockchain-based entertainment experience',
}: LoginModalProps) {
  const [googleHov, setGoogleHov] = useState(false)

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
          background: '#fff',
          borderRadius: 26,
          width: '100%', maxWidth: 540,
          padding: 'clamp(28px, 5vw, 44px)',
          fontFamily: KANIT,
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 20,
            background: 'none', border: 'none',
            fontSize: 22, cursor: 'pointer', color: '#999',
            fontFamily: KANIT, lineHeight: 1,
          }}
        >
          ×
        </button>

        <h2 style={{ fontSize: 'clamp(20px,4vw,26px)', fontWeight: 600, color: DARK, marginBottom: 8, textAlign: 'center' }}>
          {loginTitle}
        </h2>
        <p style={{ fontSize: 14, color: '#8A8A8A', fontFamily: 'Pretendard, sans-serif', textAlign: 'center', marginBottom: 28 }}>
          {loginSubtitle}
        </p>

        {/* Google CTA */}
        <button
          onClick={onLogin}
          onMouseEnter={() => setGoogleHov(true)}
          onMouseLeave={() => setGoogleHov(false)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, width: '100%',
            padding: '14px 20px',
            background: YELLOW,
            border: 'none', borderRadius: 48.5,
            fontSize: 15, fontWeight: 600, color: DARK,
            cursor: 'pointer', fontFamily: KANIT,
            opacity: googleHov ? 0.85 : 1,
            transition: 'opacity 0.15s',
            marginBottom: 20,
          }}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* OR divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: '#e8e8e8' }} />
          <span style={{ fontSize: 13, color: '#878787', fontFamily: KANIT }}>OR</span>
          <div style={{ flex: 1, height: 1, background: '#e8e8e8' }} />
        </div>

        {/* Social grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10, marginBottom: 24,
        }}>
          {SOCIAL_PROVIDERS.map((p) => (
            <SocialButton key={p.name} provider={p} onClick={onLogin} />
          ))}
        </div>

        {/* Footer links */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
          {['Terms of Use', 'Risk Disclosure', 'Privacy Policy'].map(link => (
            <a key={link} href="#" style={{ fontSize: 12, color: '#8a8a8a', fontFamily: KANIT, textDecoration: 'none' }}>
              {link}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function SocialButton({
  provider,
  onClick,
}: {
  provider: typeof SOCIAL_PROVIDERS[0]
  onClick: () => void
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={provider.name}
      style={{
        height: 90,
        background: hov ? provider.bg : '#fff',
        border: `1.5px solid ${hov ? provider.bg : '#ebebeb'}`,
        borderRadius: 16,
        boxShadow: hov ? '0 6px 20px rgba(0,0,0,0.12)' : '0 2px 8px rgba(77,67,83,0.06)',
        cursor: 'pointer',
        color: hov ? provider.color : '#444',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 6,
        transition: 'all 0.18s ease',
        transform: hov ? 'translateY(-2px)' : 'none',
      }}
    >
      <span style={{ color: hov ? provider.color : undefined, display: 'flex' }}>
        {provider.icon}
      </span>
      <span style={{ fontSize: 11, fontFamily: KANIT, fontWeight: 500 }}>
        {provider.name.split(' / ')[0]}
      </span>
    </button>
  )
}
