'use client'
import { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { TermsModal } from '@/components/landing/TermsModal'
import { LoginModal } from '@/components/landing/LoginModal'
import { DepositModal } from '@/components/landing/DepositModal'
import { AccountModal } from '@/components/landing/AccountModal'
import { HowItWorksModal } from '@/components/landing/HowItWorksModal'
import { HamsterCard, type PetForm } from '@/components/arena/HamsterCard'
import { CheerModal } from '@/components/arena/CheerModal'
import { HighlightSection } from '@/components/arena/HighlightSection'
import { PETS, SITE, type RaceResult } from '@/config/site'
import type { RaceWindow } from '@/lib/race-scheduler'
import { useIsMobile } from '@/components/ui/index'
import { saveCheerEntry, updateCheerResult } from '@/lib/cheer-history'
import { useRace } from '@/lib/hooks/useRace'

const KANIT = "var(--font-kanit), sans-serif"
const PURPLE = '#735DFF'
const YELLOW = '#FFE790'
const DARK   = '#000000'
const CORAL  = '#FF3B5C'
const TERMS_KEY = 'hamstar_terms_accepted'
const PROGRAM_ID = new PublicKey('7VumdroGjCGoY8skLuATZY6U7uMJeiE6fRaewdXLSVwQ')

type Modal = 'terms' | 'login' | 'deposit' | 'account' | 'howitworks' | null
type ArenaState = 'PREPARING' | 'OPEN' | 'LIVE' | 'FINISHED'
const POOL_TARGET = 20 // SOL target for pool progress bar

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
  const [cheeringAmount, setCheeringAmount] = useState<number>(0)
  const [cheerModal, setCheerModal]       = useState<{ petId: string; multiplier: number } | null>(null)
  const [petForms, setPetForms]           = useState<Record<string, PetForm | null>>({})
  const [userStreak, setUserStreak]       = useState(0)
  const isMobile = useIsMobile()
  const { connected, connecting, publicKey, disconnect } = useWallet()
  const { connection } = useConnection()
  const { currentRace: raceData, totalSol: liveTotalSol } = useRace()

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
  const isFrenzy = isPre && countdown.msLeft > 0 && countdown.msLeft < 60000

  useEffect(() => {
    if (!localStorage.getItem(TERMS_KEY)) setModal('terms')
  }, [])

  // Fetch on-chain streak for connected wallet
  useEffect(() => {
    if (!publicKey) { setUserStreak(0); return }
    const fetch = async () => {
      try {
        const [streakPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from('streak'), publicKey.toBytes()],
          PROGRAM_ID
        )
        const info = await connection.getAccountInfo(streakPDA)
        if (!info) { setUserStreak(0); return }
        // Layout: 8 disc + 32 user pubkey = offset 40 is streak u8
        setUserStreak(info.data[40] ?? 0)
      } catch {
        setUserStreak(0)
      }
    }
    fetch()
  }, [publicKey, connection])

  useEffect(() => {
    Promise.all(
      PETS.map(pet =>
        fetch(`/api/pets/${pet.id}/form`)
          .then(r => r.json())
          .then((data: PetForm) => ({ id: pet.id, data }))
          .catch(() => ({ id: pet.id, data: null }))
      )
    ).then(results => {
      const map: Record<string, PetForm | null> = {}
      results.forEach(({ id, data }) => { map[id] = data })
      setPetForms(map)
    })
  }, [])

  // Clear cheer selection when wallet changes (disconnect / switch wallet)
  useEffect(() => {
    setCheeringFor(null)
  }, [walletAddress])

  const handleDisconnect = async () => {
    try { await disconnect() } catch { /* ignore */ }
    setModal(null)
  }

  // Real support data from useRace, with fallback to equal split
  const totalPool = liveTotalSol || raceData?.entries.reduce((s, e) => s + e.totalSol, 0) || 0
  const getSupport = (petId: string) => {
    const entry = raceData?.entries.find(e => e.petId === petId)
    if (!entry || totalPool === 0) return { pct: 33, supporters: 0, sol: 0 }
    return {
      pct: Math.round((entry.totalSol / totalPool) * 100),
      supporters: entry.supporters ?? 0,
      sol: entry.totalSol,
    }
  }

  const handleCheer = (petId: string) => {
    if (!authed) { setModal('login'); return }
    const support = getSupport(petId)
    const multiplier = support.sol > 0 ? totalPool / support.sol : 1
    setCheerModal({ petId, multiplier })
  }

  const handleCheerConfirm = (petId: string, amountHamstar: number, txSignature?: string) => {
    setCheeringFor(petId)
    setCheeringAmount(amountHamstar)
    if (walletAddress) {
      const pet = PETS.find(p => p.id === petId)
      if (pet) {
        saveCheerEntry(walletAddress, {
          round: race.raceNumber,
          petId: pet.id,
          petName: pet.name,
          petColor: pet.color,
          petEmoji: pet.emoji,
          won: null,
          timestamp: Date.now(),
        })
        fetch('/api/user/cheer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress, petId, raceNumber: race.raceNumber, amountHamstar, txSignature }),
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
    ...(isFinishedState ? [{ label: 'Champion', value: winnerPet ? winnerPet.name : '—', purple: true }] : []),
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
              width: isMobile ? 'clamp(80px, 17vw, 115px)' : 'clamp(175px, 17vw, 260px)',
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
                  {totalPool.toFixed(2)} SOL
                </p>
              </div>
              <div style={{ width: '100%', height: 12, background: '#E9E9E9', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, (totalPool / POOL_TARGET) * 100)}%`,
                  height: '100%', background: PURPLE, borderRadius: 6,
                  transition: 'width 0.5s',
                }} />
              </div>
              <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 12, color: '#8A8A8A', marginTop: 6 }}>
                {totalPool.toFixed(2)} / {POOL_TARGET} SOL target
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
              const support = getSupport(pet.id)
              const isDarkHorse = support.pct < 20
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
                  totalPool={totalPool}
                  isWinner={isFinishedState && effectiveResult?.positions[0] === pet.id}
                  isCheering={cheeringFor === pet.id}
                  isDarkHorse={isDarkHorse}
                  form={petForms[pet.id] ?? null}
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
              amount={cheeringAmount}
              supportPct={getSupport(cheeringFor).pct}
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
                <YellowBtn
                  label="View Highlights"
                  onClick={() => document.getElementById('highlight')?.scrollIntoView({ behavior: 'smooth' })}
                />
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
      {cheerModal && (
        <CheerModal
          petId={cheerModal.petId}
          petName={PETS.find(p => p.id === cheerModal.petId)?.name ?? cheerModal.petId}
          multiplier={cheerModal.multiplier}
          streakCount={userStreak}
          onClose={() => setCheerModal(null)}
          onConfirm={(petId, amount, txSig) => { handleCheerConfirm(petId, amount, txSig) }}
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
  amountHamstar: number
  petName: string
}

const BIG_CHEER_HAMSTAR = 1000

const MOCK_WALLETS = ['7xK3...f3mP', '2mPa...K7r2', '9rLb...N5t4', '4qZn...a8Bx', 'Ew3k...p9Qm', 'Rj7c...c2Lm', 'Xb9m...t6Wr']
const MOCK_AMOUNTS = [50, 100, 150, 200, 500, 1000, 2000, 5000, 300]

function CheerFeed({ isMobile }: { isMobile: boolean }) {
  const [entries, setEntries] = useState<CheerEntry[]>([])

  useEffect(() => {
    const petNames = PETS.map(p => p.name)

    const addEntry = () => {
      const wallet = MOCK_WALLETS[Math.floor(Math.random() * MOCK_WALLETS.length)]
      const amount = MOCK_AMOUNTS[Math.floor(Math.random() * MOCK_AMOUNTS.length)]
      const petName = petNames[Math.floor(Math.random() * petNames.length)]
      setEntries(prev => [
        { id: `${Date.now()}-${Math.random()}`, wallet, amountHamstar: amount, petName },
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
          const isBig = e.amountHamstar >= BIG_CHEER_HAMSTAR
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
                {e.amountHamstar >= 1000 ? `${e.amountHamstar / 1000}k` : e.amountHamstar} $HAMSTAR → {e.petName}
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

function CheeringCard({ petId, amount, supportPct, isMobile }: { petId: string; amount: number; supportPct: number; isMobile: boolean }) {
  const pet = PETS.find(p => p.id === petId)
  if (!pet) return null
  const amountDisplay = amount >= 1000 ? `${(amount / 1000).toFixed(1)}k` : String(Math.round(amount))
  const rows = [
    { label: 'You\'re cheering for', value: pet.name },
    { label: 'Your Support',         value: amount > 0 ? `${amountDisplay} $HAMSTAR` : '—' },
    { label: 'Share of Pool',        value: `${supportPct}%` },
  ]
  return (
    <div style={{
      background: '#fff', borderRadius: 20,
      padding: isMobile ? '16px 20px' : '20px 30px',
      marginBottom: 20,
      boxShadow: '0 4px 20px rgba(77,67,83,0.08)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
            <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: 14, color: '#8A8A8A', margin: 0 }}>{label}</p>
            <p style={{ fontFamily: KANIT, fontWeight: 700, fontSize: 14, color: DARK, margin: 0 }}>{value}</p>
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
        background: hov ? '#F5D850' : YELLOW, border: 'none', borderRadius: 48.5,
        fontFamily: KANIT, fontSize: 'clamp(14px, 1.5vw, 17px)', fontWeight: 700,
        color: DARK, cursor: 'pointer',
        transform: hov ? 'scale(1.02)' : 'scale(1)', transition: 'all 0.15s ease-out',
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
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 12, padding: '16px 48px',
        background: active ? (hov ? '#F5D850' : YELLOW) : (hov ? PURPLE : 'transparent'),
        border: active ? 'none' : `2px solid ${PURPLE}`,
        borderRadius: 48.5, textDecoration: 'none',
        fontFamily: KANIT, fontSize: 'clamp(14px, 1.5vw, 17px)', fontWeight: 700,
        color: active ? DARK : (hov ? '#fff' : PURPLE),
        cursor: 'pointer',
        transform: hov ? 'scale(1.02)' : 'scale(1)', transition: 'all 0.15s ease-out',
      }}
    >
      {active ? 'Watch Live Race' : 'View Stream'}
    </a>
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
                {pet.name}
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
        {row('Your Reward', cheeringFor ? (userWon ? 'Payout pending' : '—') : '—')}
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
