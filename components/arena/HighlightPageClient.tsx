'use client'
import { useState } from 'react'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { LoginModal } from '@/components/landing/LoginModal'
import { TermsModal } from '@/components/landing/TermsModal'
import { DepositModal } from '@/components/landing/DepositModal'
import { AccountModal } from '@/components/landing/AccountModal'
import { HowItWorksModal } from '@/components/landing/HowItWorksModal'
import { PETS, type RaceResult } from '@/config/site'
import { useIsMobile } from '@/components/ui/index'

const KANIT = "var(--font-kanit), sans-serif"
const TERMS_KEY = 'hamstar_terms_accepted'

type Modal = 'terms' | 'login' | 'deposit' | 'account' | 'howitworks' | null

type VideoClip = {
  id: string; title: string; url: string
  thumbnail: string | null; duration: string | null; featured: boolean
}

interface HighlightPageClientProps {
  raceHistory: RaceResult[]
  videoClips?: VideoClip[]
}

function VideoCard({ clip }: { clip: VideoClip }) {
  const [hov, setHov] = useState(false)
  const thumb = clip.thumbnail || '/images/video-thumbnail.png'
  return (
    <a
      href={clip.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: '1 1 280px', minWidth: 240, maxWidth: 420,
        borderRadius: 20, overflow: 'hidden', background: '#fff',
        boxShadow: hov ? '0 16px 40px rgba(0,0,0,0.12)' : '0 4px 20px rgba(0,0,0,0.06)',
        transform: hov ? 'translateY(-6px)' : 'none',
        transition: 'box-shadow 0.2s, transform 0.2s',
        cursor: 'pointer', textDecoration: 'none', display: 'block',
      }}
    >
      <div style={{
        width: '100%', aspectRatio: '16/9', position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <img src={thumb} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <img
          src="/images/play-button.png" alt="Play"
          style={{ position: 'relative', zIndex: 1, width: 52, height: 52, transform: hov ? 'scale(1.12)' : 'scale(1)', transition: 'transform 0.15s' }}
        />
        {clip.duration && (
          <span style={{ position: 'absolute', bottom: 8, right: 10, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4, fontFamily: KANIT }}>
            {clip.duration}
          </span>
        )}
      </div>
      <div style={{ padding: '14px 18px 18px' }}>
        <p style={{ fontFamily: KANIT, fontSize: 15, fontWeight: 600, color: '#0D0D14', marginBottom: 4 }}>
          {clip.title}
        </p>
        <p style={{ fontFamily: KANIT, fontSize: 12, color: '#999' }}>
          Hamstar Racing · Pump.fun
        </p>
      </div>
    </a>
  )
}

function RoundResultRow({ result }: { result: RaceResult }) {
  const positions = result.positions.map(id => PETS.find(p => p.id === id))
  const medals = ['🥇', '🥈', '🥉']
  return (
    <div style={{
      background: '#fff',
      borderRadius: 20,
      padding: '20px 28px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12,
    }}>
      <span style={{ fontFamily: KANIT, fontSize: 16, fontWeight: 700, color: '#0D0D14' }}>
        Round {result.number}
      </span>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        {positions.map((pet, i) => (
          <span key={i} style={{ fontFamily: KANIT, fontSize: 14, color: '#555' }}>
            {medals[i]} {pet?.name ?? result.positions[i]}
          </span>
        ))}
      </div>
      <span style={{ fontFamily: KANIT, fontSize: 12, color: '#aaa' }}>
        {result.date}
      </span>
    </div>
  )
}

// Static fallback clips shown when no videos have been uploaded yet
function staticClips(roundNum: number): VideoClip[] {
  return [
    { id: 'static-0', title: `Round ${roundNum} — Race Start`,  url: '#', thumbnail: null, duration: null, featured: false },
    { id: 'static-1', title: `Round ${roundNum} — Final Lap`,   url: '#', thumbnail: null, duration: null, featured: false },
    { id: 'static-2', title: `Round ${roundNum} — Victory Lap`, url: '#', thumbnail: null, duration: null, featured: false },
  ]
}

export function HighlightPageClient({ raceHistory, videoClips = [] }: HighlightPageClientProps) {
  const [modal, setModal] = useState<Modal>(null)
  const [authed, setAuthed] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const isMobile = useIsMobile()

  const lastResult = raceHistory.length ? raceHistory[raceHistory.length - 1] : null
  const winner = lastResult ? PETS.find(p => p.id === lastResult.positions[0]) : null

  // Use DB video clips if available, otherwise show static placeholders
  const clips = videoClips.length
    ? videoClips
    : staticClips(lastResult?.number ?? 1)

  const handleLogin = () => { setAuthed(true); setModal(null) }
  const handleDisconnect = () => { setAuthed(false); setWalletAddress('') }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; }
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

      <main style={{
        background: '#FFE790',
        minHeight: '100vh',
        paddingTop: 87,
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Decorative: hamster wheel top-left */}
        {!isMobile && (
          <img
            src="/images/hamster-wheel-empty.png"
            alt=""
            aria-hidden
            style={{
              position: 'absolute',
              top: 80,
              left: -20,
              width: 180,
              height: 'auto',
              opacity: 0.85,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}

        {/* Decorative: hamster headset bottom-right */}
        {!isMobile && (
          <img
            src="/images/hamster-headset.png"
            alt=""
            aria-hidden
            style={{
              position: 'absolute',
              bottom: 120,
              right: 0,
              width: 200,
              height: 'auto',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: `0 clamp(16px, 4vw, 48px) 0`, position: 'relative', zIndex: 1 }}>

          {/* Page header */}
          <div style={{
            textAlign: 'center',
            padding: isMobile ? '40px 0 32px' : '60px 0 40px',
          }}>
            <h1 style={{
              fontFamily: KANIT,
              fontSize: 'clamp(32px, 5vw, 60px)',
              fontWeight: 700,
              color: '#0D0D14',
              marginBottom: 12,
            }}>
              🎥 Hamstar Highlight
            </h1>
            <p style={{
              fontFamily: KANIT,
              fontSize: 'clamp(14px, 1.6vw, 20px)',
              color: '#6B5A00',
              maxWidth: 560,
              margin: '0 auto',
            }}>
              The best moments from every race — all in one place.
            </p>
          </div>

          {/* Winner banner */}
          <div style={{
            background: '#fff',
            borderRadius: 24,
            padding: isMobile ? '20px 20px' : '28px 40px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 32,
          }}>
            <div>
              <p style={{ fontFamily: KANIT, fontSize: 13, color: '#aaa', marginBottom: 4 }}>
                Most Recent Champion
              </p>
              <p style={{
                fontFamily: KANIT,
                fontSize: 'clamp(20px, 2.5vw, 32px)',
                fontWeight: 700,
                color: '#0D0D14',
              }}>
                {winner ? `🏆 ${winner.name}` : '—'}
              </p>
            </div>
            <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
              <p style={{ fontFamily: KANIT, fontSize: 13, color: '#aaa', marginBottom: 4 }}>
                Race Round
              </p>
              <p style={{
                fontFamily: KANIT,
                fontSize: 'clamp(20px, 2.5vw, 32px)',
                fontWeight: 700,
                color: '#0D0D14',
              }}>
                {lastResult ? `Round ${lastResult.number}` : '—'}
              </p>
            </div>
          </div>

          {/* Video clips */}
          <h2 style={{
            fontFamily: KANIT,
            fontSize: 'clamp(20px, 2.4vw, 30px)',
            fontWeight: 700,
            color: '#0D0D14',
            marginBottom: 20,
          }}>
            Race Clips
          </h2>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 56 }}>
            {clips.map((clip) => (
              <VideoCard key={clip.id} clip={clip} />
            ))}
          </div>

          {/* Race history */}
          {raceHistory.length > 0 && (
            <>
              <h2 style={{
                fontFamily: KANIT,
                fontSize: 'clamp(20px, 2.4vw, 30px)',
                fontWeight: 700,
                color: '#0D0D14',
                marginBottom: 20,
              }}>
                Race History
              </h2>
              {[...raceHistory].reverse().map(result => (
                <RoundResultRow key={result.number} result={result} />
              ))}
            </>
          )}

          {/* Empty state when no history */}
          {raceHistory.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px',
              background: '#fff',
              borderRadius: 24,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            }}>
              <p style={{ fontFamily: KANIT, fontSize: 40, marginBottom: 16 }}>🐹</p>
              <p style={{ fontFamily: KANIT, fontSize: 18, fontWeight: 600, color: '#0D0D14', marginBottom: 8 }}>
                No races yet
              </p>
              <p style={{ fontFamily: KANIT, fontSize: 14, color: '#999' }}>
                Highlights will appear here after the first race.
              </p>
            </div>
          )}
        </div>

        {/* Oats floor */}
        <div style={{ width: '100%', lineHeight: 0, marginTop: 40 }}>
          <img
            src="/images/oats-pile.png"
            alt=""
            aria-hidden
            style={{
              width: '100%',
              height: isMobile ? 80 : 120,
              objectFit: 'cover',
              objectPosition: 'top',
              display: 'block',
            }}
          />
        </div>
      </main>

      <LandingFooter />

      {modal === 'terms'    && <TermsModal onAccept={() => { localStorage.setItem(TERMS_KEY, '1'); setModal('login') }} />}
      {modal === 'login'    && <LoginModal onClose={() => setModal(null)} onLogin={handleLogin} />}
      {modal === 'deposit'  && <DepositModal address={walletAddress} onClose={() => setModal(null)} />}
      {modal === 'account'  && (
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
