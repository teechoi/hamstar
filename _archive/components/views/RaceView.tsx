// components/views/RaceView.tsx
'use client'
import { T, RaceBar, Tag, LivePulse, LimeButton, OutlineButton, CheckerBar, useIsMobile } from '../ui'
import { SITE, PETS, RACE_HISTORY } from '@/config/site'
import type { Pet, RaceResult } from '@/config/site'
import { HamsterRaceAnimation } from '@/components/HamsterRaceAnimation'

export function RaceView() {
  const { stream } = SITE
  const isLive = stream.isLive
  const isMobile = useIsMobile() ?? false

  return (
    <div>
      {/* ── HERO ── */}
      <div style={{ background: T.text, padding: isMobile ? '0 16px 32px' : '0 28px 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -40, fontSize: isMobile ? 120 : 300, fontWeight: 900, color: T.lime, opacity: 0.04, lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>
          {String(stream.raceNumber).padStart(2, '0')}
        </div>
        <div style={{ height: 6, background: T.lime, margin: isMobile ? '0 -16px 28px' : '0 -28px 40px' }} />

        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <Tag label="Season 01" color={T.lime} bg="#A6FF0022" border={T.lime} />
            <Tag
              label={isLive ? '⚡ Race Live' : '⏱ Race Upcoming'}
              color={isLive ? T.green : T.blue}
              bg={isLive ? '#E6FFF344' : T.blueSoft}
              border={isLive ? T.green : T.blue}
            />
          </div>

          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? 36 : 'clamp(52px, 5vw, 80px)', fontWeight: 900, color: T.card, lineHeight: 1, marginBottom: 14, letterSpacing: isMobile ? -1 : -2 }}>
            WHO WILL BE{isMobile ? ' ' : <br />}<span style={{ color: T.lime }}>THE HAMSTAR?</span>
          </h1>
          <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
            Race #{String(stream.raceNumber).padStart(2, '0')}
          </div>
          <p style={{ fontSize: isMobile ? 14 : 16, color: '#8892BB', marginBottom: 24, maxWidth: 480, lineHeight: 1.6 }}>
            Three enter. One earns the wheel. The fastest hamster the internet has ever seen — watch live on pump.fun.
          </p>

          {/* Racers row */}
          <div style={{ display: 'flex', gap: isMobile ? 10 : 16, marginBottom: 28, flexWrap: 'wrap' }}>
            {PETS.map((pet, i) => (
              <div key={pet.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF0F', border: `2px solid ${pet.color}`, borderRadius: 12, padding: isMobile ? '8px 12px' : '10px 16px', animation: 'petIdle 3s ease-in-out infinite', animationDelay: `${i * 0.5}s` }}>
                <span style={{ fontSize: isMobile ? 22 : 28 }}>{pet.emoji}</span>
                <div>
                  <div style={{ fontSize: isMobile ? 12 : 14, fontWeight: 900, color: T.card }}>{pet.name}</div>
                  <div style={{ fontSize: 10, color: pet.color, fontWeight: 700, letterSpacing: 1 }}>#{pet.number}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href={stream.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <LimeButton>{isLive ? '▶ Watch Live Now' : '🔔 View on pump.fun'}</LimeButton>
            </a>
            {RACE_HISTORY.length > 0 && (
              <OutlineButton color="#FFFFFF44">📋 Race History</OutlineButton>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? '24px 16px' : '36px 28px' }}>

        {/* ── STREAM SECTION ── */}
        <div style={{ borderRadius: 16, overflow: 'hidden', border: `2px solid ${T.text}`, marginBottom: 24 }}>
          <div style={{ background: T.text, minHeight: isMobile ? 260 : 340, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            {/* Grid bg */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${T.blue}12 1px, transparent 1px), linear-gradient(90deg, ${T.blue}12 1px, transparent 1px)`, backgroundSize: '36px 36px' }} />

            {isLive ? (
              <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: isMobile ? '24px 16px' : '32px 24px' }}>
                <div style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)' }}>
                  <LivePulse />
                </div>
                <div style={{ display: 'flex', gap: isMobile ? 16 : 32, justifyContent: 'center', marginBottom: isMobile ? 20 : 32, marginTop: 24 }}>
                  {PETS.map((pet, i) => (
                    <div key={pet.id} style={{ textAlign: 'center', animation: 'raceBounce 1.6s ease-in-out infinite', animationDelay: `${i * 0.4}s` }}>
                      <div style={{ width: isMobile ? 56 : 80, height: isMobile ? 56 : 80, borderRadius: isMobile ? 14 : 20, background: pet.color, border: `3px solid ${T.card}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? 30 : 44 }}>
                        {pet.image ? <img src={pet.image} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: isMobile ? 11 : 17 }} /> : pet.emoji}
                      </div>
                      <div style={{ fontSize: 11, color: T.card, fontWeight: 800, marginTop: 6 }}>{pet.name}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: isMobile ? 13 : 15, color: '#8892BB', marginBottom: 16 }}>The wheel doesn't lie. Race is live now.</div>
                <a href={stream.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: isMobile ? '12px 24px' : '14px 36px', background: T.lime, borderRadius: 10, color: T.limeText, fontWeight: 900, fontSize: isMobile ? 13 : 15, textDecoration: 'none', letterSpacing: 0.3 }}>
                  ▶ Watch Live on pump.fun
                </a>
              </div>
            ) : (
              <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: isMobile ? '24px 16px' : '32px 24px' }}>
                <div style={{ display: 'flex', gap: isMobile ? 16 : 24, justifyContent: 'center', marginBottom: 24, opacity: 0.4 }}>
                  {PETS.map((pet, i) => (
                    <div key={pet.id} style={{ animation: 'petIdle 3s ease-in-out infinite', animationDelay: `${i * 0.6}s` }}>
                      <div style={{ width: isMobile ? 48 : 64, height: isMobile ? 48 : 64, borderRadius: isMobile ? 12 : 16, background: pet.color + '44', border: `2px solid ${pet.color}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? 26 : 36 }}>{pet.emoji}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: isMobile ? 16 : 20, color: T.card, fontWeight: 900, marginBottom: 8 }}>Race #{stream.raceNumber} — The Wheel Awaits</div>
                <div style={{ fontSize: 13, color: '#8892BB', marginBottom: 20 }}>Three enter. One earns the title. Follow on pump.fun to get notified when it goes live.</div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a href={stream.url} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: T.lime, borderRadius: 10, color: T.limeText, fontWeight: 900, fontSize: 13, textDecoration: 'none' }}>
                    🔔 Follow on pump.fun
                  </a>
                  {stream.replayUrl && (
                    <a href={stream.replayUrl} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', gap: 8, padding: '12px 24px', background: '#FFFFFF12', border: '1px solid #FFFFFF33', borderRadius: 10, color: T.card, fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
                      ▶ Watch Last Replay
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
          <div style={{ background: T.lime, height: 5 }} />
        </div>

        {/* ── ASCII OBSTACLE COURSE ── */}
        <div style={{ marginBottom: 24, background: T.text, border: `2px solid ${T.lime}33`, borderRadius: 16, padding: isMobile ? '16px 12px' : '24px 28px', overflowX: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: T.lime, opacity: 0.5, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
            Live Simulation
          </div>
          <HamsterRaceAnimation />
        </div>

        {/* ── PET RACE CARDS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 12 : 16, marginBottom: 24 }}>
          {PETS.map((pet, i) => (
            <PetRaceCard key={pet.id} pet={pet} isMobile={isMobile} />
          ))}
        </div>

        {/* ── PAST RACES ── */}
        {RACE_HISTORY.length > 0 && <PastRaces isMobile={isMobile} />}
      </div>
    </div>
  )
}

function PetRaceCard({ pet, isMobile }: { pet: Pet; isMobile: boolean }) {
  return (
    <div style={{ background: T.card, border: `2px solid ${T.border}`, borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ height: 5, background: pet.color }} />
      <div style={{ padding: isMobile ? 16 : 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ width: isMobile ? 48 : 60, height: isMobile ? 48 : 60, borderRadius: 14, background: pet.color + '18', border: `2px solid ${pet.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? 26 : 34, overflow: 'hidden' }}>
            {pet.image ? <img src={pet.image} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : pet.emoji}
          </div>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: pet.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 900, color: '#fff' }}>#{pet.number}</span>
          </div>
        </div>
        <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 900, color: T.text, marginBottom: 2 }}>{pet.name}</div>
        <div style={{ fontSize: 11, color: T.textMuted, fontStyle: 'italic', marginBottom: 10 }}>{pet.tagline}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <StatPill label="Speed" value={pet.speed} color={pet.color} />
          <StatPill label="Chaos" value={pet.chaos} color={pet.color} />
          <StatPill label="Wins" value={pet.wins} color={pet.color} />
        </div>
      </div>
    </div>
  )
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ flex: 1, background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: '8px 4px', textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{value}</div>
      <div style={{ fontSize: 9, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
    </div>
  )
}

