// components/HamsterRaceAnimation.tsx
'use client'
import { useEffect, useState } from 'react'
import { T } from '@/lib/theme'

// ── Responsive configs ────────────────────────────────────────────────────────
interface TrackConfig {
  fontSize:     number
  trackLen:     number
  boxInner:     number
  footerDashes: number
  sideW:        number
  obs: ReadonlyArray<{ col: number; s: string }>
}

const DESKTOP: TrackConfig = {
  fontSize:     13,
  trackLen:     77,
  boxInner:     88,
  footerDashes: 62,
  sideW:        28,
  obs: [
    { col: 8,  s: '/\\' },
    { col: 20, s: '<>'  },
    { col: 33, s: '/\\' },
    { col: 47, s: '~~'  },
    { col: 58, s: '<>'  },
    { col: 68, s: '/\\' },
  ],
}

const TABLET: TrackConfig = {
  fontSize:     11,
  trackLen:     52,
  boxInner:     63,
  footerDashes: 37,
  sideW:        18,
  obs: [
    { col: 6,  s: '/\\' },
    { col: 15, s: '<>'  },
    { col: 24, s: '/\\' },
    { col: 35, s: '~~'  },
    { col: 44, s: '/\\' },
  ],
}

const MOBILE: TrackConfig = {
  fontSize:     9,
  trackLen:     32,
  boxInner:     43,
  footerDashes: 17,
  sideW:        8,
  obs: [
    { col: 5,  s: '/\\' },
    { col: 13, s: '<>'  },
    { col: 21, s: '/\\' },
    { col: 28, s: '~~'  },
  ],
}

function getConfig(width: number): TrackConfig {
  if (width < 560)  return MOBILE
  if (width < 900)  return TABLET
  return DESKTOP
}

// ── Constants ─────────────────────────────────────────────────────────────────
const H_W = 5

const RACERS = [
  { label: ' #1 DASH ', speed: 0.90, color: '#FF3B3B' },
  { label: ' #2 TURBO', speed: 0.72, color: '#00D4FF' },
  { label: ' #3 FLASH', speed: 0.81, color: '#FF00CC' },
]

// ── Cell types ────────────────────────────────────────────────────────────────
type CellType = 'behind' | 'dust' | 'ham' | 'obs' | 'ahead' | 'finish'
type Cell = { ch: string; type: CellType }

const CELL_ALPHA: Record<CellType, string> = {
  behind: '#FFFFFF12',
  dust:   '#FFFFFF30',
  ham:    'inherit',
  obs:    '#FFFFFF70',
  ahead:  '#FFFFFF28',
  finish: '#FFFFFF90',
}

function buildCells(pos: number, tick: number, cfg: TrackConfig): Cell[] {
  const finish   = cfg.trackLen - 1
  const atFinish = pos >= finish - H_W
  const nearObs  = cfg.obs.some(o => pos >= o.col - 2 && pos < o.col + 2)

  let hamStr: string
  if (atFinish)      hamStr = '(*^*)'
  else if (nearObs)  hamStr = '(^O^)'
  else               hamStr = Math.floor(tick / 5) % 2 === 0 ? '(>o<)' : '(^o^)'

  const cells: Cell[] = Array.from({ length: cfg.trackLen }, () => ({
    ch:   '.',
    type: 'ahead' as CellType,
  }))

  const hPos = Math.min(pos, finish - H_W)
  for (let i = 0; i < hPos; i++) cells[i] = { ch: '.', type: 'behind' }
  if (hPos > 0) cells[hPos - 1] = { ch: '.', type: 'dust' }
  if (hPos > 1) cells[hPos - 2] = { ch: '.', type: 'dust' }

  for (const obs of cfg.obs) {
    if (obs.col >= hPos + H_W) {
      cells[obs.col] = { ch: obs.s[0], type: 'obs' }
      if (obs.col + 1 < cfg.trackLen) cells[obs.col + 1] = { ch: obs.s[1], type: 'obs' }
    }
  }

  for (let i = 0; i < H_W; i++) {
    if (hPos + i < cfg.trackLen) cells[hPos + i] = { ch: hamStr[i], type: 'ham' }
  }

  return cells
}

// ── Rank helpers ──────────────────────────────────────────────────────────────
const RANK_LABEL = ['◀ 1ST', '◀ 2ND', '◀ 3RD']
const RANK_COLOR = ['#FF3B3B', '#00D4FF', '#FF00CC']

function getRanks(positions: number[]): number[] {
  const ranks = new Array(positions.length)
  ;[...positions.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([idx], rank) => { ranks[idx] = rank })
  return ranks
}

const DIM = '#FFFFFF25'

