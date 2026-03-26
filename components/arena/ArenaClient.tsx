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
  isLive?: boolean
  streamUrl?: string
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

export function ArenaClient({ race, lastResult, isLive: isLiveProp, streamUrl: streamUrlProp }: ArenaClientProps) {
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
  const effectiveIsLive = isLiveProp ?? SITE.stream.isLive
  const effectiveStreamUrl = streamUrlProp ?? SITE.stream.url

  const isFinished = lastResult?.number === race.raceNumber
  const arenaState: ArenaState = isFinished
    ? 'FINISHED'
    : race.status === 'LIVE'
      ? (effectiveIsLive ? 'LIVE' : 'OPEN')
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
  const cheeringLabel = { PREPARING: '—', OPEN: 'Open', LIVE: 'Closed', FINISHED: 'Closed' }[arenaState]
  const winnerPet     = isFinished && lastResult ? PETS.find(p => p.id === lastResult.positions[0]) : null

  const showPoolBar = arenaState === 'OPEN' || arenaState === 'LIVE'
  const showCountdown = !isFinished

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; }
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

      <main style={{ background: '#f8f9fa', minHeight: '100vh', paddingTop: 87 }}>

        {/* Hero header */}
        <div style={{ textAlign: 'center', padding: isMobile ? '40px 16px 24px' : '60px 24px 32px' }}>
          <h1 style={{
            fontFamily: KANIT, fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 700, color: DARK, marginBottom: 12,
          }}>
            Welcome to Hamstar Arena
          </h1>
          <p style={{ fontFamily: KANIT, fontSize: 'clamp(14px,1.6vw,20px)', color: '#555', maxWidth: 600, margin: '0 auto' }}>
            {arenaState === 'OPEN'
              ? 'Cheering is open! Pick your hamster and add your support before the race starts.'
              : arenaState === 'LIVE'
                ? 'The race is live! Watch your hamster run for glory.'
                : arenaState === 'FINISHED'
                  ? `Round ${race.raceNumber} is over. See who took the crown.`
                  : 'The arena is preparing for the next race. Cheering will open soon.'}
          </p>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(16px,3vw,48px)' }}>

          {/* Status card */}
          <div style={{
            background: '#fff', borderRadius: 32,
            padding: isMobile ? '20px' : '28px 48px',
            boxShadow: '0 20px 40px rgba(77,67,83,0.06)',
            marginBottom: 20,
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile
                ? '1fr 1fr'
                : `repeat(${isFinished && winnerPet ? 4 : 3}, 1fr)`,
              gap: isMobile ? 16 : 0,
            }}>
              {([
                { label: 'Arena Status', value: statusLabel,                    purple: false },
                { label: 'Race Round',   value: `Round ${race.raceNumber}`,     purple: false },
                { label: 'Cheering',     value: cheeringLabel,                   purple: false },
                ...(isFinished && winnerPet
                  ? [{ label: 'Champion', value: `${winnerPet.name} 🏆`, purple: true }]
                  : []),
              ] as { label: string; value: string; purple: boolean }[]).map(({ label, value, purple }, i, arr) => (
                <div key={label} style={{
                  textAlign: isMobile ? 'left' : (i === 0 ? 'left' : i === arr.length - 1 ? 'right' : 'center'),
                  padding: isMobile ? 0 : '0 24px',
                  borderLeft: (!isMobile && i > 0) ? '1px solid #f0f0f0' : 'none',
                }}>
                  <p style={{ fontFamily: KANIT, fontSize: 'clamp(12px,1.2vw,15px)', color: '#888', marginBottom: 4 }}>
                    {label}
                  </p>
                  <p style={{
                    fontFamily: KANIT, fontSize: 'clamp(16px,1.8vw,24px)', fontWeight: 600,
                    color: purple ? PURPLE : DARK,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Countdown */}
          {showCountdown && (
            <div style={{
              background: '#fff', borderRadius: 24,
              padding: '16px 32px', marginBottom: 20,
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(77,67,83,0.05)',
            }}>
              <p style={{ fontFamily: KANIT, fontSize: 13, color: '#888', marginBottom: 4 }}>
                {race.status === 'LIVE' ? 'Race Ends In' : 'Cheering Opens In'}
              </p>
              <p style={{
                fontFamily: KANIT, fontSize: 'clamp(28px,4vw,48px)',
                fontWeight: 700, color: DARK, fontVariantNumeric: 'tabular-nums',
              }}>
                {countdown}
              </p>
            </div>
          )}

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
              <div style={{ width: '100%', height: 12, background: '#f0f0f0', borderRadius: 6, overflow: 'hidden' }}>
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
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
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
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 16, marginBottom: 40,
          }}>
            {arenaState === 'FINISHED' ? (
              <>
                <YellowBtn
                  label="Watch Previous Race"
                  suffix="▼"
                  onClick={() => document.getElementById('highlight')?.scrollIntoView({ behavior: 'smooth' })}
                />
                <YellowBtn label="View Full Result" suffix="▶" onClick={() => setShowResult(s => !s)} />
              </>
            ) : (
              <>
                <WatchLiveBtn active={arenaState === 'OPEN' || arenaState === 'LIVE'} href={effectiveStreamUrl} />
                <GrayDisabledBtn label="View Full Result" />
              </>
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
        gap: 12, padding: '22px 32px',
        background: YELLOW, border: 'none', borderRadius: 70,
        fontFamily: KANIT, fontSize: 'clamp(16px,2vw,22px)', fontWeight: 700,
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
        gap: 12, padding: '22px 32px',
        background: active ? YELLOW : '#e0e0e0',
        borderRadius: 70, textDecoration: 'none',
        fontFamily: KANIT, fontSize: 'clamp(16px,2vw,22px)', fontWeight: 700,
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
      gap: 12, padding: '22px 32px',
      background: '#e0e0e0', borderRadius: 70,
      fontFamily: KANIT, fontSize: 'clamp(16px,2vw,22px)', fontWeight: 700,
      color: '#aaa', userSelect: 'none',
    }}>
      {label} <span style={{ fontSize: 16 }}>▶</span>
    </div>
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
                <p style={{ fontFamily: KANIT, fontSize: 22, fontWeight: 700, color: good ? '#00C566' : '#FF3B3B' }}>
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
