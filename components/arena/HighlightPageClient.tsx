'use client'
import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { LoginModal } from '@/components/landing/LoginModal'
import { TermsModal } from '@/components/landing/TermsModal'
import { DepositModal } from '@/components/landing/DepositModal'
import { AccountModal } from '@/components/landing/AccountModal'
import { HowItWorksModal } from '@/components/landing/HowItWorksModal'
import { useIsMobile } from '@/components/ui/index'
import { T } from '@/lib/theme'

const KANIT = "var(--font-kanit), sans-serif"
const TERMS_KEY = 'hamstar_terms_accepted'

type Modal = 'terms' | 'login' | 'deposit' | 'account' | 'howitworks' | null

interface PodiumEntry { position: number | null; name: string; emoji: string; color: string }
interface RaceRow {
  id: string; number: number; date: string; recap: string | null
  totalSol: number; supporters: number; podium: PodiumEntry[]
}
interface MediaItem {
  id: string; type: string; title: string; description: string | null
  url: string; thumbnail: string | null; duration: string | null; featured: boolean
}

const MEDALS = ['🥇', '🥈', '🥉']
const MEDAL_COLORS = [T.medalGold, T.medalSilver, T.medalBronze]

function MediaCard({ item }: { item: MediaItem }) {
  const [hov, setHov] = useState(false)
  const isVideo = item.type === 'VIDEO'
  return (
    <a
      href={item.url} target="_blank" rel="noopener noreferrer"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: '1 1 280px', minWidth: 240, maxWidth: 400,
        borderRadius: 20, overflow: 'hidden', background: '#fff',
        boxShadow: hov ? '0 16px 40px rgba(0,0,0,0.14)' : '0 4px 20px rgba(0,0,0,0.06)',
        transform: hov ? 'translateY(-5px)' : 'none',
        transition: 'box-shadow 0.2s, transform 0.2s',
        textDecoration: 'none', display: 'block', cursor: 'pointer',
      }}
    >
      {/* Thumbnail */}
      <div style={{ width: '100%', aspectRatio: '16/9', position: 'relative', background: '#1a1a2e', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {item.thumbnail ? (
          <img src={item.thumbnail} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }} />
        )}
        {isVideo && (
          <div style={{
            position: 'relative', zIndex: 1,
            width: 52, height: 52, borderRadius: '50%',
            background: 'rgba(255,231,144,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: hov ? 'scale(1.12)' : 'scale(1)',
            transition: 'transform 0.15s',
          }}>
            <span style={{ fontSize: 20, marginLeft: 3 }}>▶</span>
          </div>
        )}
        {item.featured && (
          <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 2, background: '#735DFF', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Featured
          </div>
        )}
        {item.duration && (
          <div style={{ position: 'absolute', bottom: 8, right: 10, zIndex: 2, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>
            {item.duration}
          </div>
        )}
      </div>
      {/* Caption */}
      <div style={{ padding: '14px 18px 18px' }}>
        <p style={{ fontFamily: KANIT, fontSize: 15, fontWeight: 600, color: '#000', marginBottom: 4 }}>{item.title}</p>
        {item.description && (
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 12, color: '#999', lineHeight: 1.5 }}>{item.description}</p>
        )}
        <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 11, color: '#bbb', marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {isVideo ? '🎥 Video' : '📸 Photo'} · Hamstar Racing
        </p>
      </div>
    </a>
  )
}

function RaceResultRow({ race }: { race: RaceRow }) {
  const [hov, setHov] = useState(false)
  const [open, setOpen] = useState(false)
  const winner = race.podium[0]
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff', borderRadius: 20, marginBottom: 12,
        boxShadow: hov ? '0 8px 28px rgba(0,0,0,0.09)' : '0 4px 16px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.2s',
        overflow: 'hidden',
      }}
    >
      <div
        onClick={() => setOpen(o => !o)}
        style={{ padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, cursor: 'pointer' }}
      >
        {/* Left: round + podium */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: KANIT, fontSize: 16, fontWeight: 700, color: '#000' }}>
            Race #{race.number}
          </span>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {race.podium.slice(0, 3).map((p, i) => (
              <span key={i} style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 14, color: MEDAL_COLORS[i] ?? '#8A8A8A', fontWeight: i === 0 ? 700 : 400 }}>
                {MEDALS[i]} {p.emoji} {p.name}
              </span>
            ))}
          </div>
        </div>
        {/* Right: stats + date + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {race.totalSol > 0 && (
            <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 13, color: '#735DFF', fontWeight: 700 }}>
              ◎ {race.totalSol.toFixed(3)}
            </span>
          )}
          {race.supporters > 0 && (
            <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 13, color: '#8A8A8A' }}>
              {race.supporters} fans
            </span>
          )}
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 12, color: '#8A8A8A' }}>
            {new Date(race.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          {race.recap && (
            <span style={{ fontSize: 14, color: '#8A8A8A', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
          )}
        </div>
      </div>
      {/* Winner highlight bar */}
      {winner && (
        <div style={{ height: 3, background: `linear-gradient(90deg, ${winner.color || '#735DFF'}44, ${winner.color || '#735DFF'}22, transparent)` }} />
      )}
      {/* Expandable recap */}
      {race.recap && open && (
        <div style={{ padding: '0 28px 20px' }}>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 14, color: '#555', lineHeight: 1.7, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
            {race.recap}
          </p>
        </div>
      )}
    </div>
  )
}

