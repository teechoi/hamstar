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
        background: '#f8f9fa',
        minHeight: '100vh',
        paddingTop: 87,
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Soft glow blobs */}
        <div style={{
          position: 'absolute', bottom: -149, left: -105,
          width: 764, height: 764, borderRadius: '50%',
          background: 'rgba(252,212,0,0.10)', filter: 'blur(32px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: 278, right: -129,
          width: 683, height: 683, borderRadius: '50%',
          background: 'rgba(76,0,128,0.05)', filter: 'blur(32px)',
          pointerEvents: 'none',
        }} />

        <div style={{
          maxWidth: 1100, margin: '0 auto',
          padding: `clamp(40px, 6vw, 72px) clamp(16px, 4vw, 48px) 80px`,
          position: 'relative', zIndex: 1,
        }}>

          {/* Page header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h1 style={{
              fontFamily: KANIT,
              fontSize: 'clamp(28px, 4vw, 50px)',
              fontWeight: 700, color: '#0D0D14', marginBottom: 12,
            }}>
              Hamster Profile
            </h1>
            <p style={{
              fontFamily: KANIT,
              fontSize: 'clamp(14px, 1.6vw, 20px)',
              color: '#555',
            }}>
              Race highlights, real hamsters, and behind-the-scenes content.
            </p>
          </div>

          {/* Avatar tabs */}
          <div style={{
            display: 'flex', justifyContent: 'center',
            gap: isMobile ? 12 : 20,
            marginBottom: 40,
            flexWrap: 'wrap',
          }}>
            {PETS.map(pet => {
              const isActive = pet.id === selectedId
              return (
                <button
                  key={pet.id}
                  onClick={() => setSelectedId(pet.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: isMobile ? '10px 20px' : '12px 28px',
                    background: '#fff',
                    border: isActive ? '2px solid #735DFF' : '2px solid transparent',
                    borderRadius: 9999,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                >
                  <img
                    src={PET_IMAGES[pet.id]}
                    alt={pet.name}
                    style={{
                      width: 48, height: 48,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      objectPosition: 'top',
                      background: '#f0f0f0',
                    }}
                  />
                  <span style={{
                    fontFamily: KANIT,
                    fontSize: 'clamp(16px, 1.8vw, 22px)',
                    fontWeight: 600, color: '#0D0D14',
                  }}>
                    {pet.name}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Detail card */}
          <div style={{
            background: '#fff',
            borderRadius: 40,
            boxShadow: '0 20px 40px rgba(77,67,83,0.06)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            minHeight: isMobile ? 'auto' : 420,
          }}>
            {/* Image panel */}
            <div style={{
              width: isMobile ? '100%' : 340,
              minHeight: isMobile ? 260 : 'auto',
              background: '#e8e8e8',
              flexShrink: 0,
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <img
                src={PET_IMAGES[selected.id]}
                alt={selected.name}
                style={{
                  width: '90%', height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </div>

            {/* Info panel */}
            <div style={{ flex: 1, padding: isMobile ? '24px 20px' : '40px 48px' }}>
              <p style={{ fontFamily: KANIT, fontSize: 14, color: '#a0a0a0', marginBottom: 4 }}>
                Name
              </p>
              <h2 style={{
                fontFamily: KANIT,
                fontSize: 'clamp(24px, 3vw, 42px)',
                fontWeight: 700, color: '#0D0D14', marginBottom: 16,
              }}>
                {selected.name}
              </h2>

              <p style={{ fontFamily: KANIT, fontSize: 14, color: '#a0a0a0', marginBottom: 6 }}>
                About {selected.name}
              </p>
              <p style={{
                fontFamily: KANIT,
                fontSize: 'clamp(13px, 1.3vw, 16px)',
                color: '#555', lineHeight: 1.65,
                marginBottom: 28,
                maxWidth: 600,
              }}>
                {selected.bio}
              </p>

              {/* Stats grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, auto)',
                gap: '8px 40px',
              }}>
                {[
                  { label: 'Performance', value: `${selected.speed}%` },
                  { label: 'Win Rate',    value: `${selected.wins} wins` },
                  { label: 'Style',       value: styleLabel(selected.chaos) },
                  { label: 'Chaos',       value: `${selected.chaos}%` },
                  { label: 'Snack Level', value: `${selected.snackLevel}%` },
                  { label: 'Cage Score',  value: `${selected.cageLevel}%` },
                ].map(({ label, value }) => (
                  <p key={label} style={{ fontFamily: KANIT, fontSize: 'clamp(13px, 1.4vw, 17px)', color: '#0D0D14' }}>
                    <span style={{ color: '#a0a0a0' }}>{label}:</span> {value}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Decorative: cheese bottom-left */}
        {!isMobile && (
          <img
            src="/images/cheese-hideout.png"
            alt=""
            aria-hidden
            style={{
              position: 'absolute',
              bottom: 60,
              left: 20,
              width: 160,
              height: 'auto',
              opacity: 0.9,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}

        {/* Decorative: hamster snacking bottom-right */}
        {!isMobile && (
          <img
            src="/images/hamster-snacking.png"
            alt=""
            aria-hidden
            style={{
              position: 'absolute',
              bottom: 40,
              right: 0,
              width: 240,
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
