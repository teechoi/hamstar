'use client'
import { useCountdown } from '@/lib/hooks/useCountdown'
import { DecoImage } from '@/components/editor/DecoImage'
import { SITE } from '@/config/site'
import { useIsMobile } from '@/components/ui/index'

const YELLOW = '#FFE790'
const KANIT = "var(--font-kanit), sans-serif"

function CountdownCard({ targetMs, isLive, streamNote }: { streamUrl: string; targetMs: number; isLive: boolean; streamNote: string }) {
  const { h, m, s } = useCountdown(targetMs)
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    /* Card — x=258, y=221 in section, w=765 h=250, radius:20 */
    <div style={{
      position: 'absolute', left: 258, top: 221,
      width: 765, height: 250,
      borderRadius: 20,
      overflow: 'hidden',
      boxShadow: '0 20px 30px rgba(77,67,83,0.3)',
    }}>
      {/* BG image */}
      <img src="/images/arena-bg-blurred.png" alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      {/* Dark overlay — rgba(0,0,0,0.50) */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.50)' }} />

      <div style={{
        position: 'relative', zIndex: 1,
        height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        gap: 8,
      }}>
        {/* Badge — left=20, top=20 (absolute within card), w=145 h=26, radius:22, bg:#725DFF */}
        <div style={{
          position: 'absolute', left: 20, top: 20,
          width: 145, height: 26,
          borderRadius: 22,
          background: '#735DFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8,
        }}>
          <span style={{
            width: 15, height: 15, borderRadius: '50%',
            background: isLive ? '#ff4444' : '#FFFFFF',
            display: 'inline-block',
            animation: 'pulse 1.5s ease-in-out infinite',
            flexShrink: 0,
          }} />
          <span style={{
            fontFamily: KANIT,
            fontWeight: 500, fontSize: 12,
            color: '#FFFFFF',
            lineHeight: '14px',
          }}>
            {isLive ? 'LIVE NOW' : 'LIVE COUNTDOWN'}
          </span>
        </div>

        {/* "Next Race Starts in" — Kanit 500 20px white lh:24px */}
        {!isLive && (
          <p style={{
            fontFamily: KANIT, fontWeight: 500, fontSize: 20,
            color: '#FFFFFF',
            lineHeight: '24px',
            margin: 0,
          }}>
            Next Race Starts in
          </p>
        )}

        {/* Timer — Kanit 700 60px #FFE68F lh:72px */}
        <div style={{
          fontFamily: KANIT,
          fontWeight: 700, fontSize: 'clamp(40px, 5vw, 60px)',
          color: YELLOW,
          letterSpacing: 2, lineHeight: '72px',
        }}>
          {isLive ? 'LIVE NOW' : `${pad(h)}:${pad(m)}:${pad(s)}`}
        </div>

        {/* Footer — Pretendard 500 12px #D9D9D9 lh:14px */}
        <p style={{
          fontFamily: 'Pretendard, sans-serif',
          fontWeight: 500, fontSize: 12,
          color: '#D9D9D9',
          lineHeight: '14px',
          margin: 0,
        }}>
          {streamNote}
        </p>
      </div>
    </div>
  )
}

function MobileCountdownCard({ targetMs, isLive, streamNote }: { targetMs: number; isLive: boolean; streamNote: string }) {
  const { h, m, s } = useCountdown(targetMs)
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 30px rgba(77,67,83,0.3)', position: 'relative' }}>
      <img src="/images/arena-bg-blurred.png" alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.50)' }} />
      <div style={{ position: 'relative', zIndex: 1, padding: '28px 20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 16px', height: 26, borderRadius: 22, background: '#735DFF' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: isLive ? '#ff4444' : '#FFFFFF', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite', flexShrink: 0 }} />
          <span style={{ fontFamily: KANIT, fontWeight: 500, fontSize: 12, color: '#FFFFFF', lineHeight: '14px' }}>
            {isLive ? 'LIVE NOW' : 'LIVE COUNTDOWN'}
          </span>
        </div>
        {!isLive && (
          <p style={{ fontFamily: KANIT, fontWeight: 500, fontSize: 18, color: '#FFFFFF', lineHeight: '22px', margin: 0 }}>
            Next Race Starts in
          </p>
        )}
        <div style={{ fontFamily: KANIT, fontWeight: 700, fontSize: 'clamp(40px, 13vw, 60px)', color: YELLOW, letterSpacing: 2, lineHeight: 1.1 }}>
          {isLive ? 'LIVE NOW' : `${pad(h)}:${pad(m)}:${pad(s)}`}
        </div>
        <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 12, color: '#D9D9D9', lineHeight: '14px', margin: 0 }}>
          {streamNote}
        </p>
      </div>
    </div>
  )
}

