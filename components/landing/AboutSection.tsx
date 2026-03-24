'use client'
import { DecoImage } from '@/components/editor/DecoImage'

const KANIT = "var(--font-kanit), sans-serif"

export function AboutSection() {
  return (
    <section id="about" style={{
      background: '#F2F2F2',
      padding: '80px 24px 100px',
      position: 'relative',
      minHeight: 300,
    }}>
      <DecoImage id="about-wheel" className="section-deco" />
      <DecoImage id="about-sunflower" className="section-deco" />

      <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 60 }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 48 }}>
          <img src="/images/sunflower-seed.png" alt="" style={{ width: 32, opacity: 0.85 }} />
          <h2 style={{
            fontFamily: KANIT,
            fontSize: 'clamp(36px, 5vw, 72px)',
            fontWeight: 600,
            color: '#000',
            margin: 0,
          }}>
            About Hamstar
          </h2>
          <img src="/images/sunflower-seed.png" alt="" style={{ width: 32, opacity: 0.85 }} />
        </div>

        <div style={{
          textAlign: 'center',
          fontFamily: KANIT,
          fontSize: 'clamp(16px, 2vw, 24px)',
          fontWeight: 400,
          lineHeight: 1.6,
          color: '#000',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <p>Hamstar is a tiny internet sport built around real hamster races.</p>
          <p>
            In each race, three hamsters compete on a small track<br />
            while the community watches the race live and cheers for their favourite racer.
          </p>
          <p>It&apos;s simple, fast, and unpredictable, just like the hamsters themselves.</p>
        </div>
      </div>
    </section>
  )
}
