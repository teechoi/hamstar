'use client'
import { SITE } from '@/config/site'

const YELLOW = '#FFE790'
const DARK = '#0D0D14'
const MUTED = '#503f00'
const KANIT = "var(--font-kanit), sans-serif"

const linkStyle: React.CSSProperties = {
  fontFamily: KANIT,
  color: MUTED,
  textDecoration: 'none',
  fontSize: 'clamp(14px, 1.4vw, 18px)',
  fontWeight: 400,
  display: 'block',
  marginBottom: 8,
  transition: 'opacity 0.15s',
}

const headingStyle: React.CSSProperties = {
  fontFamily: KANIT,
  fontWeight: 600,
  fontSize: 'clamp(14px, 1.4vw, 20px)',
  color: '#ddad03',
  marginBottom: 12,
}

export function LandingFooter() {
  const { socials } = SITE

  return (
    <footer id="footer" style={{ background: YELLOW, position: 'relative', zIndex: 1 }}>

      {/* Main footer body */}
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '160px 32px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 40,
      }}>

        {/* Left: brand + links */}
        <div>
          <p style={{ fontFamily: KANIT, fontWeight: 700, fontSize: 'clamp(22px, 2.5vw, 36px)', color: DARK, marginBottom: 4 }}>
            Hamstar
          </p>
          <p style={{ fontFamily: KANIT, fontSize: 'clamp(13px, 1.3vw, 18px)', color: MUTED, marginBottom: 28, fontWeight: 400 }}>
            Live hamster racing powered by community participation
          </p>

          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
            {/* Social */}
            <div>
              <p style={headingStyle}>Social</p>
              {socials.twitter   && <a href={socials.twitter}   target="_blank" rel="noopener noreferrer" style={linkStyle}>X</a>}
              {socials.youtube   && <a href={socials.youtube}   target="_blank" rel="noopener noreferrer" style={linkStyle}>Youtube</a>}
              {socials.instagram && <a href={socials.instagram} target="_blank" rel="noopener noreferrer" style={linkStyle}>Instagram</a>}
              {socials.tiktok    && <a href={socials.tiktok}    target="_blank" rel="noopener noreferrer" style={linkStyle}>Tiktok</a>}
            </div>

            {/* Learn */}
            <div>
              <p style={headingStyle}>Learn</p>
              <a href="#about" style={linkStyle} onClick={e => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }) }}>
                How Hamstar Works
              </a>
              <a href="#" style={linkStyle}>Race Rules</a>
            </div>
          </div>
        </div>

        {/* Right: tagline + contact */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <p style={{
            fontFamily: KANIT,
            fontWeight: 600,
            fontSize: 'clamp(16px, 1.8vw, 26px)',
            color: DARK,
            textAlign: 'right',
            lineHeight: 1.4,
          }}>
            Real hamsters.<br />
            Real races.<br />
            One tiny champion.
          </p>
          <a
            href={`mailto:${SITE.sponsorEmail}`}
            style={{ fontFamily: KANIT, color: MUTED, fontWeight: 400, fontSize: 'clamp(13px, 1.3vw, 18px)', textDecoration: 'none', marginTop: 24 }}
          >
            Contact us
          </a>
        </div>
      </div>

      {/* Dashed divider */}
      <div style={{
        borderTop: `1.5px dashed rgba(80,63,0,0.35)`,
        margin: '0 32px',
      }} />

      {/* Bottom legal bar */}
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'center',
        gap: 28,
        flexWrap: 'wrap',
      }}>
        {['Terms of Use', 'Risk Disclosure', 'Animal Welfare', 'Privacy Policy'].map(label => (
          <a key={label} href="#" style={{
            fontFamily: KANIT,
            color: MUTED,
            fontSize: 'clamp(12px, 1.2vw, 16px)',
            fontWeight: 400,
            textDecoration: 'none',
          }}>
            {label}
          </a>
        ))}
      </div>
    </footer>
  )
}
