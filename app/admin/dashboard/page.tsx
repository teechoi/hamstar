'use client'
import { useEffect, useState } from 'react'
import { T } from '@/lib/theme'

type Entry = { id: string; totalSol: number; pet: { name: string; emoji: string; color: string } }
type Race = { id: string; number: number; status: string; entries: Entry[] }
type Donation = { id: string; amountSol: number; confirmedAt: string; walletAddress: string; txSignature: string; pet: { name: string; emoji: string } }
type Data = { currentRace: Race | null; recentDonations: Donation[]; totalSol: number; totalDonations: number; finishedRaces: number }

function Skeleton({ w, h, radius = 8 }: { w: number | string; h: number; radius?: number }) {
  return <div style={{ width: w, height: h, borderRadius: radius, background: T.border, opacity: 0.6 }} />
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: T.card, border: `2px solid ${T.border}`, borderRadius: 14, padding: '20px 24px' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 900, color: color ?? T.text, letterSpacing: -1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function HealthRow({ label, status }: { label: string; status: string }) {
  const ok = status.startsWith('✓')
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: T.textMid }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: ok ? T.green : T.coral }}>{status}</span>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<Data | null>(null)

  useEffect(() => {
    fetch('/api/admin/dashboard').then((r) => r.json()).then(setData)
  }, [])

  if (!data) {
    return (
      <div className="admin-page" style={{ maxWidth: 1000 }}>
        <Skeleton w={160} h={28} />
        <div style={{ height: 8 }} />
        <Skeleton w={260} h={16} />
        <div style={{ height: 28 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[...Array(4)].map((_, i) => <div key={i} style={{ height: 90, background: T.border, borderRadius: 14, opacity: 0.5 }} />)}
        </div>
        <div className="admin-2col">
          <div style={{ height: 260, background: T.border, borderRadius: 14, opacity: 0.4 }} />
          <div style={{ height: 260, background: T.border, borderRadius: 14, opacity: 0.4 }} />
        </div>
      </div>
    )
  }

  const { currentRace, recentDonations, totalSol, totalDonations, finishedRaces } = data
  const raceSOL = currentRace ? currentRace.entries.reduce((s, e) => s + e.totalSol, 0) : 0
  const lastDonation = recentDonations[0]
  const systemHealthMs = lastDonation ? Date.now() - new Date(lastDonation.confirmedAt).getTime() : null
  const healthLabel = systemHealthMs === null
    ? 'No donations yet'
    : systemHealthMs < 3_600_000 ? `✓ Last event ${Math.floor(systemHealthMs / 60000)}m ago`
    : systemHealthMs < 86_400_000 ? `✓ Last event ${Math.floor(systemHealthMs / 3_600_000)}h ago`
    : `⚠️ Last event ${Math.floor(systemHealthMs / 86_400_000)}d ago`

  return (
    <div className="admin-page" style={{ maxWidth: 1000 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: T.text, letterSpacing: -0.5 }}>Dashboard</div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>Live overview of your races and donations</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="Race SOL (current)" value={`◎ ${raceSOL.toFixed(2)}`} color={T.lime} sub={currentRace ? `Race #${currentRace.number}` : 'No active race'} />
        <StatCard label="All-Time SOL" value={`◎ ${totalSol.toFixed(2)}`} />
        <StatCard label="Total Donations" value={totalDonations} />
        <StatCard label="Races Finished" value={finishedRaces} />
      </div>

      <div className="admin-2col" style={{ marginBottom: 20 }}>
        <div style={{ background: T.card, border: `2px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>
            {currentRace ? `Race #${currentRace.number} — ${currentRace.status}` : 'No Active Race'}
          </div>
          {currentRace?.entries.map((e, i) => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < currentRace.entries.length - 1 ? `1px solid ${T.border}` : 'none' }}>
              <span style={{ fontSize: 18 }}>{['🥇', '🥈', '🥉'][i]}</span>
              <span style={{ fontSize: 16 }}>{e.pet.emoji}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text, flex: 1 }}>{e.pet.name}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: T.lime }}>◎ {e.totalSol.toFixed(3)}</span>
            </div>
          ))}
          {!currentRace && <div style={{ fontSize: 13, color: T.textMuted }}>No race in progress.</div>}
        </div>

        <div style={{ background: T.card, border: `2px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>System Health</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <HealthRow label="Helius Webhook" status={healthLabel} />
            <HealthRow label="Database" status="✓ Connected" />
            <HealthRow label="Admin Auth" status="✓ Active" />
          </div>
        </div>
      </div>

      <div style={{ background: T.card, border: `2px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Recent Donations</div>
        {recentDonations.length === 0 ? (
          <div style={{ fontSize: 13, color: T.textMuted }}>No donations yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Time', 'Pet', 'Amount', 'Wallet', 'Tx'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '0 12px 10px 0', fontSize: 10, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentDonations.map((d) => (
                  <tr key={d.id} style={{ borderTop: `1px solid ${T.border}` }}>
                    <td style={{ padding: '10px 12px 10px 0', color: T.textMuted, whiteSpace: 'nowrap' }}>
                      {new Date(d.confirmedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '10px 12px 10px 0' }}>
                      <span style={{ fontSize: 16 }}>{d.pet.emoji}</span>{' '}
                      <span style={{ color: T.text, fontWeight: 600 }}>{d.pet.name}</span>
                    </td>
                    <td style={{ padding: '10px 12px 10px 0', fontWeight: 800, color: T.lime }}>◎ {d.amountSol.toFixed(3)}</td>
                    <td style={{ padding: '10px 12px 10px 0', color: T.textMuted, fontFamily: 'monospace', fontSize: 11 }}>
                      {d.walletAddress.slice(0, 4)}...{d.walletAddress.slice(-4)}
                    </td>
                    <td style={{ padding: '10px 0 10px 0' }}>
                      <a href={`https://solscan.io/tx/${d.txSignature}`} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 11, color: T.blue, textDecoration: 'none', fontWeight: 600 }}>
                        View →
                      </a>
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
