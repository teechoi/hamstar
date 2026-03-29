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
        overflow: 'hidden',
      }}>

        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', bottom: -149, left: -105,
          width: 764, height: 764, borderRadius: '50%',
          background: 'rgba(255,231,144,0.10)', filter: 'blur(32px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: 278, right: -129,
          width: 683, height: 683, borderRadius: '50%',
          background: 'rgba(115,93,255,0.05)', filter: 'blur(32px)',
          pointerEvents: 'none',
        }} />

        {/* Right decorative hamster — partially off-screen right */}
        {!isMobile && (
          <img
            src="/images/hamster-pet-right.png"
            alt=""
            aria-hidden
            style={{
              position: 'absolute',
              top: 266,
              left: 'calc(50% + 300px)',
              width: 358,
              height: 'auto',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}

        <div style={{
          maxWidth: 707,
          margin: '0 auto',
          padding: isMobile ? '40px 16px 80px' : '60px 0 80px',
          position: 'relative',
          zIndex: 1,
        }}>

          {/* Page header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{
              fontFamily: KANIT,
              fontSize: 'clamp(20px, 2.5vw, 24px)',
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
            marginBottom: 20,
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
                    padding: '8px 20px 8px 10px',
                    background: '#fff',
                    border: isActive ? '2px solid #735DFF' : '2px solid transparent',
                    borderRadius: 16,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s',
                  }}
                >
                  <div style={{
                    width: 41, height: 41,
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
                    fontSize: 16,
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
            borderRadius: 20,
            boxShadow: '0 4px 20px rgba(77,67,83,0.08)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
          }}>
            {/* Photo panel */}
            <div style={{
              width: isMobile ? '100%' : 195,
              height: isMobile ? 220 : 276,
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
                  height: 190,
                  width: 'auto',
                  display: 'block',
                  flexShrink: 0,
                }}
              />
            </div>

            {/* Info panel */}
            <div style={{ flex: 1, padding: isMobile ? '24px 20px' : '28px 32px' }}>

              <p style={{ fontFamily: KANIT, fontSize: 12, fontWeight: 400, color: '#9F9F9F', marginBottom: 4 }}>
                Name
              </p>
              <h2 style={{
                fontFamily: KANIT,
                fontSize: 20,
                fontWeight: 600,
                color: '#000',
                marginBottom: 16,
              }}>
                {selected.name}
              </h2>

              <p style={{ fontFamily: KANIT, fontSize: 12, fontWeight: 400, color: '#9F9F9F', marginBottom: 6 }}>
                About {selected.name}
              </p>
              <p style={{
                fontFamily: KANIT,
                fontSize: 13,
                fontWeight: 300,
                color: '#9F9F9F',
                lineHeight: 1.6,
                marginBottom: 20,
              }}>
                {selected.bio}
              </p>

              {/* Stats — 2 column grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '6px 24px',
              }}>
                {[
                  { label: 'Performance', value: `${selected.speed}%` },
                  { label: 'Win Rate',    value: `${selected.wins} wins` },
                  { label: 'Style',       value: styleLabel(selected.chaos) },
                  { label: 'Chaos',       value: `${selected.chaos}%` },
                ].map(({ label, value }) => (
                  <p key={label} style={{ fontFamily: KANIT, fontSize: 14, fontWeight: 400, color: '#000', margin: 0 }}>
                    {label}: {value}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom-left decorative */}
        {!isMobile && (
          <img
            src="/images/hamster-pet-bottom.png"
            alt=""
            aria-hidden
            style={{
              position: 'absolute',
              bottom: 41,
              left: 'max(calc(50% - 650px), 0px)',
              width: 312,
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
