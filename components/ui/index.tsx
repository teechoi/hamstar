// components/ui/index.tsx
'use client'
import { useState, useEffect } from 'react'

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [breakpoint])
  return isMobile
}

// ─── THEME ────────────────────────────────────────────────────────────────────
export const T = {
  bg: '#F1F6FF',
  card: '#FFFFFF',
  cardAlt: '#F7FAFF',
  text: '#0A0F1F',
  textMid: '#3A4260',
  textMuted: '#8892AA',
  border: '#E2E8F5',
  borderDark: '#C8D4ED',
  lime: '#A6FF00',
  limeDark: '#85CC00',
  limeText: '#2A4A00',
  blue: '#005DFF',
  blueSoft: '#EBF0FF',
  coral: '#FF3B5C',
  coralSoft: '#FFF0F3',
  violet: '#7A00FF',
  violetSoft: '#F3EBFF',
  yellow: '#FFD000',
  green: '#00C566',
  greenSoft: '#E6FFF3',
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
      style={{ padding: small ? '8px 16px' : '13px 26px', background: hov ? T.limeDark : T.lime, border: 'none', borderRadius: 8, color: T.limeText, fontWeight: 900, fontSize: small ? 12 : 14, cursor: 'pointer', letterSpacing: 0.3, transform: hov ? 'scale(1.02)' : 'scale(1)', transition: 'all 0.15s ease-out', fontFamily: 'inherit', width: fullWidth ? '100%' : undefined }}>
      {children}
    </button>
  )
}

export function OutlineButton({ children, color, onClick, small, fullWidth }: { children: React.ReactNode; color?: string; onClick?: () => void; small?: boolean; fullWidth?: boolean }) {
  const [hov, setHov] = useState(false)
  const c = color ?? T.blue
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding: small ? '7px 14px' : '12px 22px', background: hov ? c : 'transparent', border: `2px solid ${c}`, borderRadius: 8, color: hov ? '#fff' : c, fontWeight: 800, fontSize: small ? 12 : 13, cursor: 'pointer', letterSpacing: 0.3, transform: hov ? 'scale(1.02)' : 'scale(1)', transition: 'all 0.15s ease-out', fontFamily: 'inherit', width: fullWidth ? '100%' : undefined }}>
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

export const globalStyles = `
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.8)} }
  @keyframes petIdle { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-6px) rotate(2deg)} }
  @keyframes raceBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', 'Helvetica Neue', sans-serif; background: #F1F6FF; color: #0A0F1F; }
  button { font-family: inherit; }
  input { font-family: inherit; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #F1F6FF; }
  ::-webkit-scrollbar-thumb { background: #C8D4ED; border-radius: 3px; }
  ::selection { background: #A6FF0066; }
  @media (max-width: 767px) {
    input[type="text"], input[type="email"] { width: 100% !important; }
  }
`
