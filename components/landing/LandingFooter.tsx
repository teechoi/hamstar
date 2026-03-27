'use client'
import { SITE } from '@/config/site'
import { useIsMobile } from '@/components/ui/index'

// Figma 36:210 — 1280×350, bg:#FFE68F
const BG    = '#FFE68F'
const MUTED = '#503E00'
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
        <div style={{ height: 1, background: 'rgba(80,62,0,0.3)', marginBottom: 16 }} />

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
    <footer id="footer" style={{ background: BG, position: 'relative', overflow: 'hidden', minHeight: 350 }}>
      {/* 1280×350 canvas, centered */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 1280, margin: '0 auto', height: 350 }}>

        {/* "Hamstar" — x=200, y=30, Kanit 500 34px */}
        <p style={{ position: 'absolute', left: 200, top: 30, fontFamily: KANIT, fontWeight: 500, fontSize: 34, color: BLACK, lineHeight: '41px', margin: 0 }}>Hamstar</p>

        {/* Tagline — x=200, y=81 */}
        <p style={{ position: 'absolute', left: 200, top: 81, width: 413, fontFamily: PRET, fontWeight: 500, fontSize: 16, color: MUTED, lineHeight: '19px', margin: 0 }}>
          Live hamster racing powered by community participation
        </p>

        {/* Social heading — x=200, y=130 */}
        <p style={{ position: 'absolute', left: 200, top: 130, fontFamily: PRET, fontWeight: 600, fontSize: 18, color: MUTED, lineHeight: '27px', margin: 0 }}>Social</p>

        {/* Social links — x=200, y=164/191/218/245 */}
        {([['X', socials.twitter], ['Youtube', socials.youtube], ['Instagram', socials.instagram], ['Tiktok', socials.tiktok]] as [string, string | undefined][]).map(([label, href], i) => href && (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer"
            style={{ position: 'absolute', left: 200, top: 164 + i * 27, ...link }}>
            {label}
          </a>
        ))}

        {/* Learn heading — x=416, y=130 */}
        <p style={{ position: 'absolute', left: 416, top: 130, fontFamily: PRET, fontWeight: 600, fontSize: 18, color: MUTED, lineHeight: '27px', margin: 0 }}>Learn</p>

        {/* How Hamstar Works — x=416, y=164 */}
        <a href="#about" onClick={e => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }) }}
          style={{ position: 'absolute', left: 416, top: 164, ...link }}>
          How Hamstar Works
        </a>

        {/* Race Rules — x=416, y=191 */}
        <a href="#" style={{ position: 'absolute', left: 416, top: 191, ...link }}>Race Rules</a>

        {/* Right tagline — x=869, y=130, Kanit 500 24px */}
        <p style={{ position: 'absolute', left: 869, top: 130, width: 211, fontFamily: KANIT, fontWeight: 500, fontSize: 24, color: BLACK, lineHeight: '29px', margin: 0, whiteSpace: 'pre-line' }}>
          {`Real hamsters.\nReal races.\nOne tiny champion.`}
        </p>

        {/* Contact us — x=1010, y=245 */}
        <a href={`mailto:${sponsorEmail}`} style={{ position: 'absolute', left: 1010, top: 245, ...link }}>Contact us</a>

        {/* Divider — y=292 */}
        <div style={{ position: 'absolute', left: 0, top: 292, width: '100%', height: 1, background: 'rgba(80,62,0,0.3)' }} />

        {/* Legal — y=314: Terms x=423, Risk x=536, Privacy x=659, Animal x=775 */}
        {([['Terms of Use', 423], ['Risk Disclosure', 536], ['Privacy Policy', 659], ['Animal Welfare', 775]] as [string, number][]).map(([label, x]) => (
          <a key={label} href="#" style={{ position: 'absolute', left: x, top: 314, fontFamily: PRET, fontWeight: 500, fontSize: 12, color: MUTED, lineHeight: '14px', textDecoration: 'none' }}>{label}</a>
        ))}
      </div>
    </footer>
  )
}
