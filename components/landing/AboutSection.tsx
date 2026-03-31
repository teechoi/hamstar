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
        padding: '120px 24px',
      }}>
        {/* Image area — pre-composed image */}
        <img
          src="/images/about-hamstar.png"
          alt="Hamster on wheel"
          style={{ width: 'min(300px, 84vw)', height: 'min(300px, 84vw)', objectFit: 'contain', display: 'block', margin: '0 auto 40px' }}
        />

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
      paddingTop: 'max(120px, calc((100vh - 526px) / 2 - 48px))',
      overflow: 'hidden',
    }}>
      {/* 1280×526 canvas, vertically centered */}
      <div style={{
        position: 'relative',
        width: 1280, height: 526,
        margin: '0 auto',
        flexShrink: 0,
      }}>
        {/* Left group — pre-composed image (Group 36 (1).png) */}
        <img
          src="/images/about-hamstar.png"
          alt="Hamster on wheel"
          style={{ position: 'absolute', left: 147, top: 56, width: 430, height: 430, objectFit: 'contain' }}
        />

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
