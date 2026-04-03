'use client'
import { useState } from 'react'
import { useIsMobile } from '@/components/ui/index'
import { T } from '@/lib/theme'

const KANIT = "var(--font-kanit), sans-serif"
const PRET  = 'Pretendard, sans-serif'

const RACE_PHASES = [
  { label: 'PRE-RACE',    desc: 'Hamsters are loaded into starting gates. Fan pick window is open. Live camera feed begins.' },
  { label: 'PICK LOCK',   desc: 'Fan pick window closes. No further picks accepted. Smart contract locks all pool entries.' },
  { label: 'RACE START',  desc: 'Starting gates open simultaneously. Hamsters race from start to finish line.' },
  { label: 'RACE LIVE',   desc: 'Live broadcast of the race in progress. Real-time position tracking displayed on-screen.' },
  { label: 'FINISH',      desc: 'First hamster to cross the finish line wins. Photo finish review if needed.' },
  { label: 'SETTLEMENT',  desc: 'Smart contract automatically distributes rewards to winning fans within seconds.' },
]

const TRACK_SPECS = [
  { param: 'Number of Lanes', value: '3' },
  { param: 'Track Type',      value: 'Straight sprint' },
  { param: 'Surface',         value: 'Hamster-safe flat surface' },
  { param: 'Lane Assignment', value: 'Randomized before each race' },
  { param: 'Camera Coverage', value: 'Multi-angle live stream' },
]

