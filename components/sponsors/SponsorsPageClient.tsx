'use client'
import { useState } from 'react'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { LoginModal } from '@/components/landing/LoginModal'
import { TermsModal } from '@/components/landing/TermsModal'
import { DepositModal } from '@/components/landing/DepositModal'
import { AccountModal } from '@/components/landing/AccountModal'
import { HowItWorksModal } from '@/components/landing/HowItWorksModal'
import { PETS, SITE, type Pet } from '@/config/site'
import { useIsMobile } from '@/components/ui/index'

const KANIT = "var(--font-kanit), sans-serif"
const TERMS_KEY = 'hamstar_terms_accepted'

type Modal = 'terms' | 'login' | 'deposit' | 'account' | 'howitworks' | null

type DbSponsor = {
  id: string; name: string; emoji: string; tier: string
  websiteUrl: string | null; solPerRace: number
  pet: { id: string; slug: string; name: string; color: string; image: string } | null
}

const PET_IMAGES: Record<string, string> = {
  dash:  '/images/hamster-dash.png',
  flash: '/images/hamster-flash.png',
  turbo: '/images/hamster-turbo.png',
}

const TIER_LABEL: Record<string, string> = {
  TITLE: 'Title Sponsor', GOLD: 'Gold Sponsor', SILVER: 'Silver Sponsor',
}
const TIER_COLOR: Record<string, string> = {
  TITLE: '#ffd643', GOLD: '#f5a623', SILVER: '#b0b0b0',
}

// ─── Real sponsor card (from DB) ─────────────────────────────────────────────
function RealSponsorCard({ sponsor }: { sponsor: DbSponsor }) {
  const [hov, setHov] = useState(false)
  const petSlug = sponsor.pet?.slug ?? ''
  const petImg  = sponsor.pet?.image || PET_IMAGES[petSlug] || ''
  const content = (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: '1 1 280px', minWidth: 240, maxWidth: 380,
        background: '#fff', borderRadius: 40,
        boxShadow: hov ? '0 20px 48px rgba(77,67,83,0.12)' : '0 4px 24px rgba(77,67,83,0.06)',
        transform: hov ? 'translateY(-4px)' : 'none',
        transition: 'box-shadow 0.2s, transform 0.2s',
        padding: '32px 28px 36px',
        display: 'flex', flexDirection: 'column',
        cursor: sponsor.websiteUrl ? 'pointer' : 'default',
      }}
    >
      {/* Tier badge */}
      <div style={{
        alignSelf: 'flex-start', marginBottom: 16,
        padding: '4px 12px', borderRadius: 99,
        background: TIER_COLOR[sponsor.tier] + '22',
        border: `1.5px solid ${TIER_COLOR[sponsor.tier]}`,
        fontSize: 11, fontWeight: 700, fontFamily: KANIT,
        color: TIER_COLOR[sponsor.tier] === '#b0b0b0' ? '#666' : TIER_COLOR[sponsor.tier],
      }}>
        {TIER_LABEL[sponsor.tier] ?? sponsor.tier}
      </div>

      {/* Sponsor identity */}
      <p style={{ fontFamily: KANIT, fontSize: 'clamp(20px, 2vw, 30px)', fontWeight: 700, color: '#0D0D14', marginBottom: 4 }}>
        {sponsor.emoji} {sponsor.name}
      </p>

      {sponsor.pet && (
        <p style={{ fontFamily: KANIT, fontSize: 13, color: '#a0a0a0', marginBottom: 20 }}>
          Supporting {sponsor.pet.name}
        </p>
      )}

      {/* Pet avatar */}
      {petImg && (
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e8e8e8', overflow: 'hidden', marginTop: 'auto' }}>
          <img src={petImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
        </div>
      )}
    </div>
  )

  return sponsor.websiteUrl
    ? <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', flex: '1 1 280px', minWidth: 240, maxWidth: 380 }}>{content}</a>
    : content
}

