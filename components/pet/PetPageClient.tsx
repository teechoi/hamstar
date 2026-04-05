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
import { PETS } from '@/config/site'
import { useIsMobile } from '@/components/ui/index'

const KANIT = "var(--font-kanit), sans-serif"
const TERMS_KEY = 'hamstar_terms_accepted'

type Modal = 'terms' | 'login' | 'deposit' | 'account' | 'howitworks' | null

const PET_IMAGES: Record<string, string> = {
  dash:  '/images/dash.png',
  flash: '/images/flash-crop.jpeg',
  turbo: '/images/turbo-crop.png',
}


function styleLabel(chaos: number): string {
  if (chaos >= 80) return 'Chaotic'
  if (chaos >= 60) return 'Aggressive'
  if (chaos >= 40) return 'Balanced'
  return 'Steady'
}

interface PetStats { wins: number; races: number; winRate: number }

export function PetPageClient() {
  const [modal, setModal] = useState<Modal>(null)
  const [selectedId, setSelectedId] = useState(PETS[0].id)
  const [hovTabId, setHovTabId] = useState<string | null>(null)
  const [petStats, setPetStats] = useState<Record<string, PetStats>>({})
  const isMobile = useIsMobile()
  const { connected, publicKey, disconnect } = useWallet()

  const authed = connected
  const walletAddress = publicKey?.toString() ?? ''

  const selected = PETS.find(p => p.id === selectedId) ?? PETS[0]

  useEffect(() => {
    Promise.all(
      PETS.map(pet =>
        fetch(`/api/pets/${pet.id}/stats`)
          .then(r => r.json() as Promise<PetStats>)
          .then(data => ({ id: pet.id, data }))
          .catch(() => ({ id: pet.id, data: { wins: 0, races: 0, winRate: 0 } }))
      )
    ).then(results => {
      const map: Record<string, PetStats> = {}
      results.forEach(({ id, data }) => { map[id] = data })
      setPetStats(map)
    })
  }, [])

  const handleDisconnect = () => { disconnect().catch(() => {}) }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
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
        background: '#F8F9FA',
        minHeight: '100vh',
        paddingTop: 87,
        position: 'relative',
      }}>

        {/* Glow blobs — positioned at corners with no negative offsets so they never clip */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 700, height: 700, borderRadius: '50%', background: 'rgba(252,212,0,0.22)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: 200, right: 0, width: 600, height: 600, borderRadius: '50%', background: 'rgba(115,93,255,0.14)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />

        {/* Right decorative hamster — desktop: tracks content center; mobile: peeks from right */}
        {isMobile ? (
          <div style={{ position: 'absolute', top: 360, right: 0, width: 'clamp(90px, 24vw, 130px)', overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
            <img src="/images/hamster-pet-right.png" alt="" aria-hidden style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        ) : (
          <img
            src="/images/hamster-pet-right.png"
            alt=""
            aria-hidden
            style={{
              position: 'absolute',
              top: 220,
              left: 'calc(50% + 420px)',
              width: 'clamp(300px, 28vw, 440px)',
              height: 'auto',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}

        <div style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: isMobile ? '40px 16px 80px' : '60px 24px 80px',
          position: 'relative',
          zIndex: 1,
        }}>

          {/* Page header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{
              fontFamily: KANIT,
              fontSize: 'clamp(20px, 2.5vw, 24px)',
              fontWeight: 500,
              color: '#000',
              marginBottom: 10,
            }}>
              Hamster Profile
            </h1>
            <p style={{
              fontFamily: 'Pretendard, sans-serif',
              fontSize: 'clamp(14px, 1.6vw, 17px)',
              fontWeight: 400,
              color: '#8A8A8A',
            }}>
              Race highlights, real hamsters, and behind-the-scenes content.
            </p>
          </div>

          {/* Hamster selector tabs */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            marginBottom: 24,
            flexWrap: 'wrap',
          }}>
            {PETS.map(pet => {
              const isActive = pet.id === selectedId
              return (
                <button
                  key={pet.id}
                  onClick={() => setSelectedId(pet.id)}
                  onMouseEnter={() => setHovTabId(pet.id)}
                  onMouseLeave={() => setHovTabId(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 24px 10px 12px',
                    background: '#fff',
                    border: isActive ? '2px solid #735DFF' : '2px solid transparent',
                    borderRadius: 16,
                    boxShadow: hovTabId === pet.id && !isActive ? '0 4px 20px rgba(0,0,0,0.1)' : '0 4px 16px rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    opacity: hovTabId === pet.id && !isActive ? 0.9 : 1,
                  }}
                >
                  <div style={{
                    width: 48, height: 48,
                    borderRadius: '50%',
                    background: '#D9D9D9',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}>
                    <img
                      src={PET_IMAGES[pet.id]}
                      alt={pet.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                    />
                  </div>
                  <span style={{
                    fontFamily: KANIT,
                    fontSize: 18,
                    fontWeight: 600,
                    color: '#000',
                  }}>
                    {pet.name}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Profile detail card */}
          <div style={{
            background: '#fff',
            borderRadius: 24,
            boxShadow: '0 4px 24px rgba(77,67,83,0.10)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
          }}>
            {/* Photo panel */}
            <div style={{
              width: isMobile ? '100%' : 260,
              height: isMobile ? 260 : 360,
              background: '#D9D9D9',
              flexShrink: 0,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img
                src={PET_IMAGES[selected.id]}
                alt={selected.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center center',
                  display: 'block',
                }}
              />
            </div>

            {/* Info panel */}
            <div style={{ flex: 1, padding: isMobile ? '28px 20px' : '36px 40px' }}>

              <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 13, fontWeight: 400, color: '#8A8A8A', marginBottom: 4 }}>
                Name
              </p>
              <h2 style={{
                fontFamily: KANIT,
                fontSize: 'clamp(20px, 2.5vw, 28px)',
                fontWeight: 600,
                color: '#000',
                marginBottom: 16,
              }}>
                {selected.name}
              </h2>

              <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 13, fontWeight: 400, color: '#8A8A8A', marginBottom: 6 }}>
                About {selected.name}
              </p>
              <p style={{
                fontFamily: 'Pretendard, sans-serif',
                fontSize: 'clamp(13px, 1.4vw, 15px)',
                fontWeight: 400,
                color: '#9F9F9F',
                lineHeight: 1.7,
                marginBottom: 28,
              }}>
                {selected.bio}
              </p>

              {/* Stats — 2 column grid */}
              {(() => {
                const stats = petStats[selected.id]
                return (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px 32px',
                  }}>
                    {[
                      { label: 'Performance', value: `${selected.speed}%` },
                      { label: 'Win Rate',    value: stats ? `${stats.winRate}%` : `${selected.wins} wins` },
                      { label: 'Style',       value: styleLabel(selected.chaos) },
                      { label: 'Races',       value: stats ? `${stats.races} races` : '—' },
                    ].map(({ label, value }) => (
                      <p key={label} style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 'clamp(13px, 1.4vw, 15px)', fontWeight: 400, color: '#000', margin: 0 }}>
                        {label}: {value}
                      </p>
                    ))}
                  </div>
                )
              })()}
            </div>
          </div>
        </div>

        {/* Bottom-left decorative — desktop: peeks from left; mobile: smaller peek */}
        {isMobile ? (
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: 'clamp(80px, 22vw, 110px)', overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
            <img src="/images/cheese-hideout.png" alt="" aria-hidden style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        ) : (
          <img
            src="/images/cheese-hideout.png"
            alt=""
            aria-hidden
            style={{
              position: 'absolute',
              bottom: 0,
              left: 'max(calc(50% - 720px), -60px)',
              width: 'clamp(260px, 24vw, 380px)',
              height: 'auto',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}
      </main>

      <LandingFooter />

      {modal === 'terms'    && <TermsModal onAccept={() => { localStorage.setItem(TERMS_KEY, '1'); setModal('login') }} />}
      {modal === 'login'    && <LoginModal onClose={() => setModal(null)} />}
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
