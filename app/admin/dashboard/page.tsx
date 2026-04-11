'use client'
import { useEffect, useState } from 'react'
import { A } from '../theme'

const KANIT = "var(--font-kanit), sans-serif"
const MONO  = 'monospace'

interface DashData {
  raceNumber:          number
  isLive:              boolean
  tokenLaunched:       boolean
  hamstarMint:         string
  hamstarPoolAddress:  string
  currentRaceHamstar:  number
  currentRaceCheers:   number
  allTimeHamstar:      number
  totalCheers:         number
  finishedRaces:       number
  recentCheers: {
    id:           string
    petName:      string
    petEmoji:     string
    amountHamstar: number | null
    txSignature:  string | null
    walletAddress: string
    won:          boolean | null
    createdAt:    string
  }[]
}

const QUICK_LINKS = [
  { href: '/admin/race',     label: 'Race Control', icon: '🏁', desc: 'Create or manage active race'   },
  { href: '/admin/settings', label: 'Settings',     icon: '⚙️',  desc: 'Token config, race, socials'   },
  { href: '/admin/users',    label: 'Users',        icon: '👥', desc: 'Browse supporters & win rates'  },
  { href: '/admin/history',  label: 'Race History', icon: '📜', desc: 'Past results & recaps'          },
]

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div style={{
      background: A.card, borderRadius: 16, padding: '24px 28px',
      border: `1.5px solid ${A.border}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
        {label}
      </p>
      <p style={{ fontFamily: KANIT, fontSize: 32, fontWeight: 700, color: accent ?? A.text, lineHeight: 1 }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 13, color: A.textMuted, marginTop: 6 }}>{sub}</p>}
    </div>
  )
}

function Skeleton({ h = 20, w = '100%', mb = 12 }: { h?: number; w?: string | number; mb?: number }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: 8,
      background: A.border, marginBottom: mb,
      animation: 'pulse 1.4s ease-in-out infinite',
    }} />
  )
}

function fmtHamstar(n: number | null): string {
  if (n === null) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`
  return n.toFixed(0)
}

function CopyBtn({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      style={{
        padding: '2px 8px', borderRadius: 5, border: `1px solid ${A.borderMid}`,
        background: copied ? A.greenSoft : '#fff', cursor: 'pointer',
        fontSize: 10, fontWeight: 700, color: copied ? A.green : A.textMuted,
        flexShrink: 0,
      }}
    >
      {copied ? '✓' : (label ?? 'Copy')}
    </button>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashData | null>(null)
  const [err,  setErr]  = useState('')

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(d => d.error ? setErr(d.error) : setData(d))
      .catch(e => setErr(String(e)))
  }, [])

  return (
    <div className="admin-page">
      <h1 style={{ fontFamily: KANIT, fontSize: 26, fontWeight: 700, color: A.text, marginBottom: 28 }}>
        Dashboard
      </h1>

      {err && (
        <div style={{ padding: '12px 16px', background: A.redSoft, border: `1px solid ${A.red}`, borderRadius: 10, color: A.red, fontSize: 14, marginBottom: 20 }}>
          {err}
        </div>
      )}

      {/* Token launch status banner */}
      {data && (
        <div style={{
          padding: '12px 18px', borderRadius: 12, marginBottom: 24,
          background: data.tokenLaunched ? A.greenSoft : A.yellowSoft,
          border: `1px solid ${data.tokenLaunched ? 'rgba(0,197,102,0.25)' : 'rgba(255,200,0,0.3)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>{data.tokenLaunched ? '✅' : '⏳'}</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: data.tokenLaunched ? A.green : '#7a6a00', margin: 0 }}>
                {data.tokenLaunched ? '$HAMSTAR Token — Live' : '$HAMSTAR Token — Not yet launched'}
              </p>
              <p style={{ fontSize: 11, color: data.tokenLaunched ? A.green : '#9a8400', margin: 0, marginTop: 2 }}>
                {data.tokenLaunched
                  ? 'On-chain cheers active — transfers going to pool'
                  : 'Cheers are recorded without on-chain transfer. Update mint & pool address in Settings to activate.'}
              </p>
            </div>
          </div>
          <a href="/admin/settings#token" style={{ fontSize: 12, fontWeight: 700, color: A.purple, textDecoration: 'none' }}>
            Token Settings →
          </a>
        </div>
      )}

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 28 }}>
        {QUICK_LINKS.map(({ href, label, icon, desc }) => (
          <a key={href} href={href} style={{
            display: 'block', padding: '16px 18px', background: A.card,
            borderRadius: 14, border: `1.5px solid ${A.border}`,
            textDecoration: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = A.purple; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 12px rgba(115,93,255,0.12)` }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = A.border; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
          >
            <span style={{ fontSize: 22 }}>{icon}</span>
            <p style={{ fontFamily: KANIT, fontSize: 14, fontWeight: 700, color: A.text, marginTop: 8, marginBottom: 3 }}>{label}</p>
            <p style={{ fontSize: 12, color: A.textMuted }}>{desc}</p>
          </a>
        ))}
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {!data ? (
          [1,2,3,4].map(i => <div key={i} style={{ background: A.card, borderRadius: 16, padding: 28, border: `1.5px solid ${A.border}` }}><Skeleton h={14} w="60%" mb={16} /><Skeleton h={32} w="80%" /></div>)
        ) : (<>
          <StatCard
            label="Race #"
            value={`#${data.raceNumber}`}
            sub={data.isLive ? 'LIVE NOW' : 'Not live'}
            accent={data.isLive ? A.red : undefined}
          />
          <StatCard
            label="Current Race"
            value={`${fmtHamstar(data.currentRaceHamstar)} $HAMSTAR`}
            sub={`${data.currentRaceCheers} cheers`}
          />
          <StatCard
            label="All-Time Cheered"
            value={`${fmtHamstar(data.allTimeHamstar)} $HAMSTAR`}
            sub={`${data.totalCheers} total cheers`}
          />
          <StatCard
            label="Races Finished"
            value={String(data.finishedRaces)}
          />
        </>)}
      </div>

      {/* Recent cheers */}
      <div style={{ background: A.card, borderRadius: 16, border: `1.5px solid ${A.border}`, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${A.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: KANIT, fontSize: 16, fontWeight: 700, color: A.text }}>Recent Cheers</h2>
          <a href="/admin/users" style={{ fontSize: 12, fontWeight: 700, color: A.purple, textDecoration: 'none' }}>View All Users →</a>
        </div>

        {!data ? (
          <div style={{ padding: 24 }}>
            {[1,2,3,4,5].map(i => <Skeleton key={i} h={16} mb={14} />)}
          </div>
        ) : data.recentCheers.length === 0 ? (
          <div style={{ padding: '32px 24px', textAlign: 'center', color: A.textMuted, fontSize: 14 }}>
            No cheers yet
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
              <thead>
                <tr style={{ background: A.pageBg }}>
                  {['Hamster', 'Amount', 'Wallet', 'Tx Signature', 'Result', 'Time'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentCheers.map(c => (
                  <tr key={c.id} style={{ borderTop: `1px solid ${A.border}` }}>
                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: A.text }}>
                      {c.petEmoji} {c.petName}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: A.purple, whiteSpace: 'nowrap' }}>
                      {c.amountHamstar !== null ? `${fmtHamstar(c.amountHamstar)} $HAMSTAR` : <span style={{ color: A.textMuted, fontWeight: 400 }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, fontFamily: MONO, color: A.textMuted }}>
                          {c.walletAddress.slice(0, 6)}…{c.walletAddress.slice(-4)}
                        </span>
                        <CopyBtn text={c.walletAddress} />
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {c.txSignature ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, fontFamily: MONO, color: A.textMuted }}>
                            {c.txSignature.slice(0, 8)}…
                          </span>
                          <CopyBtn text={c.txSignature} label="Copy" />
                          <a
                            href={`https://solscan.io/tx/${c.txSignature}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 10, fontWeight: 700, color: A.purple, textDecoration: 'none' }}
                          >↗</a>
                        </div>
                      ) : (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                          background: A.yellowSoft, color: '#7a6a00',
                        }}>
                          pre-launch
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {c.won === null ? (
                        <span style={{ fontSize: 11, color: A.textMuted }}>pending</span>
                      ) : c.won ? (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: A.greenSoft, color: A.green }}>Won</span>
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: A.redSoft, color: A.red }}>Lost</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: A.textMuted, whiteSpace: 'nowrap' }}>
                      {new Date(c.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
