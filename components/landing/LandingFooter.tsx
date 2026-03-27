'use client'
import { SITE } from '@/config/site'

// Figma 36:210 — 1280×350, bg:#FFE68F
const BG    = '#FFE68F'
const MUTED = '#503E00'
const BLACK = '#000000'
const KANIT = "var(--font-kanit), sans-serif"
const PRET  = "Pretendard, sans-serif"

export function LandingFooter() {
  const { socials, sponsorEmail } = SITE

  return (
    <footer id="footer" style={{
      background: BG,
      position: 'relative',
      overflow: 'hidden',
      minHeight: 350,
    }}>
      {/* 1280×350 canvas, centered */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 1280,
        margin: '0 auto',
        height: 350,
      }}>

        {/* "Hamstar" — x=200, y=30, Kanit 500 34px #000 lh:41px */}
        <p style={{
          position: 'absolute', left: 200, top: 30,
          fontFamily: KANIT, fontWeight: 500, fontSize: 34,
          color: BLACK, lineHeight: '41px', margin: 0,
        }}>
          Hamstar
        </p>

        {/* Tagline — x=200, y=81, w=413, Pretendard 500 16px #503E00 lh:19px */}
        <p style={{
          position: 'absolute', left: 200, top: 81,
          width: 413,
          fontFamily: PRET, fontWeight: 500, fontSize: 16,
          color: MUTED, lineHeight: '19px', margin: 0,
        }}>
          Live hamster racing powered by community participation
        </p>

        {/* Social heading — x=200, y=130, Pretendard 600 18px lh:27px */}
        <p style={{
          position: 'absolute', left: 200, top: 130,
          fontFamily: PRET, fontWeight: 600, fontSize: 18,
          color: MUTED, lineHeight: '27px', margin: 0,
        }}>
          Social
        </p>

        {/* Social links — x=200, y=164/191/218/245, gap 27px (lh:17px + 10px) */}
        {([
          ['X',         socials.twitter],
          ['Youtube',   socials.youtube],
          ['Instagram', socials.instagram],
          ['Tiktok',    socials.tiktok],
        ] as [string, string | undefined][]).map(([label, href], i) => href && (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: 'absolute', left: 200, top: 164 + i * 27,
              fontFamily: PRET, fontWeight: 500, fontSize: 14,
              color: MUTED, lineHeight: '17px', textDecoration: 'none',
            }}
          >
            {label}
          </a>
        ))}

        {/* Learn heading — x=416, y=130, Pretendard 600 18px lh:27px */}
        <p style={{
          position: 'absolute', left: 416, top: 130,
          fontFamily: PRET, fontWeight: 600, fontSize: 18,
          color: MUTED, lineHeight: '27px', margin: 0,
        }}>
          Learn
        </p>

        {/* How Hamstar Works — x=416, y=164 */}
        <a
          href="#about"
          onClick={e => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }) }}
          style={{
            position: 'absolute', left: 416, top: 164,
            fontFamily: PRET, fontWeight: 500, fontSize: 14,
            color: MUTED, lineHeight: '17px', textDecoration: 'none',
          }}
        >
          How Hamstar Works
        </a>

        {/* Race Rules — x=416, y=191 */}
        <a
          href="#"
          style={{
            position: 'absolute', left: 416, top: 191,
            fontFamily: PRET, fontWeight: 500, fontSize: 14,
            color: MUTED, lineHeight: '17px', textDecoration: 'none',
          }}
        >
          Race Rules
        </a>

        {/* Right tagline — x=869, y=130, w=211, Kanit 500 24px #000 lh:29px */}
        <p style={{
          position: 'absolute', left: 869, top: 130,
          width: 211,
          fontFamily: KANIT, fontWeight: 500, fontSize: 24,
          color: BLACK, lineHeight: '29px', margin: 0,
          whiteSpace: 'pre-line',
        }}>
          {`Real hamsters.\nReal races.\nOne tiny champion.`}
        </p>

        {/* Contact us — x=1010, y=245, Pretendard 500 14px #503E00 lh:17px */}
        <a
          href={`mailto:${sponsorEmail}`}
          style={{
            position: 'absolute', left: 1010, top: 245,
            fontFamily: PRET, fontWeight: 500, fontSize: 14,
            color: MUTED, lineHeight: '17px', textDecoration: 'none',
          }}
        >
          Contact us
        </a>

        {/* Divider — y=292, full width */}
        <div style={{
          position: 'absolute', left: 0, top: 292,
          width: '100%', height: 1,
          background: 'rgba(80,62,0,0.3)',
        }} />

        {/* Legal links — y=314: Terms x=423, Risk x=536, Privacy x=659, Animal x=775 */}
        {([
          ['Terms of Use',    423],
          ['Risk Disclosure', 536],
          ['Privacy Policy',  659],
          ['Animal Welfare',  775],
        ] as [string, number][]).map(([label, x]) => (
          <a
            key={label}
            href="#"
            style={{
              position: 'absolute', left: x, top: 314,
              fontFamily: PRET, fontWeight: 500, fontSize: 12,
              color: MUTED, lineHeight: '14px', textDecoration: 'none',
            }}
          >
            {label}
          </a>
        ))}

      </div>
    </footer>
  )
}