// ── Component ─────────────────────────────────────────────────────────────────
export function HamsterRaceAnimation() {
  const [tick, setTick]     = useState(0)
  const [cfg,  setCfg]      = useState<TrackConfig>(DESKTOP)

  // Tick
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 120)
    return () => clearInterval(id)
  }, [])

  // Responsive config — updates on resize
  useEffect(() => {
    const update = () => setCfg(getConfig(window.innerWidth))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const loopLen   = cfg.trackLen + H_W + 10
  const positions = RACERS.map(r => Math.floor((tick * r.speed) % loopLen))
  const ranks     = getRanks(positions)

  // Header decoration: >> bounces inward/outward
  const sideCycle = Math.floor(tick * 0.3) % (cfg.sideW * 2)
  const sidePos   = sideCycle < cfg.sideW ? sideCycle : (cfg.sideW * 2 - 1 - sideCycle)
  const leftDeco  = Array.from({ length: cfg.sideW }, (_, i) => {
    const d = cfg.sideW - 1 - i
    return d === sidePos ? '>' : d === sidePos - 1 ? '>' : '·'
  }).join('')
  const rightDeco = Array.from({ length: cfg.sideW }, (_, i) =>
    i === sidePos ? '<' : i === sidePos + 1 ? '<' : '·'
  ).join('')

  // Footer: > sweeps left→right
  const footerMarker   = Math.floor(tick * 0.5) % cfg.footerDashes
  const footerDashLine = Array.from({ length: cfg.footerDashes }, (_, i) =>
    i === footerMarker ? '>' : '-'
  ).join('')

  const TOP = '╔' + '═'.repeat(cfg.boxInner) + '╗'
  const SEP = '╠' + '═'.repeat(cfg.boxInner) + '╣'
  const BOT = '╚' + '═'.repeat(cfg.boxInner) + '╝'

  const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center' }

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{
        display:        'inline-flex',
        flexDirection:  'column',
        fontFamily:     '"Courier New", Courier, monospace',
        fontSize:       cfg.fontSize,
        lineHeight:     1.75,
        userSelect:     'none',
        letterSpacing:  0,
      }}>

        {/* Top border */}
        <div style={{ color: DIM }}>{TOP}</div>

        {/* Header row */}
        <div style={rowStyle}>
          <span style={{ color: DIM, flexShrink: 0 }}>{'║'}</span>
          <span style={{ flex: 1, textAlign: 'right', color: DIM, overflow: 'hidden', whiteSpace: 'nowrap' }}>{leftDeco}</span>
          <span style={{ color: T.lime, fontWeight: 900, flexShrink: 0 }}>{' WHO WILL BE THE HAMSTAR? '}</span>
          <span style={{ flex: 1, color: DIM, overflow: 'hidden', whiteSpace: 'nowrap' }}>{rightDeco}</span>
          <span style={{ color: DIM, flexShrink: 0 }}>{'║'}</span>
        </div>

        {/* Separator */}
        <div style={{ color: DIM }}>{SEP}</div>

        {/* Racer rows */}
        {RACERS.map((r, i) => {
          const cells = buildCells(positions[i], tick, cfg)
          const rank  = ranks[i]
          return (
            <div key={r.label} style={{ ...rowStyle, position: 'relative' }}>
              <span style={{ color: DIM, flexShrink: 0 }}>{'║ '}</span>
              <span style={{ color: r.color, fontWeight: 900, flexShrink: 0, display: 'inline-block', minWidth: '8ch' }}>{r.label}</span>
              <span style={{ color: DIM, flexShrink: 0 }}>{'  '}</span>
              <span style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {cells.map((cell, j) => (
                  <span key={j} style={{ color: cell.type === 'ham' ? r.color : CELL_ALPHA[cell.type] }}>
                    {cell.ch}
                  </span>
                ))}
              </span>
              <span style={{ color: DIM, flexShrink: 0 }}>{'║'}</span>
              <span style={{
                position: 'absolute',
                left: 'calc(100% + 10px)',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: cfg.fontSize - 1,
                fontWeight: 900,
                color: RANK_COLOR[rank],
                whiteSpace: 'nowrap',
                transition: 'color 0.4s',
                letterSpacing: 0.5,
              }}>
                {RANK_LABEL[rank]}
              </span>
            </div>
          )
        })}

        {/* Separator */}
        <div style={{ color: DIM }}>{SEP}</div>

        {/* Footer row */}
        <div style={rowStyle}>
          <span style={{ color: DIM, flexShrink: 0 }}>{'║  START >>>  '}</span>
          <span style={{ color: DIM, flex: 1, overflow: 'hidden', minWidth: 0, whiteSpace: 'nowrap' }}>{footerDashLine + '---------------'}</span>
          <span style={{ color: DIM, flexShrink: 0 }}>{'  >>> FINISH ║'}</span>
        </div>

        {/* Bottom border */}
        <div style={{ color: DIM }}>{BOT}</div>

      </div>
    </div>
  )
}
