'use client'
import { useEffect, useState } from 'react'
import { A } from '../theme'

export const dynamic = 'force-dynamic'

const KANIT = "var(--font-kanit), sans-serif"
const SLUGS = ['dash', 'flash', 'turbo']

interface Race {
  id: string; number: number; status: string
  startsAt: string; endsAt: string
  entries: { id: string; pet: { id: string; name: string; slug: string }; totalSol: string }[]
}

interface Settings { raceNumber: number; isLive: boolean; streamUrl: string }

function Badge({ status }: { status: string }) {
  const colors: Record<string, [string, string]> = {
    UPCOMING: [A.yellowSoft, A.yellowDark],
    LIVE:     [A.redSoft,    A.red],
    FINISHED: [A.greenSoft,  A.green],
  }
  const [bg, fg] = colors[status] ?? [A.border, A.textMuted]
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: bg, color: fg, textTransform: 'uppercase', letterSpacing: 0.6 }}>
      {status}
    </span>
  )
}

export default function RacePage() {
  const [race, setRace] = useState<Race | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [positions, setPositions] = useState<string[]>([SLUGS[0], SLUGS[1], SLUGS[2]])
  const [finishing, setFinishing] = useState(false)
  const [savingLive, setSavingLive] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/race/current').then(r => r.json()),
      fetch('/api/admin/settings').then(r => r.json()),
    ]).then(([r, s]) => {
      setRace(r && !r.error ? r : null)
      setSettings(s)
    }).finally(() => setLoading(false))
  }, [])

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const toggleLive = async () => {
    if (!settings) return
    setSavingLive(true)
    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isLive: !settings.isLive }),
    })
    setSettings(s => s ? { ...s, isLive: !s.isLive } : s)
    setSavingLive(false)
    flash(settings.isLive ? 'Marked as not live' : 'Marked as LIVE')
  }

  const finishRace = async () => {
    if (!race) return
    setFinishing(true)
    const res = await fetch('/api/admin/race/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raceId: race.id, positions }),
    })
    setFinishing(false)
    if (res.ok) {
      flash('Race finished!')
      setRace(null)
    } else {
      flash('Error finishing race')
    }
  }

  return (
    <div className="admin-page">
      <h1 style={{ fontFamily: KANIT, fontSize: 26, fontWeight: 700, color: A.text, marginBottom: 28 }}>Race Control</h1>

      {msg && <div style={{ padding: '12px 16px', background: A.greenSoft, border: `1px solid ${A.green}`, borderRadius: 10, color: A.green, fontSize: 14, marginBottom: 20, fontWeight: 600 }}>{msg}</div>}

      {loading ? (
        <div style={{ background: A.card, borderRadius: 16, border: `1.5px solid ${A.border}`, height: 200, animation: 'pulse 1.4s ease-in-out infinite' }} />
      ) : (<>

        {/* Live toggle */}
        <div style={{ background: A.card, borderRadius: 16, border: `1.5px solid ${A.border}`, padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontFamily: KANIT, fontSize: 16, fontWeight: 700, color: A.text, marginBottom: 4 }}>Live Status</h2>
              <p style={{ fontSize: 13, color: A.textMuted }}>Controls the "LIVE NOW" indicator across the site</p>
            </div>
            <button onClick={toggleLive} disabled={savingLive} style={{
              padding: '10px 24px', borderRadius: 48.5, border: 'none',
              background: settings?.isLive ? A.red : A.green,
              fontFamily: KANIT, fontSize: 14, fontWeight: 700, color: '#fff',
              cursor: savingLive ? 'not-allowed' : 'pointer', opacity: savingLive ? 0.7 : 1,
            }}>
              {settings?.isLive ? '⏹ Mark Not Live' : '▶ Mark LIVE'}
            </button>
          </div>
        </div>

        {/* Current race */}
        <div style={{ background: A.card, borderRadius: 16, border: `1.5px solid ${A.border}`, padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <h2 style={{ fontFamily: KANIT, fontSize: 16, fontWeight: 700, color: A.text }}>
              {race ? `Race #${race.number}` : 'No active race'}
            </h2>
            {race && <Badge status={race.status} />}
          </div>

          {race ? (<>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
              {race.entries.map(e => (
                <div key={e.id} style={{ background: A.pageBg, borderRadius: 10, padding: '12px 16px' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: A.text }}>{e.pet.name}</p>
                  <p style={{ fontSize: 12, color: A.purple }}>◎ {Number(e.totalSol).toFixed(4)}</p>
                </div>
              ))}
            </div>

            {race.status !== 'FINISHED' && (
              <div>
                <h3 style={{ fontFamily: KANIT, fontSize: 14, fontWeight: 700, color: A.text, marginBottom: 12 }}>Finish Race — Set Positions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: A.textMuted, width: 40 }}>{i + 1}{i === 0 ? 'st' : i === 1 ? 'nd' : 'rd'}</span>
                      <select
                        value={positions[i]}
                        onChange={e => {
                          const next = [...positions]
                          next[i] = e.target.value
                          setPositions(next)
                        }}
                        style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${A.borderMid}`, fontSize: 14, color: A.text, background: '#fff' }}
                      >
                        {SLUGS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <button onClick={finishRace} disabled={finishing} style={{
                  padding: '12px 28px', borderRadius: 48.5, background: A.purple, border: 'none',
                  fontFamily: KANIT, fontSize: 14, fontWeight: 700, color: '#fff',
                  cursor: finishing ? 'not-allowed' : 'pointer', opacity: finishing ? 0.7 : 1,
                }}>
                  {finishing ? 'Finishing…' : 'Finish Race'}
                </button>
              </div>
            )}
          </>) : (
            <p style={{ fontSize: 14, color: A.textMuted }}>No active or upcoming race found.</p>
          )}
        </div>
      </>)}
    </div>
  )
}
