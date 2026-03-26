'use client'
import { useState, useEffect, useCallback } from 'react'
import { A } from '../theme'

type Entry    = { id: string; totalSol: number; pet: { id: string; name: string; emoji: string; color: string } }
type Race     = { id: string; number: number; status: string; startsAt: string; endsAt: string; title: string | null; recap: string | null; entries: Entry[] }
type Settings = { isLive: boolean; streamUrl: string; replayUrl: string | null }

function Btn({ children, onClick, variant = 'default', disabled }: { children: React.ReactNode; onClick?: () => void; variant?: 'gold' | 'red' | 'green' | 'ghost' | 'default'; disabled?: boolean }) {
  const [hov, setHov] = useState(false)
  const bg: Record<string, string> = {
    gold:    A.gold,
    red:     A.red,
    green:   A.green,
    ghost:   hov ? A.border : 'transparent',
    default: hov ? A.cardHov : A.card,
  }
  const color: Record<string, string> = {
    gold: A.goldText, red: '#fff', green: '#fff', ghost: A.textMid, default: A.textMid,
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '10px 20px', borderRadius: 10, border: `1px solid ${A.border}`,
        background: bg[variant], color: color[variant],
        fontSize: 13, fontWeight: 800, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, transition: 'all 0.15s', fontFamily: 'inherit',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}

function Field({ label, value, onSave, placeholder }: { label: string; value: string; onSave: (v: string) => Promise<void>; placeholder?: string }) {
  const [val, setVal] = useState(value)
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
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
          value={val} onChange={e => setVal(e.target.value)}
          placeholder={placeholder}
          style={{ flex: 1, padding: '10px 14px', background: A.inputBg, border: `1px solid ${A.border}`, borderRadius: 8, fontSize: 13, color: A.text, outline: 'none', fontFamily: 'inherit' }}
        />
        {dirty && (
          <button onClick={save} disabled={saving} style={{ padding: '10px 16px', background: saved ? A.green : A.gold, border: 'none', borderRadius: 8, fontWeight: 800, fontSize: 12, cursor: 'pointer', color: saved ? '#fff' : A.goldText, whiteSpace: 'nowrap' }}>
            {saving ? '...' : saved ? '✓' : 'Save'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function RacePage() {
  const [race,              setRace]              = useState<Race | null>(null)
  const [settings,          setSettings]          = useState<Settings | null>(null)
  const [loading,           setLoading]           = useState(true)
  const [finishing,         setFinishing]         = useState(false)
  const [showConfirm,       setShowConfirm]       = useState(false)
  const [finishMsg,         setFinishMsg]         = useState<string | null>(null)
  const [togglingLive,      setTogglingLive]      = useState(false)

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

  // Arena state preview
  const arenaState = !race || race.status === 'FINISHED' ? 'FINISHED'
    : isLive ? 'LIVE'
    : race.status === 'LIVE' ? 'OPEN'
    : 'PREPARING'

  const stateColor  = { PREPARING: A.textMuted, OPEN: A.green, LIVE: '#FF9900', FINISHED: A.blue }[arenaState]
  const stateLabel  = { PREPARING: 'Preparing', OPEN: 'Open — Cheering Active', LIVE: 'Live — Stream Active', FINISHED: 'Finished' }[arenaState]

  if (loading) return <div style={{ padding: 32, fontSize: 13, color: A.textMuted }}>Loading...</div>

  return (
    <div className="admin-page" style={{ maxWidth: 860 }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: A.text, marginBottom: 4 }}>Race Control</div>
      <div style={{ fontSize: 13, color: A.textMuted, marginBottom: 28 }}>Manage the live race and stream settings</div>

      {finishMsg && (
        <div style={{ background: finishMsg.startsWith('✓') ? A.greenSoft : A.redSoft, border: `1px solid ${finishMsg.startsWith('✓') ? A.green : A.red}`, borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: finishMsg.startsWith('✓') ? A.green : A.red, fontWeight: 700 }}>
          {finishMsg}
        </div>
      )}

      {/* Live toggle — big prominent card */}
      <div style={{ background: A.card, border: `1px solid ${isLive ? A.gold : A.border}`, borderRadius: 20, padding: '28px 32px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Stream Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: isLive ? '#FF9900' : A.textMuted, boxShadow: isLive ? '0 0 0 4px rgba(255,153,0,0.25)' : 'none' }} />
            <span style={{ fontSize: 24, fontWeight: 900, color: A.text }}>
              {isLive ? 'LIVE NOW' : 'Offline'}
            </span>
          </div>
          <div style={{ fontSize: 12, color: A.textMuted, marginTop: 6 }}>
            {isLive ? 'Audience sees the LIVE arena state. Cheering is locked.' : 'Toggle ON when stream starts.'}
          </div>
        </div>
        <button
          onClick={toggleLive}
          disabled={togglingLive}
          style={{
            padding: '14px 28px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: isLive ? A.red : A.gold,
            color: isLive ? '#fff' : A.goldText,
            fontSize: 15, fontWeight: 900, fontFamily: 'inherit',
            opacity: togglingLive ? 0.6 : 1,
          }}
        >
          {togglingLive ? '...' : isLive ? '⏹ Stop Stream' : '▶ Go Live'}
        </button>
      </div>

      {/* Current race + pool */}
      <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Current Race</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: A.text }}>
                {race ? `Race #${race.number}` : 'No active race'}
              </span>
              {race && (
                <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 6, background: A.goldSoft, color: A.gold }}>
                  {race.status}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {race && race.status !== 'FINISHED' && (
              <Btn variant="ghost" onClick={() => setShowConfirm(true)}>🏁 Finish Race #{race.number}</Btn>
            )}
          </div>
        </div>

        {/* Arena state indicator */}
        <div style={{ background: A.bg, borderRadius: 10, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: stateColor, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: A.textMuted }}>Users see:</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: stateColor }}>{stateLabel}</span>
        </div>

        {race && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {race.entries.map(e => {
              const pct = totalSol > 0 ? (e.totalSol / totalSol) * 100 : 0
              return (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20, width: 28 }}>{e.pet.emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: A.text, width: 80 }}>{e.pet.name}</span>
                  <div style={{ flex: 1, height: 8, background: A.border, borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: e.pet.color, borderRadius: 99, transition: 'width 0.4s' }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: A.gold, width: 90, textAlign: 'right' }}>◎ {e.totalSol.toFixed(3)}</span>
                </div>
              )
            })}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, borderTop: `1px solid ${A.border}`, fontSize: 12, color: A.textMuted }}>
              Total pool: <span style={{ color: A.gold, fontWeight: 800, marginLeft: 6 }}>◎ {totalSol.toFixed(3)}</span>
            </div>
          </div>
        )}

        {!race && <div style={{ fontSize: 13, color: A.textMuted }}>No race data found.</div>}
      </div>

      {/* Stream URLs */}
      <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>Stream URLs</div>
        {settings && (
          <>
            <Field label="Live Stream URL" value={settings.streamUrl} onSave={v => patchSettings({ streamUrl: v })} placeholder="https://pump.fun/..." />
            <Field label="Replay URL (optional)" value={settings.replayUrl ?? ''} onSave={v => patchSettings({ replayUrl: v || null })} placeholder="https://youtube.com/watch?v=..." />
          </>
        )}
      </div>

      {/* Finish confirm modal */}
      {showConfirm && race && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: A.card, borderRadius: 20, padding: 32, maxWidth: 420, width: '100%', border: `1px solid ${A.borderMid}` }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: A.text, marginBottom: 8 }}>Finish Race #{race.number}?</div>
            <div style={{ fontSize: 13, color: A.textMuted, marginBottom: 24 }}>
              Positions are assigned by current SOL totals. A new race will be created automatically.
            </div>
            <div style={{ marginBottom: 24 }}>
              {race.entries.map((e, i) => (
                <div key={e.id} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: i < race.entries.length - 1 ? `1px solid ${A.border}` : 'none' }}>
                  <span style={{ fontSize: 16 }}>{['🥇','🥈','🥉'][i]}</span>
                  <span style={{ fontSize: 14, color: A.text, flex: 1 }}>{e.pet.emoji} {e.pet.name}</span>
                  <span style={{ fontWeight: 800, color: A.gold, fontSize: 13 }}>◎ {e.totalSol.toFixed(3)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Btn variant="ghost" onClick={() => setShowConfirm(false)}>Cancel</Btn>
              <button onClick={finishRace} disabled={finishing} style={{ flex: 1, padding: '12px', background: A.gold, border: 'none', borderRadius: 10, color: A.goldText, fontWeight: 900, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                {finishing ? 'Finishing...' : '🏁 Confirm & Finish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
