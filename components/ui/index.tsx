// components/ui/index.tsx
'use client'
import { useSyncExternalStore, useState } from 'react'
import { T } from '@/lib/theme'
export { T, globalStyles } from '@/lib/theme'

// useSyncExternalStore runs its client snapshot synchronously during React 18
// hydration — before any browser paint — so the correct mobile/desktop layout
// is committed in the same tick. Eliminates the useEffect two-pass flash where
// the desktop canvas briefly renders on mobile while JS loads.
function subscribe(cb: () => void) {
  window.addEventListener('resize', cb)
  return () => window.removeEventListener('resize', cb)
}

export function useIsMobile(breakpoint = 768) {
  return useSyncExternalStore(
    subscribe,
    () => window.innerWidth < breakpoint, // client snapshot — runs synchronously
    () => false,                           // server snapshot
  )
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

export function RaceBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ height: 8, background: T.border, borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(100, value)}%`, background: color, borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
    </div>
  )
}

export function Tag({ label, color, bg, border }: { label: string; color?: string; bg?: string; border?: string }) {
  return (
    <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 4, background: bg ?? T.border, color: color ?? T.textMid, fontSize: 10, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', border: border ? `1px solid ${border}` : 'none' }}>
      {label}
    </span>
  )
}

export function LivePulse() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: T.greenSoft, border: `1.5px solid ${T.green}`, borderRadius: 6, padding: '5px 12px' }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: T.green, display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <span style={{ fontSize: 11, fontWeight: 800, color: T.green, letterSpacing: 2, textTransform: 'uppercase' }}>Live</span>
    </div>
  )
}

export function CheckerBar({ height = 5 }: { height?: number }) {
  return (
    <div style={{ height, background: `repeating-linear-gradient(90deg, ${T.text} 0px, ${T.text} 10px, ${T.card} 10px, ${T.card} 20px)`, opacity: 0.12 }} />
  )
}

export function LimeButton({ children, onClick, small, fullWidth }: { children: React.ReactNode; onClick?: () => void; small?: boolean; fullWidth?: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding: small ? '8px 16px' : '13px 26px', background: hov ? T.limeDark : T.lime, border: 'none', borderRadius: 48.5, color: T.limeText, fontWeight: 900, fontSize: small ? 12 : 14, cursor: 'pointer', letterSpacing: 0.3, transform: hov ? 'scale(1.02)' : 'scale(1)', boxShadow: hov ? T.shadowBtnYellow : 'none', transition: 'all 0.15s ease-out', fontFamily: "var(--font-kanit), sans-serif", width: fullWidth ? '100%' : undefined }}>
      {children}
    </button>
  )
}

export function OutlineButton({ children, color, onClick, small, fullWidth }: { children: React.ReactNode; color?: string; onClick?: () => void; small?: boolean; fullWidth?: boolean }) {
  const [hov, setHov] = useState(false)
  const c = color ?? T.blue
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding: small ? '7px 14px' : '12px 22px', background: hov ? c : 'transparent', border: `2px solid ${c}`, borderRadius: 48.5, color: hov ? '#fff' : c, fontWeight: 800, fontSize: small ? 12 : 13, cursor: 'pointer', letterSpacing: 0.3, transform: hov ? 'scale(1.02)' : 'scale(1)', boxShadow: hov ? T.shadowBtnPurple : 'none', transition: 'all 0.15s ease-out', fontFamily: "var(--font-kanit), sans-serif", width: fullWidth ? '100%' : undefined }}>
      {children}
    </button>
  )
}

export function SolAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false)
  const short = `${address.slice(0, 4)}...${address.slice(-4)}`
  
  const copy = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={copy} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: T.bg, border: `1.5px solid ${T.borderDark}`, borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, color: T.textMid, cursor: 'pointer', fontFamily: 'monospace', transition: 'all 0.15s' }}>
      {copied ? '✓ Copied!' : `◎ ${short}`}
    </button>
  )
}

