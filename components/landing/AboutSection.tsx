'use client'

const KANIT = "var(--font-kanit), sans-serif"

export function AboutSection() {
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
        width: 1280,
        height: 526,
        left: '50%',
        transform: 'translateX(-50%)',
      }}>

        {/* Left group — x=167, y=76, 394×380 */}
        <div style={{ position: 'absolute', left: 167, top: 76, width: 394, height: 380 }}>
          {/* Tilted decorative card behind */}
          <div style={{
            position: 'absolute', left: 0, top: 0,
            width: 380, height: 380,
            borderRadius: 23,
            background: '#FFFFFF',
            border: '1.5px solid #e0e0e0',
            transform: 'rotate(-11.5deg)',
            zIndex: 0,
          }} />
          {/* Main white card — straight */}
          <div style={{
            position: 'absolute', left: 0, top: 0,
            width: 380, height: 380,
            borderRadius: 23,
            background: '#FFFFFF',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            zIndex: 1,
          }} />
          {/* Hamster wheel image — local (62, 44), 219×291 */}
          <img
            src="/images/hamster-wheel.png"
            alt="Hamster on wheel"
            style={{
              position: 'absolute', left: 62, top: 44,
              width: 219, height: 291,
              objectFit: 'contain',
              zIndex: 2,
            }}
          />
          {/* Sunflower image — local (257, 190), 137×172 */}
          <img
            src="/images/sunflower.png"
            alt=""
            style={{
              position: 'absolute', left: 257, top: 190,
              width: 137, height: 172,
              objectFit: 'contain',
              zIndex: 3,
            }}
          />
        </div>

        {/* Right frame — x=640, y=56, 566×368, flex VERTICAL, justify CENTER, pad 20/10, gap 10 */}
        <div style={{
          position: 'absolute', left: 640, top: 56,
          width: 566, height: 368,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '20px 10px',
          gap: 10,
          boxSizing: 'border-box',
        }}>
          <img src="/images/sunflower-seed.png" alt="" style={{ width: 29, height: 43, objectFit: 'contain' }} />
          <h2 style={{
            fontFamily: KANIT,
            fontWeight: 700,
            fontSize: 40,
            color: '#000000',
            lineHeight: '48px',
            margin: 0,
          }}>
            About Hamstar
          </h2>
          <p style={{
            fontFamily: 'Pretendard, sans-serif',
            fontWeight: 500,
            fontSize: 18,
            color: '#242424',
            lineHeight: '27px',
            margin: 0,
          }}>
            Hamstar is a tiny internet sport built around real hamster races. In each race, three hamsters compete on a small track while the community watches the race live and cheers for their favourite racer. It&apos;s simple, fast, and unpredictable, just like the hamsters themselves.
          </p>
        </div>

      </div>
    </section>
  )
}