export function HighlightPageClient() {
  const [modal, setModal] = useState<Modal>(null)
  const [races, setRaces] = useState<RaceRow[]>([])
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const isMobile = useIsMobile()
  const { connected, publicKey, disconnect } = useWallet()

  const authed = connected
  const walletAddress = publicKey?.toString() ?? ''

  useEffect(() => {
    if (!localStorage.getItem(TERMS_KEY)) setModal('terms')
    fetch('/api/highlights')
      .then(r => r.json())
      .then(d => { setRaces(d.races ?? []); setMedia(d.media ?? []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleDisconnect = () => { disconnect().catch(() => {}) }

  const latestRace = races[0] ?? null
  const champion = latestRace?.podium[0] ?? null
  const featuredMedia = media.filter(m => m.featured)
  const allMedia = media

  return (
    <>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } html { scroll-behavior: smooth; }`}</style>

      <LandingNav
        lightBg
        authed={authed}
        walletAddress={walletAddress || undefined}
        onLoginClick={() => setModal('login')}
        onDepositClick={() => setModal('deposit')}
        onAccountClick={() => setModal('account')}
        onHowItWorksClick={() => setModal('howitworks')}
      />

      <main style={{ background: '#FFE790', minHeight: '100vh', paddingTop: 87, position: 'relative', overflow: 'hidden' }}>

        {/* Decorative images */}
        <img src="/images/hamster-wheel-empty.png" alt="" aria-hidden style={{ position: 'absolute', top: isMobile ? 60 : 80, left: -20, width: isMobile ? 100 : 180, height: 'auto', opacity: 0.85, pointerEvents: 'none', zIndex: 0 }} />
        <img src="/images/hamster-headset.png" alt="" aria-hidden style={{ position: 'absolute', bottom: isMobile ? 80 : 120, right: 0, width: isMobile ? 120 : 200, height: 'auto', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: `0 clamp(16px, 4vw, 48px)`, position: 'relative', zIndex: 1 }}>

          {/* Header */}
          <div style={{ textAlign: 'center', padding: isMobile ? '40px 0 32px' : '60px 0 40px' }}>
            <h1 style={{ fontFamily: KANIT, fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 700, color: '#000', marginBottom: 12 }}>
              🎥 Highlights
            </h1>
            <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 'clamp(14px, 1.6vw, 20px)', color: '#503F00', maxWidth: 560, margin: '0 auto' }}>
              Race results, champion moments, and behind-the-scenes content.
            </p>
          </div>

          {/* Latest champion banner */}
          {!loading && (
            <div style={{
              background: '#fff', borderRadius: 24,
              padding: isMobile ? '20px 20px' : '28px 40px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexWrap: 'wrap', gap: 12, marginBottom: 40,
            }}>
              <div>
                <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 13, color: '#8A8A8A', marginBottom: 4 }}>Most Recent Champion</p>
                <p style={{ fontFamily: KANIT, fontSize: 'clamp(20px, 2.5vw, 32px)', fontWeight: 700, color: '#000' }}>
                  {champion ? `🏆 ${champion.emoji} ${champion.name}` : '—'}
                </p>
              </div>
              <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 13, color: '#8A8A8A', marginBottom: 4 }}>Latest Race</p>
                <p style={{ fontFamily: KANIT, fontSize: 'clamp(20px, 2.5vw, 32px)', fontWeight: 700, color: '#000' }}>
                  {latestRace ? `Race #${latestRace.number}` : '—'}
                </p>
              </div>
            </div>
          )}

          {/* Media section — only shown if media exists in DB */}
          {!loading && allMedia.length > 0 && (
            <>
              <h2 style={{ fontFamily: KANIT, fontSize: 'clamp(20px, 2.4vw, 30px)', fontWeight: 700, color: '#000', marginBottom: 20 }}>
                {featuredMedia.length > 0 ? 'Featured Clips' : 'Media'}
              </h2>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 56 }}>
                {(featuredMedia.length > 0 ? featuredMedia : allMedia).map(item => (
                  <MediaCard key={item.id} item={item} />
                ))}
              </div>
            </>
          )}

          {/* Race history */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ background: '#fff', borderRadius: 20, height: 72, opacity: 0.6, animation: 'pulse 1.4s ease-in-out infinite' }} />
              ))}
            </div>
          ) : races.length > 0 ? (
            <>
              <h2 style={{ fontFamily: KANIT, fontSize: 'clamp(20px, 2.4vw, 30px)', fontWeight: 700, color: '#000', marginBottom: 20 }}>
                Race History
              </h2>
              {races.map(race => (
                <RaceResultRow key={race.id} race={race} />
              ))}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: '#fff', borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: 40 }}>
              <p style={{ fontFamily: KANIT, fontSize: 40, marginBottom: 16 }}>🐹</p>
              <p style={{ fontFamily: KANIT, fontSize: 18, fontWeight: 600, color: '#000', marginBottom: 8 }}>No races yet</p>
              <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 14, color: '#999' }}>Highlights will appear here after the first race.</p>
            </div>
          )}
        </div>

        {/* Oats floor */}
        <div style={{ width: '100%', lineHeight: 0, marginTop: 40 }}>
          <img src="/images/oats-pile.png" alt="" aria-hidden style={{ width: '100%', height: isMobile ? 80 : 120, objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
        </div>
      </main>

      <LandingFooter />

      {modal === 'terms'      && <TermsModal onAccept={() => { localStorage.setItem(TERMS_KEY, '1'); setModal(null) }} />}
      {modal === 'login'      && <LoginModal onClose={() => setModal(null)} />}
      {modal === 'deposit'    && <DepositModal address={walletAddress} onClose={() => setModal(null)} />}
      {modal === 'account'    && (
        <AccountModal walletAddress={walletAddress || undefined} onClose={() => setModal(null)} onDeposit={() => setModal('deposit')} onDisconnect={handleDisconnect} />
      )}
      {modal === 'howitworks' && (
        <HowItWorksModal onClose={() => setModal(null)} onEnterArena={() => setModal(authed ? null : 'login')} />
      )}
    </>
  )
}
