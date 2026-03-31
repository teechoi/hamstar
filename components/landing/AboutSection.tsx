'use client'
import { useIsMobile } from '@/components/ui/index'

const KANIT = "var(--font-kanit), sans-serif"

const DEFAULT_ABOUT_TEXT = "Hamstar is a tiny internet sport built around real hamster races.\n\nIn each race, three hamsters compete on a small track while the community watches the race live and cheers for their favourite racer.\n\nIt's simple, fast, and unpredictable, just like the hamsters themselves."

export function AboutSection({
  aboutTitle = 'About Hamstar',
  aboutText,
}: {
  aboutTitle?: string
  aboutText?: string
}) {
  const isMobile = useIsMobile()
  const bodyText = aboutText || DEFAULT_ABOUT_TEXT

  if (isMobile) {
    return (
      <section id="about" style={{
        background: '#F8F9FA',
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '80px 24px',
      }}>
        {/* Image area — stacked on top, centered */}
        <div style={{ position: 'relative', width: 'min(280px, 80vw)', height: 'min(260px, 74vw)', margin: '0 auto 36px' }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, width: 260, height: 260,
            borderRadius: 23, background: '#FFFFFF',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          }} />
          <img
            src="/images/hamster-wheel.png"
            alt="Hamster on wheel"
            style={{ position: 'absolute', left: '10%', top: '8%', width: '55%', height: '75%', objectFit: 'contain' }}
          />
          <img
            src="/images/sunflower.png"
            alt=""
            style={{ position: 'absolute', right: 0, bottom: '-5%', width: '33%', objectFit: 'contain' }}
          />
        </div>

        {/* Text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <img src="/images/sunflower-seed.png" alt="" style={{ width: 22, height: 33, objectFit: 'contain' }} />
            <h2 style={{ fontFamily: KANIT, fontWeight: 700, fontSize: 32, color: '#000000', lineHeight: '40px', margin: 0 }}>
              {aboutTitle}
            </h2>
          </div>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: 16, color: '#000000', lineHeight: '24px', margin: 0, whiteSpace: 'pre-line' }}>
            {bodyText}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section id="about" style={{
      background: '#F8F9FA',
      minHeight: '100vh',
      display: 'flex', alignItems: 'flex-start',
      paddingTop: 'max(0px, calc((100vh - 526px) / 2))',
      overflow: 'hidden',
    }}>
      {/* 1280×526 canvas, vertically centered */}
      <div style={{
        position: 'relative',
        width: 1280, height: 526,
        margin: '0 auto',
        flexShrink: 0,
      }}>
        {/* Left group — Figma: Group 36 at x=167, y=76
            Rectangle 22: 380×380, rot=-0.2019rad = -11.57°, cornerRadius 23
            image 13 (hamster wheel): at group-rel (62, 44), 218×291 — not rotated, sits on top
            image 25 (sunflower): at group-rel (257, 190), 137×172 — not rotated, sits on top */}
        <div style={{ position: 'absolute', left: 167, top: 76, width: 394, height: 380 }}>
          {/* Background card — 380×380 at (0,0), rotated -11.46deg (Figma: rot=-0.20rad) */}
          <div style={{
            position: 'absolute', left: 0, top: 0, width: 380, height: 380,
            borderRadius: 23,
            overflow: 'hidden',
            transform: 'rotate(-11.46deg)',
            transformOrigin: 'center center',
          }}>
            <img src="/images/about-bg.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          {/* Hamster wheel — Figma: (62,45) 219×291 */}
          <img
            src="/images/hamster-wheel.png"
            alt="Hamster on wheel"
            style={{ position: 'absolute', left: 62, top: 45, width: 219, height: 291, objectFit: 'contain', zIndex: 1 }}
          />
          {/* Sunflower — Figma: (257,190) 137×172 */}
          <img
            src="/images/sunflower.png"
            alt=""
            style={{ position: 'absolute', left: 257, top: 190, width: 137, height: 172, objectFit: 'contain', zIndex: 2 }}
          />
        </div>

        {/* Right frame — x=640, y=56, 566×368, Figma AutoLayout flex-start gap=10 padding=20/10/20/10 */}
        <div style={{
          position: 'absolute', left: 640, top: 56, width: 566, height: 368,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
          padding: '20px 10px', gap: 10, boxSizing: 'border-box',
        }}>
          <img src="/images/sunflower-seed.png" alt="" style={{ width: 29, height: 43, objectFit: 'contain' }} />
          <h2 style={{ fontFamily: KANIT, fontWeight: 700, fontSize: 40, color: '#000000', lineHeight: '48px', margin: 0 }}>
            {aboutTitle}
          </h2>
          <div style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: 18, color: '#000000', lineHeight: '27px' }}>
            {bodyText.split('\n\n').map((para, i) => (
              <p key={i} style={{ margin: i === 0 ? 0 : '12px 0 0' }}>{para}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