export function ArenaSection({
  targetMs,
  isLive,
  arenaTitle = 'Hamstar Arena',
  arenaSubtitle = 'Hamstar races are streamed live on Pump.fun. Watch the race and return to see the winner.',
  arenaStreamNote = 'Race will be streamed live on Pump.fun',
}: {
  targetMs: number
  isLive: boolean
  arenaTitle?: string
  arenaSubtitle?: string
  arenaStreamNote?: string
}) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <section id="arena" style={{
        background: '#F8F9FA',
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '80px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <img src="/images/sunflower-seed.png" alt="" style={{ width: 22, height: 33, objectFit: 'contain' }} />
          <h2 style={{ fontFamily: KANIT, fontWeight: 700, fontSize: 32, color: '#000000', lineHeight: '40px', margin: 0 }}>
            {arenaTitle}
          </h2>
          <img src="/images/sunflower-seed.png" alt="" style={{ width: 22, height: 33, objectFit: 'contain' }} />
        </div>
        <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 15, color: '#8A8A8A', lineHeight: '22px', margin: '0 0 28px', textAlign: 'center' }}>
          {arenaSubtitle}
        </p>
        <MobileCountdownCard targetMs={targetMs} isLive={isLive} streamNote={arenaStreamNote} />
      </section>
    )
  }

  return (
    <section id="arena" style={{
      background: '#F8F9FA',
      minHeight: '100vh',
      position: 'relative',
      display: 'flex', alignItems: 'center',
      overflow: 'hidden',
    }}>
      {/* Trophy — viewport-edge anchored at section level.
          left uses 50% of section (= viewport). top tracks canvas vertical center. */}
      {isMobile === false && <DecoImage id="arena-trophy" className="section-deco" />}

      {/* 1280×684 canvas, vertically centered — oats + bridge coords are canvas-relative */}
      <div style={{
        position: 'relative',
        width: 1280,
        height: 684,
        margin: '0 auto',
        flexShrink: 0,
        zIndex: 60,
      }}>
        {isMobile === false && <DecoImage id="arena-oats" className="section-deco" />}
        {isMobile === false && <DecoImage id="arena-bridge" className="section-deco" />}

        {/* Title block — x=225, y=82, w=830, h=119, flex VERTICAL align:CENTER gap:20 pad:10 */}
        <div style={{
          position: 'absolute', left: 225, top: 82,
          width: 830, height: 119,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'flex-start',
          padding: 10, gap: 20,
          boxSizing: 'border-box',
        }}>
          {/* Title row — x=461, y=92 in section, w=358 h=48, flex HORIZONTAL justify:CENTER gap:10 */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            width: 358, height: 48, flexShrink: 0,
          }}>
            <img src="/images/sunflower-seed.png" alt="" style={{ width: 29, height: 43, objectFit: 'contain' }} />
            <h2 style={{
              fontFamily: KANIT,
              fontWeight: 700, fontSize: 40,
              color: '#000000',
              lineHeight: '48px',
              margin: 0,
              whiteSpace: 'nowrap',
            }}>
              {arenaTitle}
            </h2>
            <img src="/images/sunflower-seed.png" alt="" style={{ width: 29, height: 43, objectFit: 'contain' }} />
          </div>

          {/* Subtitle — Pretendard 600 18px #8A8A8A lh:27px */}
          <p style={{
            fontFamily: 'Pretendard, sans-serif',
            fontWeight: 600, fontSize: 18,
            color: '#8A8A8A',
            lineHeight: '27px',
            margin: 0,
            textAlign: 'center',
          }}>
            {arenaSubtitle}
          </p>
        </div>

        {/* Countdown card — absolute x=258, y=221 */}
        <CountdownCard streamUrl={SITE.stream.url} targetMs={targetMs} isLive={isLive} streamNote={arenaStreamNote} />

      </div>
    </section>
  )
}
