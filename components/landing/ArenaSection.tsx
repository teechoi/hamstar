'use client'
import { useCountdown } from '@/lib/hooks/useCountdown'
import { DecoImage } from '@/components/editor/DecoImage'
import { SITE } from '@/config/site'
import { useIsMobile } from '@/components/ui/index'

const YELLOW = '#FFE790'
const KANIT = "var(--font-kanit), sans-serif"

function CountdownCard({ targetMs, isLive, fullWidth }: { streamUrl: string; targetMs: number; isLive: boolean; fullWidth?: boolean }) {
  const { h, m, s } = useCountdown(targetMs)
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div style={{
      position: fullWidth ? 'relative' : 'absolute',
      left: fullWidth ? undefined : 258,
      top: fullWidth ? undefined : 221,
      width: fullWidth ? '100%' : 765,
      height: 250,
      borderRadius: 20,
      overflow: 'hidden',
      boxShadow: '0 20px 30px rgba(77,67,83,0.3)',
    }}>
      <img src="/images/arena-bg-blurred.png" alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.50)' }} />

      <div style={{
        position: 'relative', zIndex: 1, height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', gap: 8,
      }}>
        {/* Badge */}
        <div style={{
          position: 'absolute', left: 20, top: 20,
          width: 145, height: 26, borderRadius: 22,
          background: '#725DFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <span style={{
            width: 15, height: 15, borderRadius: '50%',
            background: isLive ? '#ff4444' : '#FFFFFF',
            display: 'inline-block',
            animation: 'pulse 1.5s ease-in-out infinite',
            flexShrink: 0,
          }} />
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 12, color: '#FFFFFF', lineHeight: '14px' }}>
            {isLive ? 'LIVE NOW' : 'LIVE COUNTDOWN'}
          </span>
        </div>

        {!isLive && (
          <p style={{ fontFamily: KANIT, fontWeight: 500, fontSize: 20, color: 'rgba(255,255,255,0.85)', lineHeight: '24px', margin: 0 }}>
            Next Race Starts in
          </p>
        )}
        <div style={{ fontFamily: KANIT, fontWeight: 700, fontSize: 60, color: YELLOW, letterSpacing: 2, lineHeight: '72px' }}>
          {isLive ? 'LIVE NOW' : `${pad(h)}:${pad(m)}:${pad(s)}`}
        </div>
        <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: 12, color: '#D9D9D9', lineHeight: '14px', margin: 0 }}>
          Race will be streamed live on Pump.fun
        </p>
      </div>
    </div>
  )
}

export function ArenaSection({ targetMs, isLive }: { targetMs: number; isLive: boolean }) {
  const isMobile = useIsMobile()

  return (
    <section id="arena" style={{
      background: '#F8F9FA',
      height: isMobile ? 'auto' : 684,
      position: 'relative',
      overflow: isMobile ? 'visible' : 'hidden',
      paddingBottom: isMobile ? 48 : 0,
    }}>
      {!isMobile && (
        <>
          <DecoImage id="arena-oats" className="section-deco" />
          <DecoImage id="arena-trophy" className="section-deco" />
          <DecoImage id="arena-bridge" className="section-deco" />
        </>
      )}

      {isMobile ? (
        <div style={{ padding: '40px 24px 0' }}>
          {/* Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <img src="/images/sunflower-seed.png" alt="" style={{ width: 22, height: 33, objectFit: 'contain' }} />
            <h2 style={{ fontFamily: KANIT, fontWeight: 700, fontSize: 32, color: '#000000', lineHeight: '40px', margin: 0 }}>
              Hamstar Arena
            </h2>
            <img src="/images/sunflower-seed.png" alt="" style={{ width: 22, height: 33, objectFit: 'contain' }} />
          </div>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 15, color: '#8A8A8A', lineHeight: '22px', textAlign: 'center', marginBottom: 24 }}>
            Hamstar races are streamed live on Pump.fun. Watch the race and return to see the winner.
          </p>
          <CountdownCard streamUrl={SITE.stream.url} targetMs={targetMs} isLive={isLive} fullWidth />
        </div>
      ) : (
        /* Desktop: 1280×684 canvas */
        <div style={{
          position: 'absolute', width: 1280, height: 684,
          left: '50%', transform: 'translateX(-50%)',
          zIndex: 60,
        }}>
          {/* Title block — x=225, y=82, w=830, h=119 */}
          <div style={{
            position: 'absolute', left: 225, top: 82, width: 830, height: 119,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: 10, gap: 20, boxSizing: 'border-box',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: 358, height: 48, flexShrink: 0 }}>
              <img src="/images/sunflower-seed.png" alt="" style={{ width: 29, height: 43, objectFit: 'contain' }} />
              <h2 style={{ fontFamily: KANIT, fontWeight: 700, fontSize: 40, color: '#000000', lineHeight: '48px', margin: 0 }}>
                Hamstar Arena
              </h2>
              <img src="/images/sunflower-seed.png" alt="" style={{ width: 29, height: 43, objectFit: 'contain' }} />
            </div>
            <p style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: 18, color: '#8A8A8A', lineHeight: '27px', margin: 0, textAlign: 'center' }}>
              Hamstar races are streamed live on Pump.fun. Watch the race and return to see the winner.
            </p>
          </div>

          <CountdownCard streamUrl={SITE.stream.url} targetMs={targetMs} isLive={isLive} />
        </div>
      )}
    </section>
  )
}
