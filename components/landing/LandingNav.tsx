'use client'
import { useState, useEffect } from 'react'
import { useIsMobile } from '@/components/ui/index'

const YELLOW = '#FFE790'
const DARK = '#000000'
const PURPLE = '#735DFF'
const KANIT = "var(--font-kanit), sans-serif"

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export interface LandingNavProps {
  authed?: boolean
  connecting?: boolean  // wallet adapter autoConnect in progress
  balance?: string
  walletAddress?: string
  lightBg?: boolean   // true on Arena / Highlights (white bg pages)
  navTagline?: string
  onLoginClick?: () => void
  onDepositClick?: () => void
  onAccountClick?: () => void
  onHowItWorksClick?: () => void
}

export function LandingNav({
  authed = false,
  connecting = false,
  balance,
  walletAddress,
  lightBg = false,
  navTagline,
  onLoginClick,
  onDepositClick,
  onAccountClick,
  onHowItWorksClick,
}: LandingNavProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileNavBtnHov, setMobileNavBtnHov] = useState(false)
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

  // On light-bg pages: use dark colours until the user scrolls (which adds dark overlay)
  const isDark = !lightBg || scrolled || menuOpen

  const NAV_LINKS = [
    { label: 'Home',  id: 'hero',   href: '/'      },
    { label: 'Arena', id: 'arena',  href: '/arena' },
    { label: 'Pet',   id: 'racers', href: '/pet'   },
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
        textAlign: 'center', height: 35,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: isMobile ? 11 : 12, fontWeight: 500, color: '#fff',
        fontFamily: KANIT, background: '#735DFF',
        letterSpacing: 0.2,
      }}>
        {navTagline ?? 'The smallest sport on the internet.'}
      </div>

      {/* Main nav row — Figma: HORIZONTAL, pad:20/20/20/20, gap:90, justify:CENTER */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: isMobile ? '10px 16px' : '20px 20px',
        justifyContent: isMobile ? undefined : 'center',
        gap: isMobile ? 12 : 0,
      }}>
        {isMobile ? (
          <>
            <span style={{ color: isDark ? YELLOW : DARK, fontFamily: KANIT, fontWeight: 700, fontSize: 16, flex: 1 }}>
              🐹 Hamstar
            </span>
            {connecting ? (
              <span style={{
                padding: '12px 16px', background: 'rgba(255,231,144,0.25)', border: 'none',
                borderRadius: 48.5, color: DARK, fontSize: 13, fontWeight: 600,
                fontFamily: KANIT, opacity: 0.7,
              }}>
                Connecting…
              </span>
            ) : authed ? (
              <button
                onClick={onDepositClick}
                onMouseEnter={() => setMobileNavBtnHov(true)}
                onMouseLeave={() => setMobileNavBtnHov(false)}
                style={{
                  padding: '12px 16px', background: YELLOW, border: 'none',
                  borderRadius: 48.5, color: DARK, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: KANIT,
                  opacity: mobileNavBtnHov ? 0.85 : 1, transition: 'opacity 0.15s',
                }}
              >
                Deposit
              </button>
            ) : (
              <button
                onClick={onLoginClick}
                onMouseEnter={() => setMobileNavBtnHov(true)}
                onMouseLeave={() => setMobileNavBtnHov(false)}
                style={{
                  padding: '12px 18px', background: YELLOW, border: 'none',
                  borderRadius: 48.5, color: DARK, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: KANIT,
                  opacity: mobileNavBtnHov ? 0.85 : 1, transition: 'opacity 0.15s',
                }}
              >
                Sign Up
              </button>
            )}
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '11px 10px', lineHeight: 1,
                display: 'flex', flexDirection: 'column', gap: 5,
              }}
              aria-label="Menu"
            >
              {/* Bar colour: yellow when open, theme-aware when closed */}
              <span style={{ display: 'block', width: 22, height: 2, background: menuOpen ? YELLOW : (isDark ? '#fff' : DARK), transition: 'all 0.2s', transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
              <span style={{ display: 'block', width: 22, height: 2, background: menuOpen ? 'transparent' : (isDark ? '#fff' : DARK), transition: 'all 0.2s' }} />
              <span style={{ display: 'block', width: 22, height: 2, background: menuOpen ? YELLOW : (isDark ? '#fff' : DARK), transition: 'all 0.2s', transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 'min(56.5vw, 860px)' }}>
            {/* Left group: nav pills — Figma Frame 2: gap:10 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {NAV_LINKS.map(({ label, id, href }) => (
                <NavPill key={label} label={label} onClick={() => href ? window.location.href = href : scrollTo(id)} />
              ))}
            </div>

            {/* Right group: How Hamstar Works + auth — Figma Frame 1430107015: gap:20 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <HowItWorksPill
                isDark={isDark}
                onClick={onHowItWorksClick ?? (() => scrollTo('about'))}
              />
              {connecting ? (
                <ConnectingPill isDark={isDark} />
              ) : authed ? (
                <AuthedSection
                  balance={balance}
                  walletAddress={walletAddress}
                  isDark={isDark}
                  onDepositClick={onDepositClick}
                  onAccountClick={onAccountClick}
                />
              ) : (
                <UnauthSection isDark={isDark} onLoginClick={onLoginClick} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile dropdown — always dark */}
      {isMobile && menuOpen && (
        <div style={{
          background: 'rgba(13,13,20,0.98)',
          padding: '8px 16px 20px',
          display: 'flex', flexDirection: 'column', gap: 6,
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          {NAV_LINKS.map(({ label, id, href }) => (
            <button
              key={label}
              onClick={() => { href ? (window.location.href = href) : scrollTo(id); setMenuOpen(false) }}
              style={{
                background: 'none', border: 'none',
                color: '#fff', fontSize: 15, fontWeight: 500,
                cursor: 'pointer', fontFamily: KANIT,
                textAlign: 'left', padding: '13px 8px',
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
              textAlign: 'left', padding: '13px 8px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            How Hamstar Works
          </button>
          {!authed && (
            <button
              onClick={() => { onLoginClick?.(); setMenuOpen(false) }}
              style={{
                marginTop: 8, padding: '14px',
                background: YELLOW, border: 'none',
                borderRadius: 48.5, color: DARK,
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

// ─── Sub-components ─────────────────────────────────────────────────────────────

function ConnectingPill({ isDark }: { isDark: boolean }) {
  return (
    <div style={{
      padding: '7px 18px',
      background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
      borderRadius: 48.5,
      fontFamily: KANIT, fontSize: 12, fontWeight: 500,
      color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', gap: 6,
      userSelect: 'none',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: YELLOW, display: 'inline-block', animation: 'pulse 1.2s ease-in-out infinite' }} />
      Connecting…
    </div>
  )
}

function NavPill({ label, onClick }: { label: string; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '7px 24px',
        background: YELLOW, border: 'none', borderRadius: 48.5,
        color: DARK, fontSize: 12, fontWeight: 500,
        cursor: 'pointer', fontFamily: KANIT,
        opacity: hov ? 0.85 : 1, transition: 'opacity 0.15s',
      }}
    >
      {label}
    </button>
  )
}

function HowItWorksPill({ isDark, onClick }: { isDark: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '8px 24px',
        // Dark context: solid #717171 per Figma Frame 1430106978 (150×30px)
        // Light context: solid white with purple text
        background: isDark
          ? (hov ? '#888' : '#717171')
          : (hov ? 'rgba(255,255,255,0.85)' : '#fff'),
        border: 'none', borderRadius: 48.5,
        color: isDark ? YELLOW : PURPLE,
        fontSize: 12, fontWeight: 500,
        cursor: 'pointer', fontFamily: KANIT,
        transition: 'background 0.15s, color 0.15s',
        boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      How Hamstar Works
    </button>
  )
}

function UnauthSection({ isDark, onLoginClick }: { isDark: boolean; onLoginClick?: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onLoginClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '7px 20px', background: YELLOW, border: 'none',
        borderRadius: 48.5, color: DARK, fontSize: 12, fontWeight: 600,
        cursor: 'pointer', fontFamily: KANIT,
        opacity: hov ? 0.85 : 1, transition: 'opacity 0.15s',
      }}
    >
      Connect Wallet
    </button>
  )
}

function AuthedSection({
  balance,
  walletAddress,
  isDark,
  onDepositClick,
  onAccountClick,
}: {
  balance?: string
  walletAddress?: string
  isDark: boolean
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
        <span style={{ color: isDark ? YELLOW : DARK, fontSize: 12, fontWeight: 500, fontFamily: KANIT }}>
          {balance} USDT
        </span>
      )}
      <button
        onClick={onDepositClick}
        onMouseEnter={() => setDepHov(true)}
        onMouseLeave={() => setDepHov(false)}
        style={{
          background: 'none', border: 'none',
          color: isDark ? YELLOW : PURPLE,
          fontSize: 12, fontWeight: 500, cursor: 'pointer',
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
          border: 'none', borderRadius: 48.5, color: DARK,
          fontSize: 12, fontWeight: 600, fontFamily: KANIT,
          cursor: 'pointer',
          opacity: accHov ? 0.85 : 1, transition: 'opacity 0.15s',
        }}
      >
        {shortAddr ?? 'Account'}
      </button>
    </>
  )
}
