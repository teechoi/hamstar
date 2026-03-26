'use client'
import { useEffect, useState } from 'react'
import { A } from '../theme'

type Entry    = { id: string; totalSol: number; pet: { name: string; emoji: string; color: string } }
type Race     = { id: string; number: number; status: string; entries: Entry[] }
type Donation = { id: string; amountSol: number; confirmedAt: string; walletAddress: string; txSignature: string; pet: { name: string; emoji: string } }
type Data     = { currentRace: Race | null; recentDonations: Donation[]; totalSol: number; totalDonations: number; finishedRaces: number }

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div style={{
      background: A.card, borderRadius: 24,
      boxShadow: '0 4px 20px rgba(77,67,83,0.06)',
      border: `1px solid ${A.border}`,
      padding: '24px 28px',
    }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 900, color: accent ?? A.text, letterSpacing: -0.5 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: A.textMuted, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: A.card, borderRadius: 24,
      boxShadow: '0 4px 20px rgba(77,67,83,0.06)',
      border: `1px solid ${A.border}`,
      padding: '24px 28px',
    }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<Data | null>(null)

  useEffect(() => {
    fetch('/api/admin/dashboard').then(r => r.json()).then(setData).catch(() => {})
  }, [])

  if (!data) {
    return (
      <div className="admin-page" style={{ maxWidth: 1000 }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: A.text, marginBottom: 4 }}>Dashboard</div>
        <div style={{ fontSize: 14, color: A.textMuted, marginBottom: 32 }}>Loading...</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 16 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: 100, background: A.card, borderRadius: 24, border: `1px solid ${A.border}`, opacity: 0.5 }} />
          ))}
        </div>
      </div>
    )
  }

  const { currentRace, recentDonations, totalSol, totalDonations, finishedRaces } = data
  const raceSOL = currentRace ? currentRace.entries.reduce((s, e) => s + e.totalSol, 0) : 0
  const last    = recentDonations[0]
  const ms      = last ? Date.now() - new Date(last.confirmedAt).getTime() : null
  const health  = ms === null ? 'No donations yet'
    : ms < 3_600_000   ? `✓ ${Math.floor(ms/60000)}m ago`
    : ms < 86_400_000  ? `✓ ${Math.floor(ms/3_600_000)}h ago`
    : `⚠ ${Math.floor(ms/86_400_000)}d ago`
  const healthOk = health.startsWith('✓')

  return (
    <div className="admin-page" style={{ maxWidth: 1000 }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: A.text }}>Dashboard</div>
        <div style={{ fontSize: 14, color: A.textMuted, marginTop: 4 }}>Live overview of races and donations</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Race SOL (current)" value={`◎ ${raceSOL.toFixed(2)}`} accent={A.purple} sub={currentRace ? `Race #${currentRace.number}` : 'No active race'} />
        <StatCard label="All-Time SOL"       value={`◎ ${totalSol.toFixed(2)}`} />
        <StatCard label="Total Donations"    value={totalDonations} />
        <StatCard label="Races Finished"     value={finishedRaces} />
      </div>

      <div className="admin-2col" style={{ marginBottom: 20 }}>
        {/* Current race */}
        <SectionCard title={currentRace ? `Race #${currentRace.number} — ${currentRace.status}` : 'No Active Race'}>
          {currentRace?.entries.map((e, i) => (
            <div key={e.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0',
              borderBottom: i < currentRace.entries.length - 1 ? `1px solid ${A.border}` : 'none',
            }}>
              <span style={{ fontSize: 18 }}>{['🥇', '🥈', '🥉'][i]}</span>
              <span style={{ fontSize: 18 }}>{e.pet.emoji}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: A.text, flex: 1 }}>{e.pet.name}</span>
              <span style={{ fontSize: 14, fontWeight: 900, color: A.purple }}>◎ {e.totalSol.toFixed(3)}</span>
            </div>
          ))}
          {!currentRace && <div style={{ fontSize: 13, color: A.textMuted }}>No race in progress.</div>}
        </SectionCard>

        {/* System health */}
        <SectionCard title="System Health">
          {[
            { label: 'Helius Webhook', value: health,        ok: healthOk },
            { label: 'Database',       value: '✓ Connected', ok: true },
            { label: 'Admin Auth',     value: '✓ Active',    ok: true },
          ].map(({ label, value, ok }) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: `1px solid ${A.border}`,
            }}>
              <span style={{ fontSize: 13, color: A.textMid }}>{label}</span>
              <span style={{
                fontSize: 12, fontWeight: 700,
                color: ok ? A.green : A.red,
                background: ok ? A.greenSoft : A.redSoft,
                padding: '3px 10px', borderRadius: 9999,
              }}>
                {value}
              </span>
            </div>
          ))}
        </SectionCard>
      </div>

      {/* Recent donations */}
      <SectionCard title="Recent Donations">
        {recentDonations.length === 0
          ? <div style={{ fontSize: 13, color: A.textMuted }}>No donations yet.</div>
          : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {['Time', 'Pet', 'Amount', 'Wallet', 'Tx'].map(h => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '0 16px 12px 0',
                        fontSize: 10, fontWeight: 800, color: A.textMuted,
                        textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentDonations.map(d => (
                    <tr key={d.id} style={{ borderTop: `1px solid ${A.border}` }}>
                      <td style={{ padding: '11px 16px 11px 0', color: A.textMuted, whiteSpace: 'nowrap' }}>
                        {new Date(d.confirmedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '11px 16px 11px 0' }}>
                        <span style={{ fontSize: 15 }}>{d.pet.emoji}</span>{' '}
                        <span style={{ color: A.text, fontWeight: 700 }}>{d.pet.name}</span>
                      </td>
                      <td style={{ padding: '11px 16px 11px 0' }}>
                        <span style={{
                          fontWeight: 800, color: A.purple,
                          background: A.purpleSoft,
                          padding: '3px 10px', borderRadius: 9999,
                          fontSize: 12,
                        }}>
                          ◎ {d.amountSol.toFixed(3)}
                        </span>
                      </td>
                      <td style={{ padding: '11px 16px 11px 0', color: A.textMuted, fontFamily: 'monospace', fontSize: 11 }}>
                        {d.walletAddress.slice(0,4)}...{d.walletAddress.slice(-4)}
                      </td>
                      <td style={{ padding: '11px 0' }}>
                        <a href={`https://solscan.io/tx/${d.txSignature}`} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 12, color: A.purple, textDecoration: 'none', fontWeight: 700, background: A.purpleSoft, padding: '3px 10px', borderRadius: 9999 }}>
                          View →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </SectionCard>
    </div>
  )
}