export function RaceRulesModal({ onClose }: { onClose: () => void }) {
  const isMobile = useIsMobile()
  const [closeHov, setCloseHov] = useState(false)

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? 12 : 24,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 24,
          width: '100%',
          maxWidth: 560,
          maxHeight: isMobile ? '95vh' : '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: isMobile ? '20px 20px 16px' : '28px 32px 20px',
          borderBottom: `1px solid ${T.border}`,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              background: T.yellow,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24,
              boxShadow: '0 4px 14px rgba(255,215,0,0.3)',
            }}>
              🏁
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <h2 style={{ fontFamily: KANIT, fontSize: 'clamp(16px, 3.5vw, 20px)', fontWeight: 800, color: T.text, margin: 0 }}>
                  Race Rules
                </h2>
                <span style={{
                  fontFamily: KANIT, fontSize: 10, fontWeight: 700,
                  color: T.purple, background: 'rgba(115,93,255,0.1)',
                  padding: '2px 8px', borderRadius: 6, letterSpacing: 0.5,
                }}>
                  HAMSTAR
                </span>
              </div>
              <p style={{ fontFamily: PRET, fontSize: 12, color: T.textMid, margin: 0 }}>
                Official Race Rules Playbook · Edition 1.0 | 2026
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: isMobile ? '16px 20px' : '22px 32px' }}>

          {/* Intro */}
          <p style={{ fontFamily: PRET, fontSize: 14, color: T.text, lineHeight: 1.7, margin: '0 0 24px' }}>
            The official rules governing all Hamstar live-streamed races. This is a living document — rules may be updated as the platform evolves.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* PLAY 1 */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{
                  fontFamily: KANIT, fontSize: 10, fontWeight: 800,
                  color: T.purple, background: 'rgba(115,93,255,0.1)',
                  padding: '3px 10px', borderRadius: 6, letterSpacing: 1,
                }}>
                  PLAY 1
                </div>
                <p style={{ fontFamily: KANIT, fontSize: 16, fontWeight: 800, color: T.text, margin: 0 }}>
                  The Race Format
                </p>
              </div>

              {/* Race Overview */}
              <p style={{ fontFamily: KANIT, fontSize: 13, fontWeight: 700, color: T.text, margin: '0 0 6px' }}>
                Race Overview
              </p>
              <p style={{ fontFamily: PRET, fontSize: 13, color: T.text, lineHeight: 1.65, margin: '0 0 18px' }}>
                Each Hamstar race is a live-streamed event where real hamsters compete on a physical track. Races are broadcast in real-time via the Hamstar platform, ensuring full transparency. No race outcomes are pre-determined — every result is organic and driven entirely by the hamsters themselves.
              </p>

              {/* Track Specifications */}
              <p style={{ fontFamily: KANIT, fontSize: 13, fontWeight: 700, color: T.text, margin: '0 0 10px' }}>
                Track Specifications
              </p>

              {/* Track Diagram */}
              <div style={{ marginBottom: 8 }}>
                <div style={{
                  background: '#2A4A1A', borderRadius: 10, padding: '14px 0',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {/* START label + line */}
                  <div style={{ position: 'absolute', top: 6, left: 22, fontFamily: KANIT, fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}>START</div>
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: 44, width: 1.5, background: 'rgba(255,255,255,0.5)' }} />
                  {/* FINISH label + line */}
                  <div style={{ position: 'absolute', top: 6, right: 18, fontFamily: KANIT, fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}>FINISH</div>
                  <div style={{ position: 'absolute', top: 0, bottom: 0, right: 44, width: 1.5, background: 'rgba(255,255,255,0.5)' }} />

                  {/* Lane dividers (dashed) */}
                  {[0, 1].map(i => (
                    <div key={i} style={{
                      position: 'absolute',
                      left: 48, right: 48,
                      top: `${33 + i * 33}%`,
                      borderTop: '1.5px dashed rgba(255,255,255,0.25)',
                    }} />
                  ))}

                  {/* Lanes with hamster circles */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {/* Lane 3 — top */}
                    <div style={{ height: 44, display: 'flex', alignItems: 'center', paddingLeft: '18%' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: '#A8D060', border: '2px solid rgba(255,255,255,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: KANIT, fontSize: 11, fontWeight: 800, color: '#1A3A08',
                      }}>#3</div>
                    </div>
                    {/* Lane 2 — middle */}
                    <div style={{ height: 44, display: 'flex', alignItems: 'center', paddingLeft: '38%', gap: 10 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: '#4ECDC4', border: '2px solid rgba(255,255,255,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: KANIT, fontSize: 11, fontWeight: 800, color: '#0A2A28',
                      }}>#2</div>
                      {/* Arrow */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <div style={{ width: 28, height: 2, background: '#FFD700' }} />
                        <div style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '7px solid #FFD700' }} />
                      </div>
                    </div>
                    {/* Lane 1 — bottom */}
                    <div style={{ height: 44, display: 'flex', alignItems: 'center', paddingLeft: '58%' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: '#FF6B6B', border: '2px solid rgba(255,255,255,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: KANIT, fontSize: 11, fontWeight: 800, color: '#3A0808',
                      }}>#1</div>
                    </div>
                  </div>
                </div>
                <p style={{ fontFamily: PRET, fontSize: 11, color: T.textMid, textAlign: 'center', margin: '6px 0 16px' }}>
                  Standard 3-lane race track (not to scale)
                </p>
              </div>

              <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${T.border}`, marginBottom: 18 }}>
                {TRACK_SPECS.map((row, i) => (
                  <div key={row.param} style={{
                    display: 'flex',
                    background: i % 2 === 0 ? T.bg : '#fff',
                    borderBottom: i < TRACK_SPECS.length - 1 ? `1px solid ${T.border}` : 'none',
                  }}>
                    <div style={{ fontFamily: PRET, fontSize: 12, fontWeight: 600, color: T.textMid, padding: '9px 14px', width: '48%', flexShrink: 0 }}>
                      {row.param}
                    </div>
                    <div style={{ fontFamily: PRET, fontSize: 12, color: T.text, padding: '9px 14px', borderLeft: `1px solid ${T.border}` }}>
                      {row.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Race Phases */}
              <p style={{ fontFamily: KANIT, fontSize: 13, fontWeight: 700, color: T.text, margin: '0 0 10px' }}>
                Race Phases
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {RACE_PHASES.map(phase => (
                  <div key={phase.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{
                      fontFamily: KANIT, fontSize: 10, fontWeight: 800,
                      color: '#000', background: T.yellow,
                      padding: '3px 8px', borderRadius: 6, letterSpacing: 0.5,
                      flexShrink: 0, marginTop: 1, whiteSpace: 'nowrap',
                    }}>
                      {phase.label}
                    </span>
                    <p style={{ fontFamily: PRET, fontSize: 13, color: T.text, lineHeight: 1.6, margin: 0 }}>
                      {phase.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* PLAY 2 */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{
                  fontFamily: KANIT, fontSize: 10, fontWeight: 800,
                  color: T.purple, background: 'rgba(115,93,255,0.1)',
                  padding: '3px 10px', borderRadius: 6, letterSpacing: 1,
                }}>
                  PLAY 2
                </div>
                <p style={{ fontFamily: KANIT, fontSize: 16, fontWeight: 800, color: T.text, margin: 0 }}>
                  Hamstar Lineup
                </p>
              </div>

              {/* The Hamstars */}
              <p style={{ fontFamily: KANIT, fontSize: 13, fontWeight: 700, color: T.text, margin: '0 0 6px' }}>
                The Hamstars
              </p>
              <p style={{ fontFamily: PRET, fontSize: 13, color: T.text, lineHeight: 1.65, margin: '0 0 18px' }}>
                Each race features a lineup of 3 hamsters ("Hamstars") competing across the lanes. Every Hamstar has a unique name, color identifier, and profile visible on the platform. Hamstars are rotated regularly to ensure their well-being and to maintain competitive balance.
              </p>

              {/* Lane Assignment */}
              <p style={{ fontFamily: KANIT, fontSize: 13, fontWeight: 700, color: T.text, margin: '0 0 6px' }}>
                Lane Assignment
              </p>
              <p style={{ fontFamily: PRET, fontSize: 13, color: T.text, lineHeight: 1.65, margin: '0 0 18px' }}>
                Lane assignments are randomized before each race using a verifiable on-chain random number generator. No lane provides a systematic advantage — the track is designed for uniform conditions across all lanes. Lane assignments are revealed to fans during the pre-race phase.
              </p>

              {/* Hamstar Profiles */}
              <p style={{ fontFamily: KANIT, fontSize: 13, fontWeight: 700, color: T.text, margin: '0 0 8px' }}>
                Hamstar Profiles
              </p>
              <p style={{ fontFamily: PRET, fontSize: 13, color: T.text, lineHeight: 1.65, margin: '0 0 6px' }}>
                Each Hamstar's profile page displays:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 18 }}>
                {[
                  'Name and unique visual identifier (color, number)',
                  'Historical race stats (wins, podium finishes, total races)',
                  'Recent form (last 5–10 race results)',
                  'Win rate percentage',
                ].map(item => (
                  <p key={item} style={{ fontFamily: PRET, fontSize: 13, color: T.text, lineHeight: 1.65, margin: 0, paddingLeft: 8 }}>
                    • {item}
                  </p>
                ))}
              </div>

              {/* Rotation & Rest */}
              <p style={{ fontFamily: KANIT, fontSize: 13, fontWeight: 700, color: T.text, margin: '0 0 6px' }}>
                Rotation & Rest
              </p>
              <p style={{ fontFamily: PRET, fontSize: 13, color: T.text, lineHeight: 1.65, margin: 0 }}>
                Hamstars are subject to mandatory rest periods between races. No hamster will race more than the maximum allowed sessions per day, as defined by the Animal Welfare Policy. Fresh, well-rested hamsters are rotated in to keep every race fair and energetic.
              </p>
            </div>
          </div>

          {/* Footer tagline */}
          <div style={{ marginTop: 28, padding: '16px 20px', background: T.yellow, borderRadius: 14, textAlign: 'center' }}>
            <p style={{ fontFamily: KANIT, fontSize: 15, fontWeight: 700, color: '#000', margin: 0, letterSpacing: 0.3 }}>
              "May the fastest Hamstar win."
            </p>
          </div>

          <p style={{ fontFamily: PRET, fontSize: 12, color: T.textMid, margin: '16px 0 4px', textAlign: 'center' }}>
            HAMSTAR RACE RULES PLAYBOOK | v1.0 | 2026
          </p>
        </div>

        {/* Footer */}
        <div style={{ padding: isMobile ? '12px 20px 20px' : '12px 32px 20px', borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
          <button
            onClick={onClose}
            onMouseEnter={() => setCloseHov(true)}
            onMouseLeave={() => setCloseHov(false)}
            style={{
              width: '100%', padding: '13px 20px',
              background: T.yellow, border: 'none', borderRadius: 48.5,
              fontFamily: KANIT, fontSize: 15, fontWeight: 700, color: T.sub2,
              cursor: 'pointer',
              opacity: closeHov ? 0.88 : 1, transition: 'opacity 0.15s',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