function PastRaces({ isMobile }: { isMobile: boolean }) {
  return (
    <div style={{ background: T.card, border: `2px solid ${T.border}`, borderRadius: 16, padding: isMobile ? 16 : 24 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 18 }}>Race History</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
        {RACE_HISTORY.slice().reverse().map((race) => {
          const winner = PETS.find((p) => p.id === race.positions[0])
          return (
            <div key={race.number} style={{ background: T.bg, border: `2px solid ${T.border}`, borderRadius: 12, padding: 16, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: winner?.color ?? T.border }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, paddingTop: 4 }}>
                <div style={{ fontSize: 9, color: T.textMuted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Race #{race.number}</div>
                <div style={{ fontSize: 9, color: T.textMuted }}>
                  {new Date(race.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
              {winner && (
                <>
                  <div style={{ fontSize: 32, marginBottom: 6 }}>{winner.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: winner.color, marginBottom: 8 }}>{winner.name} wins 🏆</div>
                </>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {race.positions.map((petId, j) => {
                  const pet = PETS.find((p) => p.id === petId)
                  return pet ? (
                    <div key={petId} style={{ fontSize: 11, color: T.textMid }}>
                      {['🥇', '🥈', '🥉'][j]} {pet.name}
                    </div>
                  ) : null
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
