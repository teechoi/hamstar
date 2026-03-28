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
import { PETS, SITE, type RaceResult } from '@/config/site'
import type { RaceWindow } from '@/lib/race-scheduler'
import { useIsMobile } from '@/components/ui/index'

const KANIT = "var(--font-kanit), sans-serif"
const PURPLE = '#735DFF'
const YELLOW = '#FFE790'
const DARK   = '#0D0D14'
const TERMS_KEY = 'hamstar_terms_accepted'

type Modal = 'terms' | 'login' | 'deposit' | 'account' | 'howitworks' | null
type ArenaState = 'PREPARING' | 'OPEN' | 'LIVE' | 'FINISHED'

// Mock support data — replace with real API data when backend is ready
const MOCK_SUPPORT: Record<string, { pct: number; supporters: number; sol: number }> = {
  dash:  { pct: 42, supporters: 12, sol: 4.1 },
  flash: { pct: 31, supporters: 9,  sol: 3.0 },
  turbo: { pct: 27, supporters: 7,  sol: 2.6 },
}
const MOCK_TOTAL_SOL = 9.7
const MOCK_POOL_TARGET = 20

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
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

export function ArenaClient({ race, lastResult }: ArenaClientProps) {
  const [modal, setModal]         = useState<Modal>(null)
  const [authed, setAuthed]       = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [cheeringFor, setCheeringFor]     = useState<string | null>(null)
  const [showResult, setShowResult]       = useState(false)
  const isMobile = useIsMobile()

  // Derive arena state:
  // - FINISHED: lastResult exists for this race round
  // - LIVE: race window is LIVE + stream is live (race in progress, cheering closed)
  // - OPEN: race window is LIVE + stream is not live (cheering open)
  // - PREPARING: race window is UPCOMING
  const isFinished = lastResult?.number === race.raceNumber
  const arenaState: ArenaState = isFinished
    ? 'FINISHED'
    : race.status === 'LIVE'
      ? (SITE.stream.isLive ? 'LIVE' : 'OPEN')
      : 'PREPARING'

  const countdownTarget = race.status === 'LIVE' ? race.endsAt.getTime() : race.startsAt.getTime()
  const countdown = useCountdown(countdownTarget)

  useEffect(() => {
    if (!localStorage.getItem(TERMS_KEY)) setModal('terms')
  }, [])

  const handleLogin      = () => { setAuthed(true); setModal(null) }
  const handleDisconnect = () => { setAuthed(false); setWalletAddress('') }

  const handleCheer = (petId: string) => {
    if (!authed) { setModal('login'); return }
    setCheeringFor(petId)
  }

  const statusLabel   = { PREPARING: 'Arena Preparing', OPEN: 'Cheering Open', LIVE: 'Race In Progress', FINISHED: 'Race Finished' }[arenaState]
  const winnerPet     = isFinished && lastResult ? PETS.find(p => p.id === lastResult.positions[0]) : null

  const showPoolBar = arenaState === 'OPEN' || arenaState === 'LIVE'

  const row3Label = isFinished ? 'Champion' : (race.status === 'LIVE' ? 'Race Ends In' : 'Cheering Opens In')
  const row3Value = isFinished ? (winnerPet ? `${winnerPet.name} 🏆` : '—') : countdown
  const statusRows = [
    { label: 'Arena Status',    value: statusLabel },
    { label: 'Next Race Round', value: `Round ${race.raceNumber}` },
    { label: row3Label,         value: row3Value },
  ]

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.8)} }
      `}</style>

      <LandingNav
        lightBg
        authed={authed}
        walletAddress={walletAddress || undefined}
        onLoginClick={() => setModal('login')}
        onDepositClick={() => setModal('deposit')}
        onAccountClick={() => setModal('account')}
        onHowItWorksClick={() => setModal('howitworks')}
      />

      <main style={{ background: '#F8F9FA', minHeight: '100vh', paddingTop: 87 }}>

        {/* Hero header */}
        <div style={{ textAlign: 'center', padding: isMobile ? '40px 16px 24px' : '60px 24px 32px' }}>
          <h1 style={{
            fontFamily: KANIT, fontSize: 24,
            fontWeight: 500, color: '#000', marginBottom: 8,
          }}>
            Welcome to Hamstar Arena
          </h1>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 16, fontWeight: 500, color: '#8A8A8A', maxWidth: 473, margin: '0 auto' }}>
            {arenaState === 'OPEN'
              ? 'Cheering is open! Pick your hamster and add your support before the race starts.'
              : arenaState === 'LIVE'
                ? 'The race is live! Watch your hamster run for glory.'
                : arenaState === 'FINISHED'
                  ? `Round ${race.raceNumber} is over. See who took the crown.`
                  : 'The arena is preparing for the next race. Cheering will open soon.'}
          </p>
        </div>

        <div style={{ position: 'relative' }}>
          {/* Left decorative hamster — Figma: x=-57 in 1280px frame, partially off-screen left */}
          {!isMobile && (
            <img
              src="/images/hamster-arena-left.png"
              alt=""
              aria-hidden
              style={{
                position: 'absolute',
                left: 'calc(50% - 698px)',
                top: 120,
                width: 294,
                height: 'auto',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />
          )}
        <div style={{ maxWidth: 707, margin: '0 auto', padding: isMobile ? '0 16px' : '0', position: 'relative', zIndex: 1 }}>

          {/* Status card — labels left, values right */}
          <div style={{
            background: '#fff', borderRadius: 20,
            padding: isMobile ? '16px 20px' : '20px 30px',
            boxShadow: '0 4px 20px rgba(77,67,83,0.08)',
            backdropFilter: 'blur(20px)',
            marginBottom: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {statusRows.map(r => (
                  <p key={r.label} style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 14, color: '#8A8A8A', margin: 0 }}>
                    {r.label}
                  </p>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
                {statusRows.map(r => (
                  <p key={r.label} style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 14, color: '#000', margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                    {r.value}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Total Arena Pool progress bar */}
          {showPoolBar && (
            <div style={{
              background: '#fff', borderRadius: 24,
              padding: isMobile ? '20px' : '22px 32px',
              marginBottom: 20,
              boxShadow: '0 8px 24px rgba(77,67,83,0.05)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'baseline' }}>
                <p style={{ fontFamily: KANIT, fontSize: 15, fontWeight: 600, color: DARK }}>
                  Total Arena Pool
                </p>
                <p style={{ fontFamily: KANIT, fontSize: 16, fontWeight: 700, color: PURPLE }}>
                  {MOCK_TOTAL_SOL} SOL
                </p>
              </div>
              <div style={{ width: '100%', height: 12, background: '#E9E9E9', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, (MOCK_TOTAL_SOL / MOCK_POOL_TARGET) * 100)}%`,
                  height: '100%', background: PURPLE, borderRadius: 6,
                  transition: 'width 0.5s',
                }} />
              </div>
              <p style={{ fontFamily: KANIT, fontSize: 12, color: '#aaa', marginTop: 6 }}>
                {MOCK_TOTAL_SOL} / {MOCK_POOL_TARGET} SOL target
              </p>
            </div>
          )}

          {/* Hamster cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 12,
            marginBottom: 20,
          }}>
            {PETS.map(pet => {
              const support = MOCK_SUPPORT[pet.id] ?? { pct: 33, supporters: 5, sol: 1.0 }
              return (
                <HamsterCard
                  key={pet.id}
                  id={pet.id}
                  name={pet.name}
                  tagline={pet.tagline}
                  color={pet.color}
                  image={pet.image ?? ''}
                  arenaState={arenaState}
                  supportPct={support.pct}
                  supporters={support.supporters}
                  supportPool={support.sol}
                  isWinner={isFinished && lastResult?.positions[0] === pet.id}
                  isCheering={cheeringFor === pet.id}
                  onCheer={() => handleCheer(pet.id)}
                />
              )
            })}
          </div>

          {/* "You're cheering for" summary card */}
          {authed && cheeringFor && (arenaState === 'OPEN' || arenaState === 'LIVE') && (
            <CheeringCard
              petId={cheeringFor}
              supportPct={MOCK_SUPPORT[cheeringFor]?.pct ?? 33}
              isMobile={!!isMobile}
            />
          )}

          {/* Bottom CTAs */}
          <div style={{ marginBottom: 40 }}>
            {arenaState === 'FINISHED' ? (
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
                <YellowBtn
                  label="Watch Previous Race"
                  suffix="▼"
                  onClick={() => document.getElementById('highlight')?.scrollIntoView({ behavior: 'smooth' })}
                />
                <YellowBtn label="View Full Result" suffix="▶" onClick={() => setShowResult(s => !s)} />
              </div>
            ) : arenaState === 'OPEN' || arenaState === 'LIVE' ? (
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
                <WatchLiveBtn active href={SITE.stream.url} />
                <GrayDisabledBtn label="View Full Result" />
              </div>
            ) : (
              <WatchPreviousRaceBtn onClick={() => document.getElementById('highlight')?.scrollIntoView({ behavior: 'smooth' })} />
            )}
          </div>

          {/* Full Result panel */}
          {isFinished && showResult && lastResult && (
            <FullResultPanel
              result={lastResult}
              cheeringFor={cheeringFor}
              onClose={() => setShowResult(false)}
            />
          )}

        </div>
        </div>{/* end position:relative wrapper */}

        {/* Highlight section — always visible */}
        <div id="highlight">
          <HighlightSection lastResult={lastResult} />
        </div>
      </main>

      <LandingFooter />

      {modal === 'terms'      && <TermsModal onAccept={() => { localStorage.setItem(TERMS_KEY,'1'); setModal('login') }} />}
      {modal === 'login'      && <LoginModal onClose={() => setModal(null)} onLogin={handleLogin} />}
      {modal === 'deposit'    && <DepositModal address={walletAddress} onClose={() => setModal(null)} />}
      {modal === 'account'    && (
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

// ─── Sub-components ─────────────────────────────────────────────────────────

function CheeringCard({ petId, supportPct, isMobile }: { petId: string; supportPct: number; isMobile: boolean }) {
  const pet = PETS.find(p => p.id === petId)
  if (!pet) return null
  return (
    <div style={{
      background: '#fff', borderRadius: 24,
      padding: isMobile ? '20px' : '24px 32px',
      marginBottom: 20,
      boxShadow: '0 8px 24px rgba(77,67,83,0.05)',
      border: `1.5px solid ${PURPLE}20`,
    }}>
      <p style={{ fontFamily: KANIT, fontSize: 13, color: '#888', marginBottom: 14 }}>
        You&apos;re cheering for
      </p>
      <div style={{ display: 'flex', gap: isMobile ? 20 : 40, flexWrap: 'wrap' }}>
        {[
          { label: 'Racer',         value: pet.name   },
          { label: 'Your Support',  value: '0.5 SOL'  },
          { label: 'Share of Pool', value: `${supportPct}%` },
        ].map(({ label, value }) => (
          <div key={label}>
            <p style={{ fontFamily: KANIT, fontSize: 11, color: '#aaa', marginBottom: 2 }}>{label}</p>
            <p style={{ fontFamily: KANIT, fontSize: 18, fontWeight: 600, color: DARK }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function YellowBtn({ label, suffix, onClick }: { label: string; suffix: string; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 12, padding: '16px 48px',
        background: YELLOW, border: '2px solid #000', borderRadius: 70,
        fontFamily: 'Pretendard, sans-serif', fontSize: 17, fontWeight: 700,
        color: DARK, cursor: 'pointer',
        opacity: hov ? 0.9 : 1, transition: 'opacity 0.15s',
        boxShadow: '0 20px 40px rgba(77,67,83,0.08)',
      }}
    >
      {label} <span style={{ fontSize: 16 }}>{suffix}</span>
    </button>
  )
}

function WatchLiveBtn({ active, href }: { active: boolean; href: string }) {
  const [hov, setHov] = useState(false)
  return (
    <a
      href={active ? href : undefined}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => { if (active) setHov(true) }}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 12, padding: '16px 48px',
        background: active ? YELLOW : '#e0e0e0',
        border: active ? '2px solid #000' : '2px solid #ccc',
        borderRadius: 70, textDecoration: 'none',
        fontFamily: 'Pretendard, sans-serif', fontSize: 17, fontWeight: 700,
        color: active ? DARK : '#aaa',
        cursor: active ? 'pointer' : 'default',
        opacity: hov ? 0.9 : 1, transition: 'opacity 0.15s',
        boxShadow: active ? '0 20px 40px rgba(77,67,83,0.08)' : 'none',
        pointerEvents: active ? 'auto' : 'none',
      }}
    >
      Watch Live Race <span style={{ fontSize: 16 }}>▶</span>
    </a>
  )
}

function GrayDisabledBtn({ label }: { label: string }) {
  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 12, padding: '16px 48px',
      background: '#e0e0e0', border: '2px solid #ccc', borderRadius: 70,
      fontFamily: 'Pretendard, sans-serif', fontSize: 17, fontWeight: 700,
      color: '#aaa', userSelect: 'none',
    }}>
      {label} <span style={{ fontSize: 16 }}>▶</span>
    </div>
  )
}

