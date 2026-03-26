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

interface HighlightPageClientProps {
  raceHistory: RaceResult[]
}

function VideoCard({ title, index }: { title: string; index: number }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: '1 1 280px', minWidth: 240, maxWidth: 420,
        borderRadius: 20,
        overflow: 'hidden',
        background: '#fff',
        boxShadow: hov
          ? '0 16px 40px rgba(0,0,0,0.12)'
          : '0 4px 20px rgba(0,0,0,0.06)',
        transform: hov ? 'translateY(-6px)' : 'none',
        transition: 'box-shadow 0.2s, transform 0.2s',
        cursor: 'pointer',
      }}
    >
      {/* Thumbnail placeholder */}
      <div style={{
        width: '100%', aspectRatio: '16/9',
        background: 'linear-gradient(135deg, #e8e8e8 0%, #d4d4d4 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {/* Play button */}
        <div style={{
          width: 56, height: 56,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.28)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.15s',
          transform: hov ? 'scale(1.1)' : 'scale(1)',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        {/* Round label */}
        <div style={{
          position: 'absolute', top: 10, left: 12,
          background: 'rgba(0,0,0,0.5)',
          borderRadius: 8, padding: '3px 10px',
          fontFamily: KANIT, fontSize: 11, fontWeight: 600, color: '#fff',
        }}>
          CLIP {index + 1}
        </div>
      </div>
      {/* Caption */}
      <div style={{ padding: '14px 18px 18px' }}>
        <p style={{ fontFamily: KANIT, fontSize: 15, fontWeight: 600, color: '#0D0D14', marginBottom: 4 }}>
          {title}
        </p>
        <p style={{ fontFamily: KANIT, fontSize: 12, color: '#999' }}>
          Hamstar Racing · Pump.fun
        </p>
      </div>
    </div>
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

export function HighlightPageClient({ raceHistory }: HighlightPageClientProps) {
  const [modal, setModal] = useState<Modal>(null)
  const [authed, setAuthed] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const isMobile = useIsMobile()

  const lastResult = raceHistory.length ? raceHistory[raceHistory.length - 1] : null
  const winner = lastResult ? PETS.find(p => p.id === lastResult.positions[0]) : null

  const clips = [
    `Round ${lastResult?.number ?? 1} — Race Start`,
    `Round ${lastResult?.number ?? 1} — Final Lap`,
    `Round ${lastResult?.number ?? 1} — Victory Lap`,
  ]

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
        authed={authed}
        walletAddress={walletAddress || undefined}
        onLoginClick={() => setModal('login')}
        onDepositClick={() => setModal('deposit')}
        onAccountClick={() => setModal('account')}
        onHowItWorksClick={() => setModal('howitworks')}
      />

      <main style={{
        background: '#f8f9fa',
        minHeight: '100vh',
        paddingTop: 87,
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Decorative: hamster wheel top-left */}
        {!isMobile && (
          <img
            src="/images/hamster-wheel-spin.png"
            alt=""
            aria-hidden
            style={{
              position: 'absolute',
              top: 60,
              left: -30,
              width: 220,
              height: 'auto',
              opacity: 0.9,
              transform: 'rotate(-12deg)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}

        {/* Decorative: oats pile bottom-left */}
        {!isMobile && (
          <img
            src="/images/oats-pile.png"
            alt=""
            aria-hidden
            style={{
              position: 'absolute',
              bottom: 140,
              left: 0,
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
              bottom: 100,
              right: 0,
              width: 200,
              height: 'auto',
              opacity: 0.9,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: `0 clamp(16px, 4vw, 48px) 80px`, position: 'relative', zIndex: 1 }}>

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
              color: '#666',
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
            {clips.map((title, i) => (
              <VideoCard key={i} title={title} index={i} />
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
