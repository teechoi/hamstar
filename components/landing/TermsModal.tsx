'use client'
import { useState } from 'react'

const YELLOW = '#FFE790'
const DARK = '#0D0D14'
const KANIT = "var(--font-kanit), sans-serif"
const PURPLE = '#735DFF'

interface TermsModalProps {
  onAccept: () => void
}

const SECTIONS = [
  {
    num: '① Entertainment Only',
    body: 'Hamstar Arena is an entertainment platform. It does not constitute financial advice, investment services, or regulated gambling. Participation is for entertainment purposes only.',
  },
  {
    num: '② Risk Disclosure',
    body: null,
    bodyRich: true,
  },
  {
    num: '③ No Guarantees',
    body: 'Past race results do not indicate future outcomes. No returns, profits, or rewards are guaranteed under any circumstance. Hamstar Arena makes no warranties, express or implied, regarding outcomes.',
  },
  {
    num: '④ Restricted Access',
    body: 'This platform is strictly unavailable to residents or nationals of the United States, China, France, Belgium, Singapore, and other prohibited jurisdictions. Use of VPNs or misrepresentation of location is a direct violation of these Terms and will result in permanent account termination.',
  },
  {
    num: '⑤ On-Chain Finality',
    body: 'All transactions executed on this platform are processed on-chain and are irreversible. Hamster Arena bears no liability for errors, failed transactions, or losses resulting from network conditions.',
  },
]

const CHECKBOXES = [
  'I am 18 years of age or older and legally eligible to access this platform in my jurisdiction.',
  'I am not a resident, citizen, or national of any jurisdiction where access to this platform is prohibited by applicable law.',
  'I understand this is an entertainment platform and not a regulated financial service.',
  'I have read and agree to the Terms of Use, Risk Disclosure, and Privacy Policy.',
]

export function TermsModal({ onAccept }: TermsModalProps) {
  const [checks, setChecks] = useState([false, false, false, false])
  const allChecked = checks.every(Boolean)

  const toggle = (i: number) => setChecks(prev => prev.map((v, j) => j === i ? !v : v))

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(15px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 26,
        width: '100%', maxWidth: 580,
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '40px 44px',
        fontFamily: KANIT,
      }}>
        <h2 style={{
          fontSize: 26, fontWeight: 600, color: DARK,
          marginBottom: 8, textAlign: 'center',
        }}>
          Welcome to Hamstar Arena 🐹
        </h2>
        <p style={{ fontSize: 15, color: DARK, textAlign: 'center', marginBottom: 4 }}>
          A live-streamed blockchain-based entertainment experience
        </p>
        <p style={{ fontSize: 14, color: PURPLE, fontWeight: 500, textAlign: 'center', marginBottom: 28 }}>
          Please read before entering:
        </p>

        {SECTIONS.map((s, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 14, color: '#6e6e6e', fontWeight: 400, marginBottom: 5 }}>
              {s.num}
            </p>
            {s.bodyRich ? (
              <p style={{ fontSize: 13, color: '#8a8a8a', lineHeight: 1.65 }}>
                Participating involves digital assets that may fluctuate significantly in value. You may lose the full
                amount you participate with.{' '}
                <strong style={{ color: '#6a6a6a' }}>Only use funds you can afford to lose entirely.</strong>
              </p>
            ) : (
              <p style={{ fontSize: 13, color: '#8a8a8a', lineHeight: 1.65 }}>{s.body}</p>
            )}
          </div>
        ))}

        <p style={{
          fontSize: 13, color: PURPLE, fontWeight: 500,
          textAlign: 'center', margin: '24px 0 16px',
        }}>
          By clicking below, you agree to Hamster Arena's Terms of Use.
        </p>

        {CHECKBOXES.map((label, i) => (
          <label key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            marginBottom: 12, cursor: 'pointer',
          }}>
            <div
              onClick={() => toggle(i)}
              style={{
                width: 16, height: 16, borderRadius: 3, flexShrink: 0, marginTop: 2,
                background: checks[i] ? PURPLE : '#d9d9d9',
                border: `2px solid ${checks[i] ? PURPLE : '#ccc'}`,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
            >
              {checks[i] && <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✓</span>}
            </div>
            <span style={{ fontSize: 13, color: DARK, lineHeight: 1.55 }}>{label}</span>
          </label>
        ))}

        <button
          onClick={allChecked ? onAccept : undefined}
          style={{
            display: 'block', width: '100%',
            marginTop: 24,
            padding: '16px',
            background: allChecked ? YELLOW : '#f0f0f0',
            border: 'none',
            borderRadius: 70,
            fontSize: 16, fontWeight: 500,
            color: allChecked ? DARK : '#aaa',
            cursor: allChecked ? 'pointer' : 'not-allowed',
            fontFamily: KANIT,
            transition: 'all 0.2s',
          }}
        >
          I Understand & Enter Arena
        </button>
      </div>
    </div>
  )
}
