'use client'
import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
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
import { saveCheerEntry, updateCheerResult } from '@/lib/cheer-history'

const KANIT = "var(--font-kanit), sans-serif"
const PURPLE = '#735DFF'
const YELLOW = '#FFE790'
const DARK   = '#000000'
const CORAL  = '#FF3B5C'
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
  return {
    display: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`,
    msLeft: timeLeft,
  }
}

export function ArenaClient({ race, lastResult }: ArenaClientProps) {
  const [modal, setModal]                 = useState<Modal>(null)
  const [cheeringFor, setCheeringFor]     = useState<string | null>(null)
  const isMobile = useIsMobile()
  const { connected, connecting, publicKey, disconnect } = useWallet()

  const authed = connected
  const walletAddress = publicKey?.toString() ?? ''

  // Derive arena state:
  // - FINISHED: lastResult exists for this race round
  // - LIVE: race window is LIVE + stream is live (race in progress, cheering closed)
  // - OPEN: race window is LIVE + stream is not live (cheering open)
  // - PREPARING: race window is UPCOMING
  const isFinished = lastResult?.number === race.raceNumber
  const derivedArenaState: ArenaState = isFinished
    ? 'FINISHED'
    : race.status === 'LIVE'
      ? (SITE.stream.isLive ? 'LIVE' : 'OPEN')
      : 'PREPARING'
  const arenaState: ArenaState = derivedArenaState

  // 3 display states: PRE (PREPARING + OPEN), LIVE, FINISHED
  const isPre           = arenaState === 'PREPARING' || arenaState === 'OPEN'
  const isLive          = arenaState === 'LIVE'
  const isFinishedState = arenaState === 'FINISHED'
  // HamsterCard receives 'OPEN' for any pre-race state so it shows cheer button + support bar
  const cardState: ArenaState = isPre ? 'OPEN' : arenaState

  const effectiveResult = isFinishedState ? lastResult : lastResult

  const countdownTarget = race.status === 'LIVE' ? race.endsAt.getTime() : race.startsAt.getTime()
  const countdown = useCountdown(countdownTarget)
  const isFrenzy = isPre // DEV: always on — change back to: isPre && countdown.msLeft > 0 && countdown.msLeft < 60000

  useEffect(() => {
    if (!localStorage.getItem(TERMS_KEY)) setModal('terms')
  }, [])

  // Clear cheer selection when wallet changes (disconnect / switch wallet)
  useEffect(() => {
    setCheeringFor(null)
  }, [walletAddress])

  const handleDisconnect = async () => {
    try { await disconnect() } catch { /* ignore */ }
    setModal(null)
  }

  const handleCheer = (petId: string) => {
    if (!authed) { setModal('login'); return }
    setCheeringFor(petId)
    if (walletAddress) {
      const pet = PETS.find(p => p.id === petId)
      if (pet) {
        // Write to localStorage for instant local feedback
        saveCheerEntry(walletAddress, {
          round: race.raceNumber,
          petId: pet.id,
          petName: pet.name,
          petColor: pet.color,
          petEmoji: pet.emoji,
          won: null,
          timestamp: Date.now(),
        })
        // Persist to DB (fire-and-forget)
        fetch('/api/user/cheer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress, petId, raceNumber: race.raceNumber }),
        }).catch(() => { /* non-critical */ })
      }
    }
  }

  // Update cheer result when race finishes
  useEffect(() => {
    if (isFinishedState && lastResult && walletAddress) {
      // Update localStorage
      updateCheerResult(walletAddress, lastResult.number, lastResult.positions[0])
      // Update DB (fire-and-forget) — uses raceNumber to resolve raceId server-side
      fetch('/api/user/cheer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raceNumber: lastResult.number, winnerPetId: lastResult.positions[0] }),
      }).catch(() => { /* non-critical */ })
    }
  }, [isFinishedState, lastResult, walletAddress])

  const statusLabel = isFinishedState ? 'Race Finished' : isLive ? 'Race In Progress' : 'Arena Open'
  const winnerPet   = isFinishedState && effectiveResult ? PETS.find(p => p.id === effectiveResult.positions[0]) : null

  const showPoolBar = true // always visible across all states

  const statusRows: { label: string; value: string; purple?: boolean; coral?: boolean }[] = [
    { label: 'Arena Status',       value: statusLabel },
    { label: 'Current Race Round', value: `Round ${race.raceNumber}` },
    { label: isLive || isFinishedState ? 'Cheering' : 'Cheering Closes In',
      value: isLive || isFinishedState ? 'Closed' : countdown.display,
      coral: isFrenzy },
    ...(isFinishedState ? [{ label: 'Champion', value: winnerPet ? `${winnerPet.name} 🏆` : '—', purple: true }] : []),
  ]

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.8)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes frenzyGlow { 0%,100%{border-color:#FF3B5C} 50%{border-color:rgba(255,59,92,0.3)} }
      `}</style>

      <LandingNav
        lightBg
        authed={authed}
        connecting={!authed && connecting}
        walletAddress={walletAddress || undefined}
        onLoginClick={() => setModal('login')}
        onDepositClick={() => setModal('deposit')}
        onAccountClick={() => setModal('account')}
        onHowItWorksClick={() => setModal('howitworks')}
      />

      <main style={{ background: '#F8F9FA', minHeight: '100vh', paddingTop: 87, position: 'relative' }}>

        {/* Glow blobs — positioned at corners with no negative offsets so they never clip */}
        <div style={{ position: 'absolute', top: '55vh', left: 0, width: 700, height: 700, borderRadius: '50%', background: 'rgba(252,212,0,0.22)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: 200, right: 0, width: 600, height: 600, borderRadius: '50%', background: 'rgba(115,93,255,0.14)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />

        {/* Hero header */}
        <div style={{ textAlign: 'center', padding: isMobile ? '40px 16px 24px' : '60px 24px 32px' }}>
          <h1 style={{
            fontFamily: KANIT, fontSize: 'clamp(20px, 2.5vw, 24px)',
            fontWeight: 500, color: '#000', marginBottom: 8,
          }}>
            Welcome to Hamstar Arena
          </h1>
          <p style={{
            fontFamily: 'Pretendard, sans-serif',
            fontSize: 'clamp(14px, 1.5vw, 16px)',
            fontWeight: 400,
            color: isFrenzy ? CORAL : '#8A8A8A',
            maxWidth: 473, margin: '0 auto',
            transition: 'color 0.3s',
          }}>
            {isPre
              ? isFrenzy
                ? 'Final seconds — lock in your pick now!'
                : 'Cheer for your favourite racer before the countdown ends.'
              : isLive
                ? 'The race is live. Watch live and see who takes the wheel.'
                : 'The race has finished. Here\'s the result.'}
          </p>
        </div>

        <div style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Left decorative hamster — desktop: tracks content center; mobile: peeks from left wall */}
          <img
            src="/images/hamster-racer.png"
            alt=""
            aria-hidden
            style={{
              position: 'absolute',
              left: isMobile ? -30 : 'calc(50% - 760px)',
              top: isMobile ? undefined : 290,
              bottom: isMobile ? 80 : undefined,
              width: isMobile ? 'clamp(100px, 22vw, 140px)' : 'clamp(220px, 22vw, 320px)',
              height: 'auto',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '0 16px' : '0 24px', position: 'relative', zIndex: 1 }}>

          {/* Status card — labels left, values right */}
          <div style={{
            background: '#fff', borderRadius: 20,
            padding: isMobile ? '16px 20px' : '20px 30px',
            boxShadow: '0 4px 20px rgba(77,67,83,0.08)',
            border: isFrenzy ? '2px solid #FF3B5C' : '2px solid transparent',
            backdropFilter: 'blur(20px)',
            marginBottom: 20,
            animation: isFrenzy ? 'frenzyGlow 1.2s ease-in-out infinite' : 'none',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {statusRows.map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
                  <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: 14, color: r.purple ? PURPLE : r.coral ? CORAL : '#8A8A8A', margin: 0 }}>
                    {r.label}
                  </p>
                  <p style={{ fontFamily: KANIT, fontWeight: 500, fontSize: 14, color: r.purple ? PURPLE : r.coral ? CORAL : '#000', margin: 0, fontVariantNumeric: 'tabular-nums', flexShrink: 0, animation: r.coral ? 'pulse 1s ease-in-out infinite' : 'none' }}>
                    {r.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pool description */}
          {showPoolBar && (
            <p style={{
              fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: 14,
              color: '#8A8A8A', textAlign: 'center', marginBottom: 12,
            }}>
              Supporters of the winning racer share this pool.
            </p>
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
              <div style={{ width: '100%', height: 12, background: '#E9E9E9', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, (MOCK_TOTAL_SOL / MOCK_POOL_TARGET) * 100)}%`,
                  height: '100%', background: PURPLE, borderRadius: 6,
                  transition: 'width 0.5s',
                }} />
              </div>
              <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 12, color: '#8A8A8A', marginTop: 6 }}>
                {MOCK_TOTAL_SOL} / {MOCK_POOL_TARGET} SOL target
              </p>
            </div>
          )}

          {/* Hamster cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 12,
            marginBottom: 32,
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
                  arenaState={cardState}
                  supportPct={support.pct}
                  supporters={support.supporters}
                  supportPool={support.sol}
                  totalPool={MOCK_TOTAL_SOL}
                  isWinner={isFinishedState && effectiveResult?.positions[0] === pet.id}
                  isCheering={cheeringFor === pet.id}
                  onCheer={() => handleCheer(pet.id)}
                />
              )
            })}
          </div>

          {/* Live cheer feed — only during pick window */}
          {isPre && <CheerFeed isMobile={!!isMobile} />}

          {/* "You're cheering for" summary card */}
          {authed && cheeringFor && (isPre || isLive) && (
            <CheeringCard
              petId={cheeringFor}
              supportPct={MOCK_SUPPORT[cheeringFor]?.pct ?? 33}
              isMobile={!!isMobile}
            />
          )}

          {/* LIVE: reminder to return for result */}
          {isLive && (
            <p style={{
              fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: 14,
              color: '#8A8A8A', textAlign: 'center', marginBottom: 16,
            }}>
              Return here after the race to see the winner.
            </p>
          )}

          {/* Bottom CTAs */}
          <div style={{ marginBottom: isFinishedState ? 20 : 40 }}>
            {isFinishedState ? (
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
                <YellowBtn
                  label="Watch Previous Race"
                  onClick={() => document.getElementById('highlight')?.scrollIntoView({ behavior: 'smooth' })}
                />
                <YellowBtn
                  label="View Full Result"
                  onClick={() => document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' })}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
                <WatchLiveBtn active={isLive} href={SITE.stream.url} />
                <GrayDisabledBtn label="View Full Result" />
              </div>
            )}
          </div>

          {/* Inline result section — always visible when FINISHED */}
          {isFinishedState && effectiveResult && (
            <div id="result-section" style={{ marginBottom: 40 }}>
              <ResultSection
                result={effectiveResult}
                cheeringFor={cheeringFor}
                isMobile={!!isMobile}
              />
            </div>
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
      {modal === 'login'      && <LoginModal onClose={() => setModal(null)} />}
      {modal === 'deposit'    && <DepositModal address={walletAddress} onClose={() => setModal(null)} onConnectWallet={() => setModal('login')} />}
      {modal === 'account'    && (
        <AccountModal
          walletAddress={walletAddress || undefined}
          onClose={() => setModal(null)}
          onDeposit={() => setModal('deposit')}
          onDisconnect={handleDisconnect}
          onConnectWallet={() => setModal('login')}
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

// ─── Cheer Feed ─────────────────────────────────────────────────────────────

interface CheerEntry {
  id: string
  wallet: string
  amountSol: number
  petName: string
}

const BIG_CHEER_SOL = 1.0

const MOCK_WALLETS = ['7xK3...f3mP', '2mPa...K7r2', '9rLb...N5t4', '4qZn...a8Bx', 'Ew3k...p9Qm', 'Rj7c...c2Lm', 'Xb9m...t6Wr']
const MOCK_AMOUNTS = [0.05, 0.08, 0.1, 0.15, 0.25, 0.5, 1.0, 2.0, 0.3]

function CheerFeed({ isMobile }: { isMobile: boolean }) {
  const [entries, setEntries] = useState<CheerEntry[]>([])

  useEffect(() => {
    const petNames = PETS.map(p => p.name)

    const addEntry = () => {
      const wallet = MOCK_WALLETS[Math.floor(Math.random() * MOCK_WALLETS.length)]
      const amount = MOCK_AMOUNTS[Math.floor(Math.random() * MOCK_AMOUNTS.length)]
      const petName = petNames[Math.floor(Math.random() * petNames.length)]
      setEntries(prev => [
        { id: `${Date.now()}-${Math.random()}`, wallet, amountSol: amount, petName },
        ...prev,
      ].slice(0, 20))
    }

    // Seed with a few initial entries
    addEntry(); addEntry(); addEntry()

    // Trickle in new entries at random intervals (4–12s)
    // TODO: replace with supabase.subscribeToDonations(raceId, ...) when real raceId is available
    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      timer = setTimeout(() => { addEntry(); schedule() }, Math.random() * 8000 + 4000)
    }
    schedule()
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{
      background: '#fff',
      borderRadius: 20,
      boxShadow: '0 4px 20px rgba(77,67,83,0.08)',
      padding: isMobile ? '16px 20px' : '20px 30px',
      marginBottom: 20,
    }}>
      <p style={{ fontFamily: KANIT, fontWeight: 500, fontSize: 14, color: DARK, marginBottom: 12 }}>
        Live Cheers
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', maxHeight: isMobile ? 160 : 200, overflowY: 'auto' }}>
        {entries.length === 0 && (
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 13, color: '#8A8A8A' }}>
            Waiting for cheers...
          </p>
        )}
        {entries.map((e, i) => {
          const isBig = e.amountSol >= BIG_CHEER_SOL
          return (
            <div key={e.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '7px 10px',
              borderRadius: 10,
              background: isBig ? 'rgba(115,93,255,0.08)' : 'transparent',
              animation: i === 0 ? 'slideDown 0.25s ease-out' : 'none',
            }}>
              <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 13, color: '#8A8A8A' }}>
                {e.wallet}
              </span>
              <span style={{ fontFamily: KANIT, fontWeight: 500, fontSize: 13, color: DARK, display: 'flex', alignItems: 'center', gap: 6 }}>
                {e.amountSol} SOL → {e.petName}
                {isBig && (
                  <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 11, color: PURPLE }}>
                    ← BIG
                  </span>
                )}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

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
      <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 13, color: '#8A8A8A', marginBottom: 14 }}>
        You&apos;re cheering for
      </p>
      <div style={{ display: 'flex', gap: isMobile ? 20 : 40, flexWrap: 'wrap' }}>
        {[
          { label: 'Racer',         value: pet.name   },
          { label: 'Your Support',  value: '0.5 SOL'  },
          { label: 'Share of Pool', value: `${supportPct}%` },
        ].map(({ label, value }) => (
          <div key={label}>
            <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 11, color: '#8A8A8A', marginBottom: 2 }}>{label}</p>
            <p style={{ fontFamily: KANIT, fontSize: 18, fontWeight: 600, color: DARK }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function YellowBtn({ label, onClick }: { label: string; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 12, padding: '16px 48px',
        background: YELLOW, border: '2px solid #000', borderRadius: 48.5,
        fontFamily: KANIT, fontSize: 'clamp(14px, 1.5vw, 17px)', fontWeight: 700,
        color: DARK, cursor: 'pointer',
        opacity: hov ? 0.9 : 1, transition: 'opacity 0.15s',
        boxShadow: '0 20px 40px rgba(77,67,83,0.08)',
      }}
    >
      {label}
    </button>
  )
}

function WatchLiveBtn({ active, href }: { active: boolean; href: string }) {
  const [hov, setHov] = useState(false)
  return (
    <a
      href={active ? href : undefined}
      target={active ? '_blank' : undefined}
      rel="noopener noreferrer"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 12, padding: '16px 48px',
        background: YELLOW,
        border: 'none',
        borderRadius: 48.5, textDecoration: 'none',
        fontFamily: KANIT, fontSize: 'clamp(14px, 1.5vw, 17px)', fontWeight: 700,
        color: DARK,
        cursor: active ? 'pointer' : 'default',
        opacity: hov && active ? 0.9 : 1, transition: 'opacity 0.15s',
        boxShadow: '0 4px 16px rgba(255,231,144,0.4)',
      }}
    >
      Watch Live Race
    </a>
  )
}

function GrayDisabledBtn({ label }: { label: string }) {
  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 12, padding: '16px 48px',
      background: '#e8e8e8', border: 'none', borderRadius: 48.5,
      fontFamily: KANIT, fontSize: 'clamp(14px, 1.5vw, 17px)', fontWeight: 700,
      color: '#aaa', userSelect: 'none',
    }}>
      {label}
    </div>
  )
}

function ResultSection({
  result,
  cheeringFor,
  isMobile,
}: {
  result: RaceResult
  cheeringFor: string | null
  isMobile: boolean
}) {
  const places = ['1st', '2nd', '3rd']
  const medals = ['🥇', '🥈', '🥉']
  const userWon = !!(cheeringFor && result.positions[0] === cheeringFor)

  const row = (label: string, value: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: 14, color: '#8A8A8A', margin: 0 }}>{label}</p>
      <p style={{ fontFamily: KANIT, fontWeight: 500, fontSize: 14, color: '#000', margin: 0 }}>{value}</p>
    </div>
  )

  return (
    <div style={{
      background: '#fff', borderRadius: 20,
      padding: isMobile ? '20px' : '24px 30px',
      boxShadow: '0 4px 20px rgba(77,67,83,0.08)',
    }}>
      {/* Final Result header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: 14, color: '#8A8A8A', margin: 0 }}>Final Result</p>
        <p style={{ fontFamily: KANIT, fontWeight: 500, fontSize: 14, color: '#000', margin: 0 }}>Round {result.number}</p>
      </div>

      {/* Standings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {result.positions.map((petId, i) => {
          const pet = PETS.find(p => p.id === petId)
          if (!pet) return null
          return (
            <div key={petId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: 14, color: '#8A8A8A', margin: 0 }}>{places[i]}</p>
              <p style={{ fontFamily: KANIT, fontWeight: 500, fontSize: 14, color: '#000', margin: 0 }}>
                {pet.name} {medals[i]}
              </p>
            </div>
          )
        })}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1.5px solid #E9E9E9', marginBottom: 16 }} />

      {/* Your Result */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: cheeringFor ? 14 : 0 }}>
        {row('Your Result', cheeringFor ? (userWon ? 'Won' : 'Lost') : '—')}
        {row('Your Reward', cheeringFor ? (userWon ? '+0.5 SOL' : '—') : '—')}
      </div>

      {/* Win message */}
      {cheeringFor && userWon && (
        <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 14, color: PURPLE, marginTop: 6 }}>
          You are part of the winning supporters!
        </p>
      )}
    </div>
  )
}
