'use client'
import { SITE } from '@/config/site'
import { useIsMobile } from '@/components/ui/index'

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

export function LandingFooter() {
  const { socials, sponsorEmail } = SITE
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <footer id="footer" style={{ background: BG, padding: '40px 24px 32px' }}>
        {/* Brand */}
        <p style={{ fontFamily: KANIT, fontWeight: 500, fontSize: 28, color: BLACK, lineHeight: '34px', margin: '0 0 4px' }}>Hamstar</p>
        <p style={{ fontFamily: PRET, fontWeight: 500, fontSize: 14, color: MUTED, lineHeight: '19px', margin: '0 0 28px' }}>
          Live hamster racing powered by community participation
        </p>

        {/* Columns */}
        <div style={{ display: 'flex', gap: 48, marginBottom: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontFamily: PRET, fontWeight: 600, fontSize: 16, color: MUTED, margin: 0 }}>Social</p>
            {socials.twitter   && <a href={socials.twitter}   target="_blank" rel="noopener noreferrer" style={link}>X</a>}
            {socials.youtube   && <a href={socials.youtube}   target="_blank" rel="noopener noreferrer" style={link}>Youtube</a>}
            {socials.instagram && <a href={socials.instagram} target="_blank" rel="noopener noreferrer" style={link}>Instagram</a>}
            {socials.tiktok    && <a href={socials.tiktok}    target="_blank" rel="noopener noreferrer" style={link}>Tiktok</a>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontFamily: PRET, fontWeight: 600, fontSize: 16, color: MUTED, margin: 0 }}>Learn</p>
            <a href="#about" onClick={e => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }) }} style={link}>How Hamstar Works</a>
            <a href="#" style={link}>Race Rules</a>
          </div>
        </div>

        {/* Right tagline */}
        <p style={{ fontFamily: KANIT, fontWeight: 500, fontSize: 20, color: BLACK, lineHeight: '26px', margin: '0 0 12px' }}>
          Real hamsters.{'\n'}Real races.{'\n'}One tiny champion.
        </p>
        <a href={`mailto:${sponsorEmail}`} style={{ ...link, display: 'block', marginBottom: 24 }}>Contact us</a>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(80,63,0,0.3)', marginBottom: 16 }} />

        {/* Legal */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px' }}>
          {['Terms of Use', 'Risk Disclosure', 'Privacy Policy', 'Animal Welfare'].map(label => (
            <a key={label} href="#" style={{ fontFamily: PRET, fontWeight: 500, fontSize: 12, color: MUTED, textDecoration: 'none' }}>{label}</a>
          ))}
        </div>
      </footer>
    )
  }

  return (
    <footer id="footer" style={{ background: BG }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(32px, 4vw, 56px) clamp(24px, 8vw, 200px) 0' }}>
        {/* Main row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 40, flexWrap: 'wrap', paddingBottom: 40 }}>

          {/* Left: brand + columns */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 260 }}>
            <div>
              <p style={{ fontFamily: KANIT, fontWeight: 500, fontSize: 'clamp(24px, 2.5vw, 34px)', color: BLACK, lineHeight: 1.2, margin: '0 0 8px' }}>Hamstar</p>
              <p style={{ fontFamily: PRET, fontWeight: 500, fontSize: 16, color: MUTED, lineHeight: '19px', margin: 0, maxWidth: 320 }}>
                Live hamster racing powered by community participation
              </p>
            </div>
            <div style={{ display: 'flex', gap: 48 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ fontFamily: PRET, fontWeight: 600, fontSize: 18, color: MUTED, lineHeight: '27px', margin: 0 }}>Social</p>
                {([['X', socials.twitter], ['Youtube', socials.youtube], ['Instagram', socials.instagram], ['Tiktok', socials.tiktok]] as [string, string | undefined][]).map(([label, href]) => href && (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={link}>{label}</a>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ fontFamily: PRET, fontWeight: 600, fontSize: 18, color: MUTED, lineHeight: '27px', margin: 0 }}>Learn</p>
                <a href="#about" onClick={e => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }) }} style={link}>How Hamstar Works</a>
                <a href="#" style={link}>Race Rules</a>
              </div>
            </div>
          </div>

          {/* Right: tagline + contact */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16 }}>
            <p style={{ fontFamily: KANIT, fontWeight: 500, fontSize: 'clamp(18px, 1.8vw, 24px)', color: BLACK, lineHeight: '29px', margin: 0, textAlign: 'right', whiteSpace: 'pre-line' }}>
              {`Real hamsters.\nReal races.\nOne tiny champion.`}
            </p>
            <a href={`mailto:${sponsorEmail}`} style={link}>Contact us</a>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(80,63,0,0.3)', marginBottom: 16 }} />

        {/* Legal */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px 24px', paddingBottom: 20 }}>
          {['Terms of Use', 'Risk Disclosure', 'Privacy Policy', 'Animal Welfare'].map(label => (
            <a key={label} href="#" style={{ fontFamily: PRET, fontWeight: 500, fontSize: 12, color: MUTED, lineHeight: '14px', textDecoration: 'none' }}>{label}</a>
          ))}
        </div>
      </div>
    </footer>
  )
}
