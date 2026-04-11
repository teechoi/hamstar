'use client'
import { useEffect, useState, useCallback } from 'react'
import { A } from '../theme'

const KANIT = "var(--font-kanit), sans-serif"

interface UserRow {
  id: string
  walletAddress: string
  privyUserId: string | null
  createdAt: string
  totalCheers: number
  wins: number
  winRate: number | null
  lastActivity: string | null
  favPet: { name: string; emoji: string; count: number } | null
}

interface UsersData {
  users: UserRow[]
  total: number
  page: number
  pages: number
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      style={{ padding: '2px 8px', borderRadius: 5, border: `1px solid ${A.borderMid}`, background: copied ? A.greenSoft : '#fff', cursor: 'pointer', fontSize: 10, fontWeight: 700, color: copied ? A.green : A.textMuted }}>
      {copied ? '✓' : 'Copy'}
    </button>
  )
}

export default function UsersPage() {
  const [data,    setData]    = useState<UsersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [page,    setPage]    = useState(1)
  const [err,     setErr]     = useState('')

  const load = useCallback(async (q: string, p: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}&page=${p}`)
      const d = await res.json()
      if (d.error) setErr(d.error)
      else setData(d)
    } catch (e) { setErr(String(e)) }
    setLoading(false)
  }, [])

  useEffect(() => { load(search, page) }, [load, search, page])

  const handleSearch = (q: string) => { setSearch(q); setPage(1) }

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: KANIT, fontSize: 26, fontWeight: 700, color: A.text }}>Users</h1>
          {data && <p style={{ fontSize: 13, color: A.textMuted, marginTop: 4 }}>{data.total.toLocaleString()} total users</p>}
        </div>

        <input
          type="text"
          placeholder="Search by wallet address…"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="admin-search"
          style={{ padding: '10px 16px', borderRadius: 10, border: `1.5px solid ${A.borderMid}`, fontSize: 14, color: A.text, outline: 'none' }}
        />
      </div>

      {err && (
        <div style={{ padding: '12px 16px', background: A.redSoft, border: `1px solid ${A.red}`, borderRadius: 10, color: A.red, fontSize: 14, marginBottom: 20 }}>
          {err}
        </div>
      )}

      <div style={{ background: A.card, borderRadius: 16, border: `1.5px solid ${A.border}`, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ background: A.pageBg }}>
                {['Wallet', 'Joined', 'Cheers', 'Wins', 'Win Rate', 'Fav Hamster', 'Last Active'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${A.border}` }}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} style={{ padding: '14px 16px' }}>
                        <div style={{ height: 14, borderRadius: 6, background: A.border, animation: 'pulse 1.4s ease-in-out infinite' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !data || data.users.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px 24px', textAlign: 'center', color: A.textMuted, fontSize: 14 }}>
                    {search ? 'No users match that wallet.' : 'No users yet.'}
                  </td>
                </tr>
              ) : data.users.map(u => (
                <tr key={u.id} style={{ borderTop: `1px solid ${A.border}` }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, fontFamily: 'monospace', color: A.text }}>
                        {u.walletAddress.slice(0, 8)}…{u.walletAddress.slice(-4)}
                      </span>
                      <CopyBtn text={u.walletAddress} />
                      <a href={`https://solscan.io/account/${u.walletAddress}?cluster=devnet`} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 10, color: A.purple, fontWeight: 700, textDecoration: 'none' }}>↗</a>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: A.textMuted, whiteSpace: 'nowrap' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontFamily: KANIT, fontSize: 16, fontWeight: 700, color: A.text }}>{u.totalCheers}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontFamily: KANIT, fontSize: 16, fontWeight: 700, color: A.green }}>{u.wins}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {u.winRate !== null ? (
                      <span style={{
                        fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                        background: u.winRate >= 50 ? A.greenSoft : A.redSoft,
                        color: u.winRate >= 50 ? A.green : A.red,
                      }}>
                        {u.winRate}%
                      </span>
                    ) : <span style={{ color: A.textMuted, fontSize: 12 }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: A.text }}>
                    {u.favPet ? `${u.favPet.emoji} ${u.favPet.name}` : <span style={{ color: A.textMuted }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: A.textMuted, whiteSpace: 'nowrap' }}>
                    {u.lastActivity ? new Date(u.lastActivity).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div style={{ padding: '14px 20px', borderTop: `1px solid ${A.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontSize: 13, color: A.textMuted }}>
              Page {data.page} of {data.pages} — {data.total} users
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                style={{ padding: '6px 16px', borderRadius: 8, border: `1.5px solid ${A.borderMid}`, background: '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, color: page <= 1 ? A.textMuted : A.text, opacity: page <= 1 ? 0.5 : 1 }}>
                ← Prev
              </button>
              <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page >= data.pages}
                style={{ padding: '6px 16px', borderRadius: 8, border: `1.5px solid ${A.borderMid}`, background: '#fff', cursor: page >= data.pages ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, color: page >= data.pages ? A.textMuted : A.text, opacity: page >= data.pages ? 0.5 : 1 }}>
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
