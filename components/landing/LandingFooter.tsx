'use client'
import { useState } from 'react'
import { useIsMobile } from '@/components/ui/index'
import { LegalModal, LEGAL_LINKS, type LegalModalType } from './LegalModal'
import { HowItWorksModal } from './HowItWorksModal'
import { RaceRulesModal } from './RaceRulesModal'
import { SITE } from '@/config/site'

// Figma 36:210 — 1280×350, bg:#FFE790
const BG    = '#FFE790'
const MUTED = '#503F00'
const BLACK = '#000000'
const KANIT = "var(--font-kanit), sans-serif"
const PRET  = "Pretendard, sans-serif"

const link: React.CSSProperties = {
  fontFamily: PRET, fontWeight: 500, fontSize: 14,
  color: MUTED, lineHeight: '17px', textDecoration: 'none',
}

interface LandingFooterProps {
  footerBrandDesc?: string
  footerTaglineRight?: string
  footerTagline?: string
  twitterUrl?: string | null
  tiktokUrl?: string | null
  instagramUrl?: string | null
  youtubeUrl?: string | null
  sponsorEmail?: string
}

export function LandingFooter({
  footerBrandDesc = 'Live hamster racing powered by community participation',
  footerTaglineRight = 'Real hamsters.\nReal races.\nOne tiny champion.',
  twitterUrl,
  tiktokUrl,
  instagramUrl,
  youtubeUrl,
  sponsorEmail = SITE.sponsorEmail,
}: LandingFooterProps) {
  const isMobile = useIsMobile()
  const [legalModal, setLegalModal] = useState<LegalModalType | null>(null)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [showRaceRules, setShowRaceRules] = useState(false)

  const socials: [string, string | null | undefined][] = [
    ['X', twitterUrl],
    ['Youtube', youtubeUrl],
    ['Instagram', instagramUrl],
    ['Tiktok', tiktokUrl],
  ]

  if (isMobile) {
    return (
      <footer id="footer" style={{ background: BG, padding: '40px 24px 32px' }}>
        {/* Brand */}
        <p style={{ fontFamily: KANIT, fontWeight: 500, fontSize: 28, color: BLACK, lineHeight: '34px', margin: '0 0 4px' }}>Hamstar</p>
        <p style={{ fontFamily: PRET, fontWeight: 500, fontSize: 14, color: MUTED, lineHeight: '19px', margin: '0 0 28px' }}>
          {footerBrandDesc}
        </p>

        {/* Columns */}
        <div style={{ display: 'flex', gap: 48, marginBottom: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontFamily: PRET, fontWeight: 600, fontSize: 16, color: MUTED, margin: 0 }}>Social</p>
            {socials.map(([label, href]) => (
              <a key={label} href={href || '#'} target={href ? '_blank' : undefined} rel="noopener noreferrer" style={link}>{label}</a>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontFamily: PRET, fontWeight: 600, fontSize: 16, color: MUTED, margin: 0 }}>Learn</p>
            <button onClick={() => setShowHowItWorks(true)} style={{ ...link, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>How Hamstar Works</button>
            <button onClick={() => setShowRaceRules(true)} style={{ ...link, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>Race Rules</button>
          </div>
        </div>

        {/* Right tagline */}
        <p style={{ fontFamily: KANIT, fontWeight: 400, fontSize: 20, color: BLACK, lineHeight: '26px', margin: '0 0 12px', whiteSpace: 'pre-line' }}>
          {footerTaglineRight}
        </p>
        <a href={sponsorEmail ? `mailto:${sponsorEmail}` : '#'} style={{ ...link, display: 'block', marginBottom: 24 }}>Contact us</a>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(80,63,0,0.3)', marginBottom: 16 }} />

        {/* Legal */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 0' }}>
          {LEGAL_LINKS.map(({ type, label }, i, arr) => (
            <span key={type} style={{ display: 'flex', alignItems: 'center' }}>
              <button onClick={() => setLegalModal(type)} style={{ fontFamily: PRET, fontWeight: 500, fontSize: 13, color: MUTED, textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>{label}</button>
              {i < arr.length - 1 && <span style={{ margin: '0 10px', color: MUTED, opacity: 0.4, fontSize: 13 }}>·</span>}
            </span>
          ))}
        </div>
      {showHowItWorks && <HowItWorksModal onClose={() => setShowHowItWorks(false)} onEnterArena={() => setShowHowItWorks(false)} />}
      {showRaceRules && <RaceRulesModal onClose={() => setShowRaceRules(false)} />}
    </footer>
    )
  }

  return (
    <>
    <footer id="footer" style={{ background: BG }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(32px, 4vw, 56px) clamp(24px, 4vw, 64px) 0' }}>

        {/* Brand row */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontFamily: KANIT, fontWeight: 700, fontSize: 'clamp(24px, 2.5vw, 34px)', color: BLACK, lineHeight: 1.2, margin: '0 0 8px' }}>Hamstar</p>
          <p style={{ fontFamily: PRET, fontWeight: 500, fontSize: 16, color: MUTED, lineHeight: '19px', margin: 0, whiteSpace: 'nowrap' }}>
            {footerBrandDesc}
          </p>
        </div>

        {/* Columns + tagline row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 40, flexWrap: 'wrap', paddingBottom: 40 }}>

          {/* Left: Social + Learn columns */}
          <div style={{ display: 'flex', gap: 48 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontFamily: PRET, fontWeight: 600, fontSize: 18, color: MUTED, lineHeight: '27px', margin: 0 }}>Social</p>
              {socials.map(([label, href]) => (
                <a key={label} href={href || '#'} target={href ? '_blank' : undefined} rel="noopener noreferrer" style={link}>{label}</a>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontFamily: PRET, fontWeight: 600, fontSize: 18, color: MUTED, lineHeight: '27px', margin: 0 }}>Learn</p>
              <button onClick={() => setShowHowItWorks(true)} style={{ ...link, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>How Hamstar Works</button>
              <button onClick={() => setShowRaceRules(true)} style={{ ...link, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>Race Rules</button>
            </div>
          </div>

          {/* Right: tagline + contact */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16 }}>
            <p style={{ fontFamily: KANIT, fontWeight: 400, fontSize: 'clamp(18px, 1.8vw, 24px)', color: BLACK, lineHeight: '32px', margin: 0, textAlign: 'right', whiteSpace: 'pre-line' }}>
              {footerTaglineRight}
            </p>
            <a href={sponsorEmail ? `mailto:${sponsorEmail}` : '#'} style={link}>Contact us</a>
          </div>
        </div>

        {/* Dashed divider */}
        <div style={{ borderTop: '1.5px dashed rgba(80,63,0,0.35)', marginBottom: 16 }} />

        {/* Legal */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center', gap: '6px 0', paddingBottom: 24 }}>
          {LEGAL_LINKS.map(({ type, label }, i, arr) => (
            <span key={type} style={{ display: 'flex', alignItems: 'center' }}>
              <button onClick={() => setLegalModal(type)} style={{ fontFamily: PRET, fontWeight: 500, fontSize: 13, color: MUTED, lineHeight: '20px', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>{label}</button>
              {i < arr.length - 1 && <span style={{ margin: '0 12px', color: MUTED, opacity: 0.4, fontSize: 13 }}>·</span>}
            </span>
          ))}
        </div>
      </div>
    </footer>
    {legalModal && <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />}
    {showHowItWorks && <HowItWorksModal onClose={() => setShowHowItWorks(false)} onEnterArena={() => setShowHowItWorks(false)} />}
    {showRaceRules && <RaceRulesModal onClose={() => setShowRaceRules(false)} />}
    </>
  )
}