function WatchPreviousRaceBtn({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, width: '100%', height: 35,
        background: YELLOW, border: 'none', borderRadius: 70,
        fontFamily: KANIT, fontSize: 14, fontWeight: 500,
        color: '#000', cursor: 'pointer',
        opacity: hov ? 0.9 : 1, transition: 'opacity 0.15s',
      }}
    >
      Watch Previous Race
      <span style={{ fontSize: 14, color: '#333' }}>▶</span>
    </button>
  )
}

function FullResultPanel({
  result,
  cheeringFor,
  onClose,
}: {
  result: RaceResult
  cheeringFor: string | null
  onClose: () => void
}) {
  const isMobile = useIsMobile()
  const medals = ['🥇', '🥈', '🥉']
  const places = ['1st', '2nd', '3rd']
  const userPet = cheeringFor ? PETS.find(p => p.id === cheeringFor) : null
  const userWon = !!(cheeringFor && result.positions[0] === cheeringFor)

  return (
    <div style={{
      background: '#fff', borderRadius: 32,
      padding: isMobile ? '28px 20px' : '40px 48px',
      marginBottom: 40,
      boxShadow: '0 20px 40px rgba(77,67,83,0.08)',
      position: 'relative',
    }}>
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 20, right: 24,
          background: 'none', border: 'none',
          fontSize: 22, cursor: 'pointer', color: '#888',
          fontFamily: KANIT, lineHeight: 1,
        }}
      >
        ×
      </button>

      <h2 style={{
        fontFamily: KANIT, fontSize: 'clamp(20px,2.5vw,32px)',
        fontWeight: 700, color: DARK, marginBottom: 24,
      }}>
        Final Result — Round {result.number}
      </h2>

      {/* Standings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        {result.positions.map((petId, i) => {
          const pet = PETS.find(p => p.id === petId)
          if (!pet) return null
          return (
            <div key={petId} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '14px 20px', borderRadius: 16,
              background: i === 0 ? '#fff9e6' : '#fafafa',
              border: `1.5px solid ${i === 0 ? '#ffd643' : '#f0f0f0'}`,
            }}>
              <span style={{ fontSize: 22 }}>{medals[i]}</span>
              <span style={{ fontFamily: KANIT, fontSize: 13, color: '#aaa', minWidth: 32 }}>{places[i]}</span>
              <span style={{ fontFamily: KANIT, fontSize: 18, fontWeight: 600, color: DARK }}>{pet.name}</span>
            </div>
          )
        })}
      </div>

      {/* Dashed divider */}
      <div style={{ borderTop: '2px dashed #e0e0e0', marginBottom: 24 }} />

      {/* Your result */}
      {userPet ? (
        <div>
          <p style={{ fontFamily: KANIT, fontSize: 13, color: '#888', marginBottom: 14 }}>Your Result</p>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 14 }}>
            {[
              { label: 'Outcome', value: userWon ? 'Won'      : 'Lost',      good: userWon },
              { label: 'Result',  value: userWon ? '+0.5 SOL' : '-0.5 SOL',  good: userWon },
            ].map(({ label, value, good }) => (
              <div key={label}>
                <p style={{ fontFamily: KANIT, fontSize: 12, color: '#aaa', marginBottom: 2 }}>{label}</p>
                <p style={{ fontFamily: KANIT, fontSize: 22, fontWeight: 700, color: good ? '#735DFF' : '#FF3B5C' }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
          {userWon && (
            <p style={{ fontFamily: KANIT, fontSize: 14, color: PURPLE, fontWeight: 600 }}>
              🎉 You are part of the winning supporters!
            </p>
          )}
        </div>
      ) : (
        <p style={{ fontFamily: KANIT, fontSize: 14, color: '#aaa' }}>
          You didn&apos;t cheer in this race.
        </p>
      )}
    </div>
  )
}
