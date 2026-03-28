'use client'
import { useEffect, useState } from 'react'
import { A } from '../theme'

const KANIT = "var(--font-kanit), sans-serif"

interface DashData {
  raceNumber: number
  isLive: boolean
  currentRaceSol: number
  allTimeSol: number
  totalDonations: number
  finishedRaces: number
  recentDonations: {
    id: string
    petName: string
    amountSol: number
    type: string
    walletAddress: string
    confirmedAt: string
  }[]
}

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

export default function DashboardPage() {
  const [data, setData] = useState<DashData | null>(null)
  const [err, setErr] = useState('')

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

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {!data ? (
          [1,2,3,4].map(i => <div key={i} style={{ background: A.card, borderRadius: 16, padding: 28, border: `1.5px solid ${A.border}` }}><Skeleton h={14} w="60%" mb={16} /><Skeleton h={32} w="80%" /></div>)
        ) : (<>
          <StatCard label="Race #" value={`#${data.raceNumber}`} sub={data.isLive ? 'LIVE NOW' : 'Not live'} accent={data.isLive ? A.red : undefined} />
          <StatCard label="Current Race SOL" value={`◎ ${data.currentRaceSol.toFixed(2)}`} />
          <StatCard label="All-Time SOL" value={`◎ ${data.allTimeSol.toFixed(2)}`} sub={`${data.totalDonations} donations`} />
          <StatCard label="Races Finished" value={String(data.finishedRaces)} />
        </>)}
      </div>

      {/* Recent donations */}
      <div style={{ background: A.card, borderRadius: 16, border: `1.5px solid ${A.border}`, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${A.border}` }}>
          <h2 style={{ fontFamily: KANIT, fontSize: 16, fontWeight: 700, color: A.text }}>Recent Donations</h2>
        </div>

        {!data ? (
          <div style={{ padding: 24 }}>
            {[1,2,3,4,5].map(i => <Skeleton key={i} h={16} mb={14} />)}
          </div>
        ) : data.recentDonations.length === 0 ? (
          <div style={{ padding: '32px 24px', textAlign: 'center', color: A.textMuted, fontSize: 14 }}>
            No donations yet
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: A.pageBg }}>
                  {['Pet','Amount','Type','Wallet','Time'].map(h => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentDonations.map(d => (
                  <tr key={d.id} style={{ borderTop: `1px solid ${A.border}` }}>
                    <td style={{ padding: '12px 20px', fontSize: 14, fontWeight: 600, color: A.text }}>{d.petName}</td>
                    <td style={{ padding: '12px 20px', fontSize: 14, color: A.purple, fontWeight: 700 }}>◎ {d.amountSol.toFixed(4)}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: A.purpleSoft, color: A.purple }}>{d.type}</span>
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: 12, color: A.textMuted, fontFamily: 'monospace' }}>
                      {d.walletAddress.slice(0, 8)}…{d.walletAddress.slice(-4)}
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: 12, color: A.textMuted }}>
                      {new Date(d.confirmedAt).toLocaleString()}
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
