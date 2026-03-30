'use client'
import { useState } from 'react'
import { T } from '@/lib/theme'
import { useIsMobile } from '@/components/ui/index'

const KANIT = "var(--font-kanit), sans-serif"
const PRET  = 'Pretendard, sans-serif'

interface TermsModalProps {
  onAccept: () => void
  termsButtonText?: string
}

const SECTIONS = [
  {
    num: '①',
    title: 'Entertainment Only',
    body: 'Hamstar Arena is an entertainment platform. It does not constitute financial advice, investment services, or regulated gambling. Participation is for entertainment purposes only.',
  },
  {
    num: '②',
    title: 'Risk Disclosure',
    body: 'Participating involves digital assets that may fluctuate significantly in value. You may lose the full amount you participate with. Only use funds you can afford to lose entirely.',
    bold: 'Only use funds you can afford to lose entirely.',
  },
  {
    num: '③',
    title: 'No Guarantees',
    body: 'Past race results do not indicate future outcomes. No returns, profits, or rewards are guaranteed under any circumstances. Hamstar Arena makes no warranties, express or implied, regarding outcomes.',
  },
  {
    num: '④',
    title: 'Restricted Access',
    body: 'This platform is strictly unavailable to residents or nationals of the United States, China, France, Belgium, Singapore, and other prohibited jurisdictions. Use of VPNs or misrepresentation of location is a direct violation of these Terms and will result in permanent account termination.',
  },
  {
    num: '⑤',
    title: 'On-Chain Finality',
    body: 'All transactions executed on this platform are processed on-chain and are irreversible. Hamstar Arena bears no liability for errors, failed transactions, or losses resulting from network conditions.',
  },
]

const CHECKBOXES = [
  'I am 18 years of age or older and legally eligible to access this platform in my jurisdiction.',
  'I am not a resident, citizen, or national of any jurisdiction where access to this platform is prohibited by applicable law.',
  'I understand this is an entertainment platform and not a regulated financial service.',
  'I have read and agree to the Terms of Use, Risk Disclosure, and Privacy Policy.',
]

export function TermsModal({ onAccept, termsButtonText = 'I Understand & Enter Arena' }: TermsModalProps) {
  const isMobile = useIsMobile()
  const [checked, setChecked] = useState<boolean[]>(CHECKBOXES.map(() => false))
  const [hov, setHov] = useState(false)
  const allChecked = checked.every(Boolean)

  const toggle = (i: number) =>
    setChecked(prev => prev.map((v, idx) => idx === i ? !v : v))

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: isMobile ? 12 : 20,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 24,
        width: '100%',
        maxWidth: 520,
        maxHeight: isMobile ? '95vh' : '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
        overflow: 'hidden',
      }}>

        {/* ── Header ── */}
        <div style={{ padding: isMobile ? '24px 20px 16px' : '28px 32px 20px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <h2 style={{ fontFamily: KANIT, fontSize: isMobile ? 20 : 22, fontWeight: 700, color: T.text, margin: '0 0 4px', textAlign: 'center' }}>
            Welcome to Hamstar Arena 🐹
          </h2>
          <p style={{ fontFamily: KANIT, fontSize: 14, fontWeight: 500, color: T.textMid, margin: '0 0 6px', textAlign: 'center' }}>
            A live-streamed Solana-based entertainment experience
          </p>
          <p style={{ fontFamily: KANIT, fontSize: 13, fontWeight: 600, color: T.purple, textAlign: 'center', margin: 0 }}>
            Please read before entering
          </p>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ overflowY: 'auto', flex: 1, padding: isMobile ? '16px 20px' : '20px 32px' }}>

          {/* Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
            {SECTIONS.map(s => (
              <div key={s.num}>
                <p style={{ fontFamily: KANIT, fontSize: 14, fontWeight: 700, color: T.text, margin: '0 0 4px' }}>
                  {s.num} {s.title}
                </p>
                <p style={{ fontFamily: PRET, fontSize: 14, color: T.textMid, lineHeight: 1.6, margin: 0 }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>

          {/* Agreement line */}
          <p style={{
            fontFamily: KANIT, fontSize: 13, fontWeight: 600,
            color: T.purple, textAlign: 'center',
            margin: '0 0 16px',
          }}>
            By clicking below, you agree to Hamstar Arena&apos;s Terms of Use
          </p>

          {/* Checkboxes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {CHECKBOXES.map((label, i) => (
              <label key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <div
                  onClick={() => toggle(i)}
                  style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                    border: `2px solid ${checked[i] ? T.purple : T.borderDark}`,
                    background: checked[i] ? T.purple : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginTop: 1,
                    transition: 'all 0.15s',
                    cursor: 'pointer',
                  }}
                >
                  {checked[i] && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span
                  onClick={() => toggle(i)}
                  style={{ fontFamily: PRET, fontSize: 13, color: T.text, lineHeight: 1.5 }}
                >
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* ── Footer / CTA ── */}
        <div style={{ padding: isMobile ? '12px 20px 20px' : '16px 32px 24px', borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
          <button
            onClick={allChecked ? onAccept : undefined}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
              width: '100%',
              padding: '15px 20px',
              background: allChecked ? T.yellow : T.border,
              border: 'none',
              borderRadius: 48.5,
              fontFamily: KANIT,
              fontSize: 16,
              fontWeight: 700,
              color: allChecked ? T.sub2 : T.textMid,
              cursor: allChecked ? 'pointer' : 'not-allowed',
              opacity: allChecked && hov ? 0.88 : 1,
              transition: 'all 0.15s',
            }}
          >
            {termsButtonText}
          </button>
          {!allChecked && (
            <p style={{ fontFamily: PRET, fontSize: 12, color: T.textMid, textAlign: 'center', margin: '8px 0 0' }}>
              Please check all boxes above to continue
            </p>
          )}
        </div>

      </div>
    </div>
  )
}
