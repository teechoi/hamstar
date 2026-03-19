'use client'
import { SITE } from '@/config/site'

const GOLD = '#F5D050'
const DARK = '#0D0D14'

const linkStyle: React.CSSProperties = {
  color: DARK,
  textDecoration: 'none',
  fontSize: 14,
  fontWeight: 600,
  display: 'block',
  marginBottom: 6,
  opacity: 0.8,
  transition: 'opacity 0.15s',
}

export function LandingFooter() {
  const { socials } = SITE

  return (
    <footer id="footer" style={{ background: GOLD, position: 'relative', zIndex: 1 }}>

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
          <p style={{ fontWeight: 900, fontSize: 22, color: DARK, marginBottom: 4 }}>Hamstar</p>
          <p style={{ fontSize: 13, color: 'rgba(13,13,20,0.65)', marginBottom: 28, fontWeight: 500 }}>
            Live hamster racing powered by community participation
          </p>

          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
            {/* Social */}
            <div>
              <p style={{ fontWeight: 800, fontSize: 13, color: DARK, marginBottom: 10 }}>Social</p>
              {socials.twitter   && <a href={socials.twitter}   target="_blank" rel="noopener noreferrer" style={linkStyle}>X</a>}
              {socials.youtube   && <a href={socials.youtube}   target="_blank" rel="noopener noreferrer" style={linkStyle}>Youtube</a>}
              {socials.instagram && <a href={socials.instagram} target="_blank" rel="noopener noreferrer" style={linkStyle}>Instagram</a>}
              {socials.tiktok    && <a href={socials.tiktok}    target="_blank" rel="noopener noreferrer" style={linkStyle}>Tiktok</a>}
            </div>

            {/* Learn */}
            <div>
              <p style={{ fontWeight: 800, fontSize: 13, color: DARK, marginBottom: 10 }}>Learn</p>
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
            fontWeight: 900, fontSize: 'clamp(16px, 2vw, 20px)',
            color: DARK, textAlign: 'right', lineHeight: 1.4,
          }}>
            Real hamsters.<br />
            Real races.<br />
            One tiny champion.
          </p>
          <a
            href={`mailto:${SITE.sponsorEmail}`}
            style={{ color: DARK, fontWeight: 700, fontSize: 13, textDecoration: 'none', marginTop: 24 }}
          >
            Contact us
          </a>
        </div>
      </div>

      {/* Dashed divider */}
      <div style={{
        borderTop: `1.5px dashed rgba(13,13,20,0.25)`,
        margin: '0 32px',
      }} />

      {/* Bottom legal bar */}
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'center',
        gap: 24,
        flexWrap: 'wrap',
      }}>
        {['Terms of Use', 'Risk Disclosure', 'Animal Welfare', 'Privacy Policy'].map(label => (
          <a key={label} href="#" style={{
            color: 'rgba(13,13,20,0.6)',
            fontSize: 12, fontWeight: 600,
            textDecoration: 'none',
          }}>
            {label}
          </a>
        ))}
      </div>
    </footer>
  )
}
