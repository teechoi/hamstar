'use client'
import { useEffect, useState } from 'react'
import { A } from '../theme'

type Entry    = { id: string; totalSol: number; pet: { name: string; emoji: string; color: string } }
type Race     = { id: string; number: number; status: string; entries: Entry[] }
type Donation = { id: string; amountSol: number; confirmedAt: string; walletAddress: string; txSignature: string; pet: { name: string; emoji: string } }
type Data     = { currentRace: Race | null; recentDonations: Donation[]; totalSol: number; totalDonations: number; finishedRaces: number }

function Stat({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 16, padding: '20px 24px' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 900, color: accent ?? A.text, letterSpacing: -0.5 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: A.textMuted, marginTop: 4 }}>{sub}</div>}
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
        <div style={{ fontSize: 22, fontWeight: 900, color: A.text, marginBottom: 4 }}>Dashboard</div>
        <div style={{ fontSize: 13, color: A.textMuted, marginBottom: 28 }}>Loading...</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
          {[...Array(4)].map((_, i) => <div key={i} style={{ height: 90, background: A.card, borderRadius: 16, opacity: 0.5 }} />)}
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
    : `⚠️ ${Math.floor(ms/86_400_000)}d ago`
  const healthOk = health.startsWith('✓')

  return (
    <div className="admin-page" style={{ maxWidth: 1000 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: A.text }}>Dashboard</div>
        <div style={{ fontSize: 13, color: A.textMuted, marginTop: 4 }}>Live overview of races and donations</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
        <Stat label="Race SOL (current)" value={`◎ ${raceSOL.toFixed(2)}`} accent={A.gold} sub={currentRace ? `Race #${currentRace.number}` : 'No active race'} />
        <Stat label="All-Time SOL"       value={`◎ ${totalSol.toFixed(2)}`} />
        <Stat label="Total Donations"    value={totalDonations} />
        <Stat label="Races Finished"     value={finishedRaces} />
      </div>

      <div className="admin-2col" style={{ marginBottom: 20 }}>
        {/* Current race */}
        <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>
            {currentRace ? `Race #${currentRace.number} — ${currentRace.status}` : 'No Active Race'}
          </div>
          {currentRace?.entries.map((e, i) => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < currentRace.entries.length - 1 ? `1px solid ${A.border}` : 'none' }}>
              <span style={{ fontSize: 18 }}>{['🥇', '🥈', '🥉'][i]}</span>
              <span style={{ fontSize: 16 }}>{e.pet.emoji}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: A.text, flex: 1 }}>{e.pet.name}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: A.gold }}>◎ {e.totalSol.toFixed(3)}</span>
            </div>
          ))}
          {!currentRace && <div style={{ fontSize: 13, color: A.textMuted }}>No race in progress.</div>}
        </div>

        {/* System health */}
        <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>System Health</div>
          {[
            { label: 'Helius Webhook', value: health,        ok: healthOk },
            { label: 'Database',       value: '✓ Connected', ok: true },
            { label: 'Admin Auth',     value: '✓ Active',    ok: true },
          ].map(({ label, value, ok }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${A.border}` }}>
              <span style={{ fontSize: 13, color: A.textMid }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: ok ? A.green : A.red }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent donations */}
      <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Recent Donations</div>
        {recentDonations.length === 0
          ? <div style={{ fontSize: 13, color: A.textMuted }}>No donations yet.</div>
          : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>{['Time', 'Pet', 'Amount', 'Wallet', 'Tx'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0 16px 10px 0', fontSize: 10, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {recentDonations.map(d => (
                    <tr key={d.id} style={{ borderTop: `1px solid ${A.border}` }}>
                      <td style={{ padding: '10px 16px 10px 0', color: A.textMuted, whiteSpace: 'nowrap' }}>
                        {new Date(d.confirmedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '10px 16px 10px 0' }}>
                        <span style={{ fontSize: 15 }}>{d.pet.emoji}</span>{' '}
                        <span style={{ color: A.text, fontWeight: 600 }}>{d.pet.name}</span>
                      </td>
                      <td style={{ padding: '10px 16px 10px 0', fontWeight: 800, color: A.gold }}>◎ {d.amountSol.toFixed(3)}</td>
                      <td style={{ padding: '10px 16px 10px 0', color: A.textMuted, fontFamily: 'monospace', fontSize: 11 }}>
                        {d.walletAddress.slice(0,4)}...{d.walletAddress.slice(-4)}
                      </td>
                      <td style={{ padding: '10px 0' }}>
                        <a href={`https://solscan.io/tx/${d.txSignature}`} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 11, color: A.blue, textDecoration: 'none', fontWeight: 600 }}>
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
      </div>
    </div>
  )
}
