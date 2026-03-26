'use client'
import { useState, useEffect } from 'react'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { TermsModal } from '@/components/landing/TermsModal'
import { LoginModal } from '@/components/landing/LoginModal'
import { DepositModal } from '@/components/landing/DepositModal'
import { AccountModal } from '@/components/landing/AccountModal'
import { HowItWorksModal } from '@/components/landing/HowItWorksModal'
import { HamsterCard } from '@/components/arena/HamsterCard'
import { HighlightSection } from '@/components/arena/HighlightSection'
import { PETS, type RaceResult } from '@/config/site'
import type { RaceWindow } from '@/lib/race-scheduler'
import { useIsMobile } from '@/components/ui/index'

const KANIT = "var(--font-kanit), sans-serif"
const TERMS_KEY = 'hamstar_terms_accepted'

type Modal = 'terms' | 'login' | 'deposit' | 'account' | 'howitworks' | null

interface ArenaClientProps {
  race: RaceWindow
  lastResult?: RaceResult
}

function useCountdown(targetMs: number) {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, targetMs - Date.now()))
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(Math.max(0, targetMs - Date.now())), 1000)
    return () => clearInterval(t)
  }, [targetMs])
  const h = Math.floor(timeLeft / 3600000)
  const m = Math.floor((timeLeft % 3600000) / 60000)
  const s = Math.floor((timeLeft % 60000) / 1000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function ArenaClient({ race, lastResult }: ArenaClientProps) {
  const [modal, setModal] = useState<Modal>(null)
  const [authed, setAuthed] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [showHighlight, setShowHighlight] = useState(false)
  const isMobile = useIsMobile()

  const isLive = race.status === 'LIVE'
  const countdownTarget = isLive ? race.endsAt.getTime() : race.startsAt.getTime()
  const countdown = useCountdown(countdownTarget)

  useEffect(() => {
    if (!localStorage.getItem(TERMS_KEY)) setModal('terms')
  }, [])

  const handleLogin = () => { setAuthed(true); setModal(null) }
  const handleDisconnect = () => { setAuthed(false); setWalletAddress('') }

  const statusLabel = isLive ? 'Race Live' : 'Arena Preparing'
  const countdownLabel = isLive ? 'Race Ends In' : 'Cheering Opens In'

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.8)} }
      `}</style>

      <LandingNav
        authed={authed}
        walletAddress={walletAddress || undefined}
        onLoginClick={() => setModal('login')}
        onDepositClick={() => setModal('deposit')}
        onAccountClick={() => setModal('account')}
        onHowItWorksClick={() => setModal('howitworks')}
      />

      <main style={{ background: '#f8f9fa', minHeight: '100vh', paddingTop: 87 }}>

        {/* Hero header */}
        <div style={{
          textAlign: 'center',
          padding: isMobile ? '40px 16px 24px' : '60px 24px 32px',
        }}>
          <h1 style={{
            fontFamily: KANIT, fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 700, color: '#0D0D14', marginBottom: 12,
          }}>
            Welcome to Hamstar Arena
          </h1>
          <p style={{
            fontFamily: KANIT, fontSize: 'clamp(14px, 1.6vw, 20px)',
            color: '#555', maxWidth: 600, margin: '0 auto',
          }}>
            {isLive
              ? 'The race is live! Cheer for your hamster before time runs out.'
              : 'The arena is preparing for the next race. Cheering will open soon.'}
          </p>
        </div>

        {/* Status card */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(16px,3vw,48px) 32px' }}>
          <div style={{
            background: '#fff',
            borderRadius: 32,
            padding: isMobile ? '20px 20px' : '28px 48px',
            boxShadow: '0 20px 40px rgba(77,67,83,0.06)',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: isMobile ? 16 : 0,
          }}>
            {[
              { label: 'Arena Status', value: statusLabel },
              { label: 'Next Race Round', value: `Round ${race.raceNumber}` },
              { label: countdownLabel, value: countdown },
            ].map(({ label, value }, i) => (
              <div key={label} style={{
                textAlign: isMobile ? 'left' : (i === 0 ? 'left' : i === 2 ? 'right' : 'center'),
                padding: isMobile ? 0 : '0 24px',
                borderLeft: (!isMobile && i > 0) ? '1px solid #f0f0f0' : 'none',
              }}>
                <p style={{ fontFamily: KANIT, fontSize: 'clamp(14px,1.4vw,18px)', color: '#888', marginBottom: 4 }}>
                  {label}
                </p>
                <p style={{
                  fontFamily: KANIT, fontSize: 'clamp(18px,2vw,28px)', fontWeight: 600, color: '#0D0D14',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Hamster cards */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(16px,3vw,48px) 40px' }}>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            {PETS.map(pet => (
              <HamsterCard
                key={pet.id}
                id={pet.id}
                name={pet.name}
                tagline={pet.tagline}
                color={pet.color}
                image={pet.image ?? ''}
                status={isLive ? 'LIVE' : 'UPCOMING'}
                onCheer={() => authed ? undefined : setModal('login')}
              />
            ))}
          </div>
        </div>

        {/* Watch Previous Race */}
        {lastResult && (
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(16px,3vw,48px) 60px' }}>
            <WatchPreviousBtn onClick={() => setShowHighlight(h => !h)} open={showHighlight} />
          </div>
        )}

        {/* Highlight section */}
        {showHighlight && <HighlightSection lastResult={lastResult} />}
      </main>

      <LandingFooter />

      {/* Modals */}
      {modal === 'terms'     && <TermsModal onAccept={() => { localStorage.setItem(TERMS_KEY,'1'); setModal('login') }} />}
      {modal === 'login'     && <LoginModal onClose={() => setModal(null)} onLogin={handleLogin} />}
      {modal === 'deposit'   && <DepositModal address={walletAddress} onClose={() => setModal(null)} />}
      {modal === 'account'   && (
        <AccountModal
          walletAddress={walletAddress || undefined}
          onClose={() => setModal(null)}
          onDeposit={() => setModal('deposit')}
          onDisconnect={handleDisconnect}
        />
      )}
      {modal === 'howitworks' && (
        <HowItWorksModal
          onClose={() => setModal(null)}
          onEnterArena={() => setModal(authed ? null : 'login')}
        />
      )}
    </>
  )
}

function WatchPreviousBtn({ onClick, open }: { onClick: () => void; open: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 12, width: '100%', padding: '22px 32px',
        background: '#FFE790',
        border: 'none', borderRadius: 70,
        fontFamily: KANIT, fontSize: 'clamp(16px,2vw,24px)', fontWeight: 700,
        color: '#0D0D14', cursor: 'pointer',
        opacity: hov ? 0.9 : 1, transition: 'opacity 0.15s',
        boxShadow: '0 20px 40px rgba(77,67,83,0.08)',
      }}
    >
      Watch Previous Race
      <span style={{ fontSize: 18, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
    </button>
  )
}
