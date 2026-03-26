'use client'
import { useState, useEffect, useCallback } from 'react'
import { A } from '../theme'

type Entry    = { id: string; totalSol: number; pet: { id: string; name: string; emoji: string; color: string } }
type Race     = { id: string; number: number; status: string; startsAt: string; endsAt: string; title: string | null; recap: string | null; entries: Entry[] }
type Settings = { isLive: boolean; streamUrl: string; replayUrl: string | null }

function PillBtn({ children, onClick, variant = 'default', disabled }: {
  children: React.ReactNode; onClick?: () => void
  variant?: 'yellow' | 'red' | 'green' | 'ghost' | 'default'; disabled?: boolean
}) {
  const [hov, setHov] = useState(false)
  const styles: Record<string, React.CSSProperties> = {
    yellow:  { background: A.yellow, color: A.yellowText, border: 'none' },
    red:     { background: A.red, color: '#fff', border: 'none' },
    green:   { background: A.green, color: '#fff', border: 'none' },
    ghost:   { background: hov ? A.border : 'transparent', color: A.textMid, border: `1.5px solid ${A.borderMid}` },
    default: { background: hov ? A.border : A.card, color: A.textMid, border: `1.5px solid ${A.border}` },
  }
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: '11px 22px', borderRadius: 9999, fontWeight: 800, fontSize: 13,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, transition: 'all 0.15s',
        fontFamily: 'inherit', whiteSpace: 'nowrap',
        ...styles[variant],
      }}
    >
      {children}
    </button>
  )
}

function Field({ label, value, onSave, placeholder }: { label: string; value: string; onSave: (v: string) => Promise<void>; placeholder?: string }) {
  const [val, setVal]     = useState(value)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  useEffect(() => setVal(value), [value])
  const dirty = val !== value

  const save = async () => {
    setSaving(true)
    await onSave(val)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{label}</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={val} onChange={e => setVal(e.target.value)} placeholder={placeholder}
          style={{ flex: 1, padding: '11px 16px', background: A.inputBg, border: `1.5px solid ${A.borderMid}`, borderRadius: 9999, fontSize: 14, color: A.text, outline: 'none', fontFamily: 'inherit' }}
        />
        {dirty && (
          <button onClick={save} disabled={saving} style={{
            padding: '11px 20px', background: saved ? A.green : A.yellow,
            border: 'none', borderRadius: 9999, fontWeight: 800, fontSize: 12,
            cursor: 'pointer', color: saved ? '#fff' : A.yellowText, whiteSpace: 'nowrap',
          }}>
            {saving ? '...' : saved ? '✓' : 'Save'}
          </button>
        )}
      </div>
    </div>
  )
}

function Card({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div style={{
      background: A.card, borderRadius: 24,
      boxShadow: '0 4px 20px rgba(77,67,83,0.06)',
      border: `1.5px solid ${accent ? A.yellow + '66' : A.border}`,
      padding: '28px 32px', marginBottom: 20,
    }}>
      {children}
    </div>
  )
}

