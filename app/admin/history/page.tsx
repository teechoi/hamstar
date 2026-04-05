'use client'
import { useEffect, useState } from 'react'
import { A } from '../theme'

const KANIT = "var(--font-kanit), sans-serif"
const MEDALS = ['🥇', '🥈', '🥉']

interface PodiumEntry {
  position: number | null
  name: string
  emoji: string
  slug: string
}

interface RaceRow {
  id: string
  number: number
  startsAt: string
  endsAt: string
  recap: string | null
  totalSol: number
  supporters: number
  podium: PodiumEntry[]
}

interface HistoryData {
  races: RaceRow[]
  total: number
  page: number
  pages: number
}

export default function HistoryPage() {
  const [data,    setData]    = useState<HistoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [page,    setPage]    = useState(1)
  const [err,     setErr]     = useState('')
  const [editId,  setEditId]  = useState<string | null>(null)
  const [editRecap, setEditRecap] = useState('')
  const [saving,  setSaving]  = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)

  const load = async (p: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/history?page=${p}`)
      const d = await res.json()
      if (d.error) setErr(d.error)
      else setData(d)
    } catch (e) { setErr(String(e)) }
    setLoading(false)
  }

  useEffect(() => { load(page) }, [page])

  const startEdit = (race: RaceRow) => {
    setEditId(race.id)
    setEditRecap(race.recap ?? '')
  }

  const saveRecap = async (raceId: string) => {
    setSaving(true)
    await fetch('/api/admin/history', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raceId, recap: editRecap }),
    })
    setSaving(false)
    setEditId(null)
    setSavedId(raceId)
    setTimeout(() => setSavedId(null), 2000)
    // Update local state
    setData(d => d ? {
      ...d,
      races: d.races.map(r => r.id === raceId ? { ...r, recap: editRecap } : r),
    } : d)
  }

  return (
    <div className="admin-page">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: KANIT, fontSize: 26, fontWeight: 700, color: A.text }}>Race History</h1>
        {data && <p style={{ fontSize: 13, color: A.textMuted, marginTop: 4 }}>{data.total} races completed</p>}
      </div>

      {err && (
        <div style={{ padding: '12px 16px', background: A.redSoft, border: `1px solid ${A.red}`, borderRadius: 10, color: A.red, fontSize: 14, marginBottom: 20 }}>
          {err}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ background: A.card, borderRadius: 16, height: 80, border: `1.5px solid ${A.border}`, animation: 'pulse 1.4s ease-in-out infinite' }} />
          ))}
        </div>
      ) : !data || data.races.length === 0 ? (
        <div style={{ background: A.card, borderRadius: 16, border: `1.5px solid ${A.border}`, padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 24, marginBottom: 12 }}>🏁</p>
          <p style={{ fontFamily: KANIT, fontSize: 18, fontWeight: 700, color: A.text, marginBottom: 6 }}>No finished races yet</p>
          <p style={{ fontSize: 14, color: A.textMuted }}>Completed races will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.races.map(race => (
            <div key={race.id} style={{ background: A.card, borderRadius: 16, border: `1.5px solid ${A.border}`, overflow: 'hidden' }}>
              {/* Race header row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: KANIT, fontSize: 18, fontWeight: 700, color: A.text }}>Race #{race.number}</span>
                  <span style={{ fontSize: 12, color: A.textMuted }}>
                    {new Date(race.startsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  {/* Podium inline */}
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {race.podium.slice(0, 3).map((p, i) => (
                      <span key={i} style={{ fontSize: 13, color: A.text }}>
                        {MEDALS[i]} {p.emoji} {p.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 }}>Pool</p>
                    <p style={{ fontFamily: KANIT, fontSize: 16, fontWeight: 700, color: A.purple }}>◎ {race.totalSol.toFixed(3)}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 }}>Fans</p>
                    <p style={{ fontFamily: KANIT, fontSize: 16, fontWeight: 700, color: A.text }}>{race.supporters}</p>
                  </div>
                  <button
                    onClick={() => editId === race.id ? setEditId(null) : startEdit(race)}
                    style={{
                      padding: '6px 16px', borderRadius: 8, border: `1.5px solid ${A.borderMid}`,
                      background: editId === race.id ? A.purpleSoft : '#fff',
                      cursor: 'pointer', fontSize: 12, fontWeight: 700,
                      color: editId === race.id ? A.purple : A.textMid,
                    }}
                  >
                    {editId === race.id ? 'Cancel' : (race.recap ? 'Edit Recap' : '+ Add Recap')}
                  </button>
                  {savedId === race.id && <span style={{ fontSize: 12, color: A.green, fontWeight: 700 }}>Saved!</span>}
                </div>
              </div>

              {/* Recap display / editor */}
              {editId === race.id ? (
                <div style={{ padding: '0 24px 20px', borderTop: `1px solid ${A.border}` }}>
                  <p style={{ fontSize: 12, color: A.textMuted, margin: '14px 0 8px' }}>Race recap (shown in highlights)</p>
                  <textarea
                    value={editRecap}
                    onChange={e => setEditRecap(e.target.value)}
                    placeholder="Describe how the race unfolded…"
                    rows={3}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${A.borderMid}`, fontSize: 14, color: A.text, resize: 'vertical', fontFamily: 'Pretendard, sans-serif', outline: 'none' }}
                  />
                  <button onClick={() => saveRecap(race.id)} disabled={saving} style={{
                    marginTop: 10, padding: '8px 20px', borderRadius: 48.5, border: 'none',
                    background: A.purple, fontFamily: KANIT, fontSize: 13, fontWeight: 700,
                    color: '#fff', cursor: saving ? 'not-allowed' : 'pointer',
                  }}>
                    {saving ? 'Saving…' : 'Save Recap'}
                  </button>
                </div>
              ) : race.recap ? (
                <div style={{ padding: '12px 24px 16px', borderTop: `1px solid ${A.border}`, background: A.pageBg }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: A.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.6 }}>Recap</p>
                  <p style={{ fontSize: 13, color: A.textMid, lineHeight: 1.6 }}>{race.recap}</p>
                </div>
              ) : null}
            </div>
          ))}

          {/* Pagination */}
          {data.pages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', flexWrap: 'wrap', gap: 10 }}>
              <span style={{ fontSize: 13, color: A.textMuted }}>Page {data.page} of {data.pages}</span>
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
      )}
    </div>
  )
}
