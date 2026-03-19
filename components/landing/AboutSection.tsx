export function AboutSection() {
  return (
    <section id="about" style={{
      background: '#F0F0F0',
      padding: '80px 24px 80px',
      position: 'relative',
      overflow: 'hidden',
      minHeight: 300,
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 48 }}>
          <img src="/images/sunflower-seed.png" alt="" style={{ width: 24, opacity: 0.8 }} />
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: '#0D0D14', letterSpacing: -0.5 }}>
            About Hamstar
          </h2>
          <img src="/images/sunflower-seed.png" alt="" style={{ width: 24, opacity: 0.8 }} />
        </div>

        <div style={{
          textAlign: 'center',
          fontSize: 'clamp(15px, 1.8vw, 18px)',
          lineHeight: 1.75,
          color: '#1a1a2e',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <p>Hamstar is a tiny internet sport built around real hamster races.</p>
          <p>
            In each race, three hamsters compete on a small track<br />
            while the community watches the race live and cheers for their favourite racer.
          </p>
          <p>It&apos;s simple, fast, and unpredictable, just like the hamsters themselves.</p>
          <p style={{ fontWeight: 700 }}>Real hamsters. Real races. One tiny champion.</p>
        </div>
      </div>

      {/* Left — hamster on wheel, partially off-screen */}
      <img src="/images/hamster-wheel.png" alt="" style={{
        position: 'absolute', left: -30, top: '50%',
        transform: 'translateY(-50%)',
        width: 'clamp(140px, 18vw, 260px)',
        pointerEvents: 'none',
      }} />

      {/* Right — sunflower, anchored bottom-right */}
      <img src="/images/sunflower.png" alt="" style={{
        position: 'absolute', right: 0, bottom: 0,
        width: 'clamp(100px, 13vw, 190px)',
        pointerEvents: 'none',
      }} />
    </section>
  )
}