// ─── Placeholder card shown per-pet when no sponsors yet ─────────────────────
function PlaceholderCard({ pet }: { pet: Pet }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: '1 1 280px', minWidth: 240, maxWidth: 380,
        background: '#fff', borderRadius: 40,
        boxShadow: hov ? '0 20px 48px rgba(77,67,83,0.12)' : '0 4px 24px rgba(77,67,83,0.06)',
        transform: hov ? 'translateY(-4px)' : 'none',
        transition: 'box-shadow 0.2s, transform 0.2s',
        padding: '32px 28px 36px',
        display: 'flex', flexDirection: 'column', gap: 0,
        border: '2px dashed #e0e0e0',
      }}
    >
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#e8e8e8', overflow: 'hidden', marginBottom: 20 }}>
        <img src={PET_IMAGES[pet.id] ?? ''} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
      </div>
      <p style={{ fontFamily: KANIT, fontSize: 'clamp(18px, 2vw, 28px)', fontWeight: 700, color: '#0D0D14', marginBottom: 4 }}>
        Title Sponsor
      </p>
      <p style={{ fontFamily: KANIT, fontSize: 13, color: '#a0a0a0', marginBottom: 20 }}>
        Available — Supporting {pet.name}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          { label: 'Performance', value: `${pet.speed}%` },
          { label: 'Style', value: pet.chaos >= 70 ? 'Chaotic' : pet.chaos >= 45 ? 'Aggressive' : 'Steady' },
          { label: 'Wins', value: `${pet.wins}` },
        ].map(({ label, value }) => (
          <p key={label} style={{ fontFamily: KANIT, fontSize: 'clamp(13px, 1.3vw, 16px)', color: '#333' }}>
            {label}: {value}
          </p>
        ))}
      </div>
    </div>
  )
}

export function SponsorsPageClient({
  pets: petsProp,
  sponsors = [],
  sponsorEmail: emailProp,
}: {
  pets?: Pet[]
  sponsors?: DbSponsor[]
  sponsorEmail?: string
}) {
  const pets         = petsProp?.length ? petsProp : PETS
  const sponsorEmail = emailProp ?? SITE.sponsorEmail

  const [modal, setModal] = useState<Modal>(null)
  const [authed, setAuthed] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [ctaHov, setCtaHov] = useState(false)

  const handleLogin      = () => { setAuthed(true); setModal(null) }
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

      <main style={{ background: '#f8f9fa', minHeight: '100vh', paddingTop: 87, position: 'relative', overflow: 'hidden' }}>

        {/* Glow blobs */}
        <div style={{ position: 'absolute', bottom: -149, left: -105, width: 764, height: 764, borderRadius: '50%', background: 'rgba(252,212,0,0.10)', filter: 'blur(32px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 278, right: -129, width: 683, height: 683, borderRadius: '50%', background: 'rgba(76,0,128,0.05)', filter: 'blur(32px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: `clamp(40px, 6vw, 72px) clamp(16px, 4vw, 48px) 80px`, position: 'relative', zIndex: 1 }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h1 style={{ fontFamily: KANIT, fontSize: 'clamp(28px, 4vw, 50px)', fontWeight: 700, color: '#0D0D14', marginBottom: 12 }}>
              Sponsor a Racer
            </h1>
            <p style={{ fontFamily: KANIT, fontSize: 'clamp(14px, 1.6vw, 20px)', color: '#555' }}>
              Race highlights, real hamsters, and behind-the-scenes content.
            </p>
          </div>

          {/* Cards — real sponsors if any, placeholder per-pet otherwise */}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 56 }}>
            {sponsors.length > 0
              ? sponsors.map((s) => <RealSponsorCard key={s.id} sponsor={s} />)
              : pets.map((pet) => <PlaceholderCard key={pet.id} pet={pet} />)
            }
          </div>

          {/* Get In Touch CTA */}
          <a
            href={`mailto:${sponsorEmail}`}
            onMouseEnter={() => setCtaHov(true)}
            onMouseLeave={() => setCtaHov(false)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
              width: '100%', padding: '24px 32px',
              background: '#FFE790', border: 'none', borderRadius: 70,
              fontFamily: KANIT, fontSize: 'clamp(18px, 2vw, 28px)', fontWeight: 700, color: '#0D0D14',
              textDecoration: 'none', cursor: 'pointer',
              opacity: ctaHov ? 0.9 : 1, transition: 'opacity 0.15s',
              boxShadow: '0 20px 40px rgba(77,67,83,0.08)',
            }}
          >
            Get In Touch
            <span style={{ fontSize: 20 }}>▶</span>
          </a>
        </div>
      </main>

      <LandingFooter />

      {modal === 'terms'      && <TermsModal onAccept={() => { localStorage.setItem(TERMS_KEY, '1'); setModal('login') }} />}
      {modal === 'login'      && <LoginModal onClose={() => setModal(null)} onLogin={handleLogin} />}
      {modal === 'deposit'    && <DepositModal address={walletAddress} onClose={() => setModal(null)} />}
      {modal === 'account'    && <AccountModal walletAddress={walletAddress || undefined} onClose={() => setModal(null)} onDeposit={() => setModal('deposit')} onDisconnect={handleDisconnect} />}
      {modal === 'howitworks' && <HowItWorksModal onClose={() => setModal(null)} onEnterArena={() => setModal(authed ? null : 'login')} />}
    </>
  )
}
