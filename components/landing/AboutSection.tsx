'use client'

const KANIT = "var(--font-kanit), sans-serif"

export function AboutSection() {
  return (
    <section id="about" style={{
      background: '#F2F2F2',
      padding: '80px 24px 100px',
      overflow: 'hidden',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        display: 'flex', alignItems: 'center', gap: 'clamp(24px, 5vw, 80px)',
      }}>

        {/* Left: images */}
        <div style={{
          position: 'relative',
          flexShrink: 0,
          width: 'clamp(180px, 28vw, 360px)',
          alignSelf: 'stretch',
        }}>
          {/* Tilted card behind image */}
          <div style={{
            position: 'absolute',
            inset: '-8%',
            background: '#fff',
            border: '1.5px solid #e0e0e0',
            borderRadius: 24,
            transform: 'rotate(-11.5deg)',
            zIndex: 0,
          }} />
          <img
            src="/images/hamster-wheel.png"
            alt=""
            style={{ width: '100%', display: 'block', position: 'relative', zIndex: 1 }}
          />
          <img
            src="/images/sunflower.png"
            alt=""
            style={{
              position: 'absolute',
              bottom: -20,
              right: -24,
              width: '55%',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />
        </div>

        {/* Right: text */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <img src="/images/sunflower-seed.png" alt="" style={{ width: 32, opacity: 0.85 }} />
            <h2 style={{
              fontFamily: KANIT,
              fontSize: 'clamp(32px, 4vw, 64px)',
              fontWeight: 600,
              color: '#000',
              margin: 0,
            }}>
              About Hamstar
            </h2>
            <img src="/images/sunflower-seed.png" alt="" style={{ width: 32, opacity: 0.85 }} />
          </div>

          <div style={{
            fontFamily: KANIT,
            fontSize: 'clamp(15px, 1.8vw, 22px)',
            fontWeight: 400,
            lineHeight: 1.6,
            color: '#000',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <p>Hamstar is a tiny internet sport built around real hamster races.</p>
            <p>
              In each race, three hamsters compete on a small track
              while the community watches the race live and cheers for their favourite racer.
            </p>
            <p>It&apos;s simple, fast, and unpredictable, just like the hamsters themselves.</p>
          </div>
        </div>

      </div>
    </section>
  )
}
