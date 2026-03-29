'use client'
import { useState } from 'react'
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
  dash:  '/images/hamster-dash.png',
  flash: '/images/hamster-flash.png',
  turbo: '/images/hamster-turbo.png',
}


function styleLabel(chaos: number): string {
  if (chaos >= 80) return 'Chaotic'
  if (chaos >= 60) return 'Aggressive'
  if (chaos >= 40) return 'Balanced'
  return 'Steady'
}

export function PetPageClient() {
  const [modal, setModal] = useState<Modal>(null)
  const [authed, setAuthed] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [selectedId, setSelectedId] = useState(PETS[0].id)
  const isMobile = useIsMobile()

  const selected = PETS.find(p => p.id === selectedId) ?? PETS[0]

  const handleLogin = () => { setAuthed(true); setModal(null) }
  const handleDisconnect = () => { setAuthed(false); setWalletAddress('') }

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

        {/* Glow blobs — radial gradients anchored to corners, never clip */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 600px 600px at 0% 100%, rgba(252,212,0,0.22) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 560px 560px at 100% 30%, rgba(115,93,255,0.14) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        {/* Right decorative hamster */}
        {!isMobile && (
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
              fontSize: 'clamp(20px, 2.5vw, 28px)',
              fontWeight: 600,
              color: '#000',
              marginBottom: 10,
            }}>
              Hamster Profile
            </h1>
            <p style={{
              fontFamily: 'Pretendard, sans-serif',
              fontSize: 'clamp(14px, 1.6vw, 17px)',
              fontWeight: 500,
              color: '#000',
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
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 24px 10px 12px',
                    background: '#fff',
                    border: isActive ? '2px solid #735DFF' : '2px solid transparent',
                    borderRadius: 16,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s',
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
                  height: 260,
                  width: 'auto',
                  display: 'block',
                  flexShrink: 0,
                }}
              />
            </div>

            {/* Info panel */}
            <div style={{ flex: 1, padding: isMobile ? '28px 20px' : '36px 40px' }}>

              <p style={{ fontFamily: KANIT, fontSize: 13, fontWeight: 400, color: '#9F9F9F', marginBottom: 4 }}>
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

              <p style={{ fontFamily: KANIT, fontSize: 13, fontWeight: 400, color: '#9F9F9F', marginBottom: 6 }}>
                About {selected.name}
              </p>
              <p style={{
                fontFamily: KANIT,
                fontSize: 'clamp(13px, 1.4vw, 15px)',
                fontWeight: 300,
                color: '#9F9F9F',
                lineHeight: 1.7,
                marginBottom: 28,
              }}>
                {selected.bio}
              </p>

              {/* Stats — 2 column grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px 32px',
              }}>
                {[
                  { label: 'Performance', value: `${selected.speed}%` },
                  { label: 'Win Rate',    value: `${selected.wins} wins` },
                  { label: 'Style',       value: styleLabel(selected.chaos) },
                  { label: 'Chaos',       value: `${selected.chaos}%` },
                ].map(({ label, value }) => (
                  <p key={label} style={{ fontFamily: KANIT, fontSize: 'clamp(13px, 1.4vw, 15px)', fontWeight: 400, color: '#000', margin: 0 }}>
                    {label}: {value}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom-left decorative — cheese hideout */}
        {!isMobile && (
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