export default function RacePage() {
  const [race,        setRace]        = useState<Race | null>(null)
  const [settings,    setSettings]    = useState<Settings | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [finishing,   setFinishing]   = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [finishMsg,   setFinishMsg]   = useState<string | null>(null)
  const [togglingLive,setTogglingLive]= useState(false)

  const load = useCallback(async () => {
    const [rRes, sRes] = await Promise.all([
      fetch('/api/admin/race/current'),
      fetch('/api/admin/settings'),
    ])
    if (rRes.ok) setRace(await rRes.json())
    if (sRes.ok) setSettings(await sRes.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const patchSettings = async (patch: Partial<Settings>) => {
    const res = await fetch('/api/admin/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) })
    if (res.ok) setSettings(s => s ? { ...s, ...patch } : s)
  }

  const toggleLive = async () => {
    const next = !settings?.isLive
    if (next && !confirm(`Mark Race #${race?.number} as LIVE? This updates the public site immediately.`)) return
    setTogglingLive(true)
    await patchSettings({ isLive: next })
    setTogglingLive(false)
  }

  const finishRace = async () => {
    if (!race) return
    setFinishing(true)
    const res  = await fetch('/api/admin/race/finish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ raceId: race.id }) })
    const data = await res.json()
    if (res.ok) {
      setFinishMsg(`✓ Race #${data.finishedRace} finished! Winner: ${data.winner.emoji} ${data.winner.name}. Race #${data.nextRaceNumber} created.`)
      setShowConfirm(false)
      load()
    } else {
      setFinishMsg(`Error: ${data.error}`)
    }
    setFinishing(false)
  }

  const totalSol = race?.entries.reduce((s, e) => s + e.totalSol, 0) ?? 0
  const isLive   = settings?.isLive ?? false

  const arenaState = !race || race.status === 'FINISHED' ? 'FINISHED'
    : isLive ? 'LIVE'
    : race.status === 'LIVE' ? 'OPEN'
    : 'PREPARING'

  const stateColor  = { PREPARING: A.textMuted, OPEN: A.green, LIVE: '#FF9900', FINISHED: A.purple }[arenaState]
  const stateLabel  = { PREPARING: 'Preparing', OPEN: 'Open — Cheering Active', LIVE: 'Live — Stream Active', FINISHED: 'Finished' }[arenaState]

  if (loading) return <div style={{ padding: 40, fontSize: 14, color: A.textMuted }}>Loading...</div>

  return (
    <div className="admin-page" style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: A.text }}>Race Control</div>
        <div style={{ fontSize: 14, color: A.textMuted, marginTop: 4 }}>Manage the live race and stream settings</div>
      </div>

      {finishMsg && (
        <div style={{
          background: finishMsg.startsWith('✓') ? A.greenSoft : A.redSoft,
          border: `1.5px solid ${finishMsg.startsWith('✓') ? A.green : A.red}`,
          borderRadius: 16, padding: '14px 20px', marginBottom: 20,
          fontSize: 14, color: finishMsg.startsWith('✓') ? A.green : A.red, fontWeight: 700,
        }}>
          {finishMsg}
        </div>
      )}

      {/* Live toggle */}
      <Card accent={isLive}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Stream Status</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 12, height: 12, borderRadius: '50%',
                background: isLive ? '#FF9900' : A.borderMid,
                boxShadow: isLive ? '0 0 0 4px rgba(255,153,0,0.2)' : 'none',
              }} />
              <span style={{ fontSize: 28, fontWeight: 900, color: A.text }}>
                {isLive ? 'LIVE NOW' : 'Offline'}
              </span>
            </div>
            <div style={{ fontSize: 13, color: A.textMuted, marginTop: 6 }}>
              {isLive ? 'Audience sees the LIVE arena state.' : 'Toggle ON when stream starts.'}
            </div>
          </div>
          <button
            onClick={toggleLive} disabled={togglingLive}
            style={{
              padding: '16px 32px', borderRadius: 9999, border: 'none', cursor: 'pointer',
              background: isLive ? A.red : A.yellow,
              color: isLive ? '#fff' : A.yellowText,
              fontSize: 16, fontWeight: 900, fontFamily: 'inherit',
              opacity: togglingLive ? 0.6 : 1,
              boxShadow: isLive ? 'none' : '0 8px 24px rgba(255,231,144,0.3)',
            }}
          >
            {togglingLive ? '...' : isLive ? '⏹ Stop Stream' : '▶ Go Live'}
          </button>
        </div>
      </Card>

      {/* Current race + pool */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Current Race</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 26, fontWeight: 900, color: A.text }}>
                {race ? `Race #${race.number}` : 'No active race'}
              </span>
              {race && (
                <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 9999, background: A.purpleSoft, color: A.purple }}>
                  {race.status}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {race && race.status !== 'FINISHED' && (
              <PillBtn variant="ghost" onClick={() => setShowConfirm(true)}>🏁 Finish Race #{race.number}</PillBtn>
            )}
          </div>
        </div>

        {/* Arena state indicator */}
        <div style={{
          background: A.pageBg, borderRadius: 12, padding: '10px 16px',
          marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: stateColor, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: A.textMuted }}>Users see:</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: stateColor }}>{stateLabel}</span>
        </div>

        {race && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {race.entries.map(e => {
              const pct = totalSol > 0 ? (e.totalSol / totalSol) * 100 : 0
              return (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20, width: 28 }}>{e.pet.emoji}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: A.text, width: 80 }}>{e.pet.name}</span>
                  <div style={{ flex: 1, height: 10, background: A.pageBg, borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: e.pet.color, borderRadius: 99, transition: 'width 0.4s' }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 900, color: A.purple, width: 90, textAlign: 'right' }}>
                    ◎ {e.totalSol.toFixed(3)}
                  </span>
                </div>
              )
            })}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 10, borderTop: `1px solid ${A.border}`, fontSize: 13, color: A.textMuted }}>
              Total pool: <span style={{ color: A.purple, fontWeight: 900, marginLeft: 6 }}>◎ {totalSol.toFixed(3)}</span>
            </div>
          </div>
        )}

        {!race && <div style={{ fontSize: 13, color: A.textMuted }}>No race data found.</div>}
      </Card>

      {/* Stream URLs */}
      <Card>
        <div style={{ fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>
          Stream URLs
        </div>
        {settings && (
          <>
            <Field label="Live Stream URL" value={settings.streamUrl} onSave={v => patchSettings({ streamUrl: v })} placeholder="https://pump.fun/..." />
            <Field label="Replay URL (optional)" value={settings.replayUrl ?? ''} onSave={v => patchSettings({ replayUrl: v || null })} placeholder="https://youtube.com/watch?v=..." />
          </>
        )}
      </Card>

      {/* Finish confirm modal */}
      {showConfirm && race && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,13,20,0.7)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: A.card, borderRadius: 32, padding: 36, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: A.text, marginBottom: 8 }}>Finish Race #{race.number}?</div>
            <div style={{ fontSize: 13, color: A.textMuted, marginBottom: 24 }}>
              Positions are assigned by current SOL totals. A new race will be created automatically.
            </div>
            <div style={{ marginBottom: 24 }}>
              {race.entries.map((e, i) => (
                <div key={e.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < race.entries.length - 1 ? `1px solid ${A.border}` : 'none' }}>
                  <span style={{ fontSize: 16 }}>{['🥇','🥈','🥉'][i]}</span>
                  <span style={{ fontSize: 14, color: A.text, flex: 1 }}>{e.pet.emoji} {e.pet.name}</span>
                  <span style={{ fontWeight: 900, color: A.purple, fontSize: 13 }}>◎ {e.totalSol.toFixed(3)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <PillBtn variant="ghost" onClick={() => setShowConfirm(false)}>Cancel</PillBtn>
              <button onClick={finishRace} disabled={finishing} style={{
                flex: 1, padding: '14px', background: A.yellow, border: 'none',
                borderRadius: 9999, color: A.yellowText, fontWeight: 900, fontSize: 15,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                {finishing ? 'Finishing...' : '🏁 Confirm & Finish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
