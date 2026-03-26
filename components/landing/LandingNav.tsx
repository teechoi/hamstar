'use client'
import { useState, useEffect } from 'react'
import { useIsMobile } from '@/components/ui/index'

const YELLOW = '#FFE790'
const DARK = '#0D0D14'
const KANIT = "var(--font-kanit), sans-serif"

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export interface LandingNavProps {
  authed?: boolean
  balance?: string
  walletAddress?: string
  onLoginClick?: () => void
  onDepositClick?: () => void
  onAccountClick?: () => void
  onHowItWorksClick?: () => void
}

export function LandingNav({
  authed = false,
  balance,
  walletAddress,
  onLoginClick,
  onDepositClick,
  onAccountClick,
  onHowItWorksClick,
}: LandingNavProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on scroll
  useEffect(() => {
    if (menuOpen) setMenuOpen(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrolled])

  const NAV_LINKS = [
    { label: 'Home',       id: 'hero',    href: '/'            },
    { label: 'Arena',      id: 'arena',   href: '/arena'       },
    { label: 'Highlights', id: 'hero',    href: '/highlights'  },
    { label: 'Pet',        id: 'racers',  href: undefined      },
    { label: 'Sponsors',   id: 'footer',  href: undefined      },
  ]

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: scrolled || menuOpen ? 'rgba(13,13,20,0.95)' : 'transparent',
      backdropFilter: scrolled || menuOpen ? 'blur(12px)' : 'none',
      transition: 'background 0.3s, backdrop-filter 0.3s',
    }}>
      {/* Tagline strip */}
      <div style={{
        textAlign: 'center', padding: '6px 0',
        fontSize: isMobile ? 11 : 13, fontWeight: 500, color: '#fff',
        fontFamily: KANIT, background: '#7B52FF',
        letterSpacing: 0.2,
      }}>
        The smallest sport on the internet.
      </div>

      {/* Main nav row */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: isMobile ? '10px 16px' : '8px 24px 12px',
        gap: 12,
      }}>
        {/* Mobile: Logo + hamburger */}
        {isMobile ? (
          <>
            <span style={{ color: YELLOW, fontFamily: KANIT, fontWeight: 700, fontSize: 16, flex: 1 }}>
              🐹 Hamstar
            </span>
            {authed ? (
              <button
                onClick={onDepositClick}
                style={{
                  padding: '6px 14px', background: YELLOW, border: 'none',
                  borderRadius: 9999, color: DARK, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: KANIT,
                }}
              >
                Deposit
              </button>
            ) : (
              <button
                onClick={onLoginClick}
                style={{
                  padding: '6px 16px', background: YELLOW, border: 'none',
                  borderRadius: 9999, color: DARK, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: KANIT,
                }}
              >
                Sign Up
              </button>
            )}
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#fff', fontSize: 22, padding: 4, lineHeight: 1,
                display: 'flex', flexDirection: 'column', gap: 5,
              }}
              aria-label="Menu"
            >
              <span style={{ display: 'block', width: 22, height: 2, background: menuOpen ? YELLOW : '#fff', transition: 'all 0.2s', transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
              <span style={{ display: 'block', width: 22, height: 2, background: menuOpen ? 'transparent' : '#fff', transition: 'all 0.2s' }} />
              <span style={{ display: 'block', width: 22, height: 2, background: menuOpen ? YELLOW : '#fff', transition: 'all 0.2s', transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
            </button>
          </>
        ) : (
          <>
            {/* Desktop left spacer */}
            <div style={{ flex: 1 }} />

            {/* Center pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              {NAV_LINKS.map(({ label, id, href }) => (
                <NavPill key={label} label={label} onClick={() => href ? window.location.href = href : scrollTo(id)} />
              ))}
              <GhostPill
                label="How Hamstar Works"
                onClick={onHowItWorksClick ?? (() => scrollTo('about'))}
              />
            </div>

            {/* Desktop right: auth */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
              {authed ? (
                <AuthedSection
                  balance={balance}
                  walletAddress={walletAddress}
                  onDepositClick={onDepositClick}
                  onAccountClick={onAccountClick}
                />
              ) : (
                <UnauthSection onLoginClick={onLoginClick} />
              )}
            </div>
          </>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div style={{
          background: 'rgba(13,13,20,0.98)',
          padding: '8px 16px 20px',
          display: 'flex', flexDirection: 'column', gap: 6,
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          {NAV_LINKS.map(({ label, id }) => (
            <button
              key={label}
              onClick={() => { scrollTo(id); setMenuOpen(false) }}
              style={{
                background: 'none', border: 'none',
                color: '#fff', fontSize: 15, fontWeight: 500,
                cursor: 'pointer', fontFamily: KANIT,
                textAlign: 'left', padding: '10px 4px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => { onHowItWorksClick?.(); setMenuOpen(false) }}
            style={{
              background: 'none', border: 'none',
              color: YELLOW, fontSize: 15, fontWeight: 500,
              cursor: 'pointer', fontFamily: KANIT,
              textAlign: 'left', padding: '10px 4px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            How Hamstar Works
          </button>
          {!authed && (
            <button
              onClick={() => { onLoginClick?.(); setMenuOpen(false) }}
              style={{
                marginTop: 8,
                padding: '12px',
                background: YELLOW, border: 'none',
                borderRadius: 9999, color: DARK,
                fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: KANIT,
              }}
            >
              Log In / Sign Up
            </button>
          )}
        </div>
      )}
    </nav>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function NavPill({ label, onClick }: { label: string; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '7px 20px',
        background: YELLOW, border: 'none', borderRadius: 9999,
        color: DARK, fontSize: 13, fontWeight: 500,
        cursor: 'pointer', fontFamily: KANIT,
        opacity: hov ? 0.85 : 1, transition: 'opacity 0.15s',
      }}
    >
      {label}
    </button>
  )
}

function GhostPill({ label, onClick }: { label: string; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '7px 20px',
        background: hov ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
        border: 'none', borderRadius: 9999,
        color: YELLOW, fontSize: 13, fontWeight: 500,
        cursor: 'pointer', fontFamily: KANIT,
        transition: 'background 0.15s',
      }}
    >
      {label}
    </button>
  )
}

function UnauthSection({ onLoginClick }: { onLoginClick?: () => void }) {
  const [loginHov, setLoginHov] = useState(false)
  const [signupHov, setSignupHov] = useState(false)
  return (
    <>
      <button
        onClick={onLoginClick}
        onMouseEnter={() => setLoginHov(true)}
        onMouseLeave={() => setLoginHov(false)}
        style={{
          background: 'none', border: 'none', color: '#fff',
          fontSize: 13, fontWeight: 500, cursor: 'pointer',
          fontFamily: KANIT, padding: '7px 10px',
          opacity: loginHov ? 0.7 : 1, transition: 'opacity 0.15s',
        }}
      >
        Log In
      </button>
      <button
        onClick={onLoginClick}
        onMouseEnter={() => setSignupHov(true)}
        onMouseLeave={() => setSignupHov(false)}
        style={{
          padding: '7px 20px', background: YELLOW, border: 'none',
          borderRadius: 9999, color: DARK, fontSize: 13, fontWeight: 600,
          cursor: 'pointer', fontFamily: KANIT,
          opacity: signupHov ? 0.85 : 1, transition: 'opacity 0.15s',
        }}
      >
        Sign Up
      </button>
    </>
  )
}

function AuthedSection({
  balance,
  walletAddress,
  onDepositClick,
  onAccountClick,
}: {
  balance?: string
  walletAddress?: string
  onDepositClick?: () => void
  onAccountClick?: () => void
}) {
  const [depHov, setDepHov] = useState(false)
  const [accHov, setAccHov] = useState(false)
  const hasBalance = balance && balance !== '0'
  const shortAddr = walletAddress
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    : null

  return (
    <>
      {hasBalance && (
        <span style={{ color: YELLOW, fontSize: 13, fontWeight: 500, fontFamily: KANIT }}>
          {balance} USDT
        </span>
      )}
      <button
        onClick={onDepositClick}
        onMouseEnter={() => setDepHov(true)}
        onMouseLeave={() => setDepHov(false)}
        style={{
          background: 'none', border: 'none', color: YELLOW,
          fontSize: 13, fontWeight: 500, cursor: 'pointer',
          fontFamily: KANIT, padding: '7px 6px',
          opacity: depHov ? 0.75 : 1, transition: 'opacity 0.15s',
        }}
      >
        Deposit
      </button>
      <button
        onClick={onAccountClick}
        onMouseEnter={() => setAccHov(true)}
        onMouseLeave={() => setAccHov(false)}
        style={{
          padding: '7px 18px', background: YELLOW,
          border: 'none', borderRadius: 9999, color: DARK,
          fontSize: 13, fontWeight: 600, fontFamily: KANIT,
          cursor: 'pointer',
          opacity: accHov ? 0.85 : 1, transition: 'opacity 0.15s',
        }}
      >
        {shortAddr ?? 'Account'}
      </button>
    </>
  )
}
