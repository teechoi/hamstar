'use client'
import { useIsMobile } from '@/components/ui/index'

const KANIT = "var(--font-kanit), sans-serif"

const DEFAULT_ABOUT_TEXT = "Hamstar is a tiny internet sport built around real hamster races. In each race, three hamsters compete on a small track while the community watches the race live and cheers for their favourite racer. It's simple, fast, and unpredictable, just like the hamsters themselves."

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
      <section id="about" style={{ background: '#F8F9FA', padding: '48px 24px 56px' }}>
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
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: 16, color: '#242424', lineHeight: '24px', margin: 0, whiteSpace: 'pre-line' }}>
            {bodyText}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section id="about" style={{
      background: '#F8F9FA',
      height: 526,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 1280×526 canvas, centered */}
      <div style={{
        position: 'absolute',
        width: 1280, height: 526,
        left: '50%', transform: 'translateX(-50%)',
      }}>
        {/* Left group — Figma: Group 36 at x=167, y=76
            Rectangle 22: 380×380, rot=-0.2019rad = -11.57°, cornerRadius 23
            image 13 (hamster wheel): at group-rel (62, 44), 218×291 — not rotated, sits on top
            image 25 (sunflower): at group-rel (257, 190), 137×172 — not rotated, sits on top */}
        <div style={{ position: 'absolute', left: 167, top: 76, width: 414, height: 420 }}>
          {/* Tilted white card */}
          <div style={{
            position: 'absolute', left: 0, top: 0, width: 380, height: 380,
            borderRadius: 23, background: '#FFFFFF',
            boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
            transform: 'rotate(-11.57deg)',
            transformOrigin: 'center center',
          }} />
          {/* Hamster wheel — on top of tilted card, not rotated */}
          <img
            src="/images/hamster-wheel.png"
            alt="Hamster on wheel"
            style={{ position: 'absolute', left: 20, top: 0, width: 290, height: 380, objectFit: 'contain', zIndex: 1 }}
          />
          {/* Sunflower — on top, extends past card right edge */}
          <img
            src="/images/sunflower.png"
            alt=""
            style={{ position: 'absolute', left: 235, top: 155, width: 185, height: 232, objectFit: 'contain', zIndex: 2 }}
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
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: 18, color: '#242424', lineHeight: '27px', margin: 0, whiteSpace: 'pre-line' }}>
            {bodyText}
          </p>
        </div>
      </div>
    </section>
  )
}
