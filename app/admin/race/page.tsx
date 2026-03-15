export const dynamic = 'force-dynamic'
'use client'
import { useState, useEffect, useCallback } from 'react'
import { T, LimeButton, OutlineButton, RaceBar } from '@/components/ui'

type RaceEntry = { id: string; totalSol: number; pet: { id: string; name: string; emoji: string; color: string } }
type Race = { id: string; number: number; status: string; startsAt: string; endsAt: string; title: string | null; recap: string | null; entries: RaceEntry[] }
type Settings = { isLive: boolean; streamUrl: string; replayUrl: string | null }

function Field({ label, value, onSave }: { label: string; value: string; onSave: (v: string) => Promise<void> }) {
  const [val, setVal] = useState(value)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const dirty = val !== value

  const save = async () => {
    setSaving(true)
    await onSave(val)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{label}</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={val} onChange={(e) => setVal(e.target.value)}
          style={{ flex: 1, padding: '10px 12px', border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 13, color: T.text, fontFamily: 'inherit', outline: 'none', background: T.bg }} />
        {dirty && (
          <button onClick={save} disabled={saving} style={{ padding: '10px 16px', background: saved ? T.green : T.lime, border: 'none', borderRadius: 8, fontWeight: 800, fontSize: 12, cursor: 'pointer', color: T.limeText, whiteSpace: 'nowrap' }}>
            {saving ? '...' : saved ? '✓ Saved' : 'Save'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function RacePage() {
  const [race, setRace] = useState<Race | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [pastRaces, setPastRaces] = useState<Race[]>([])
  const [loading, setLoading] = useState(true)
  const [finishing, setFinishing] = useState(false)
  const [showFinishConfirm, setShowFinishConfirm] = useState(false)
  const [finishResult, setFinishResult] = useState<string | null>(null)
  const [editingRecap, setEditingRecap] = useState<string | null>(null)
  const [recapText, setRecapText] = useState('')
  const [titleText, setTitleText] = useState('')

  const load = useCallback(async () => {
    const [raceRes, settingsRes, allRes] = await Promise.all([
      fetch('/api/admin/race/current'),
      fetch('/api/admin/settings'),
      fetch('/api/races').catch(() => null),
    ])
    if (raceRes.ok) setRace(await raceRes.json())
    if (settingsRes.ok) setSettings(await settingsRes.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const saveSettings = async (patch: Partial<Settings>) => {
    const res = await fetch('/api/admin/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) })
    if (res.ok) setSettings((s) => s ? { ...s, ...patch } : s)
  }

  const toggleLive = async () => {
    const newLive = !settings?.isLive
    if (newLive && !confirm(`Mark Race #${race?.number} as LIVE? This will update the public site immediately.`)) return
    await saveSettings({ isLive: newLive })
  }

  const finishRace = async () => {
    if (!race) return
    setFinishing(true)
    const res = await fetch('/api/admin/race/finish', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raceId: race.id }),
    })
    const data = await res.json()
    if (res.ok) {
      setFinishResult(`✓ Race #${data.finishedRace} finished! Winner: ${data.winner.emoji} ${data.winner.name}. Race #${data.nextRaceNumber} created.`)
      setShowFinishConfirm(false)
      load()
    } else {
      setFinishResult(`Error: ${data.error}`)
    }
    setFinishing(false)
  }

  const saveRecap = async (raceId: string) => {
    await fetch(`/api/admin/race/${raceId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: titleText, recap: recapText }),
    })
    setEditingRecap(null)
  }

  const totalSol = race?.entries.reduce((s, e) => s + e.totalSol, 0) ?? 0

  if (loading) return <div style={{ padding: 32, color: T.textMuted }}>Loading...</div>

  return (
    <div style={{ padding: '32px 28px', maxWidth: 900 }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: T.text, marginBottom: 4 }}>Race Control</div>
      <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 28 }}>Manage the current race and update stream settings</div>

      {finishResult && (
        <div style={{ background: T.greenSoft, border: `1.5px solid ${T.green}`, borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: T.green, fontWeight: 700 }}>
          {finishResult}
        </div>
      )}

      {/* Current race panel */}
      <div style={{ background: T.card, border: `2px solid ${T.border}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Current Race</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: T.text }}>
              {race ? `Race #${race.number}` : 'No active race'}
              <span style={{ marginLeft: 12, fontSize: 12, fontWeight: 800, padding: '3px 10px', borderRadius: 6, background: race?.status === 'LIVE' ? T.green : T.blueSoft, color: race?.status === 'LIVE' ? '#fff' : T.blue }}>
                {race?.status ?? '—'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {settings && (
              <button onClick={toggleLive} style={{
                padding: '10px 18px', border: 'none', borderRadius: 8, cursor: 'pointer',
                fontWeight: 800, fontSize: 13, fontFamily: 'inherit',
                background: settings.isLive ? T.coral : T.green,
                color: '#fff',
              }}>
                {settings.isLive ? '⏹ Mark Upcoming' : '▶ Mark as LIVE'}
              </button>
            )}
            {race && race.status !== 'FINISHED' && (
              <OutlineButton onClick={() => setShowFinishConfirm(true)}>🏁 Finish Race #{race.number}</OutlineButton>
            )}
          </div>
        </div>

        {race && (
          <>
            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>
              {new Date(race.startsAt).toLocaleString()} → {new Date(race.endsAt).toLocaleString()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {race.entries.map((e) => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20, width: 28 }}>{e.pet.emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.text, width: 90 }}>{e.pet.name}</span>
                  <div style={{ flex: 1 }}>
                    <RaceBar value={totalSol > 0 ? (e.totalSol / totalSol) * 100 : 0} color={e.pet.color} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: T.lime, width: 80, textAlign: 'right' }}>◎ {e.totalSol.toFixed(3)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Finish confirm overlay */}
      {showFinishConfirm && race && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: T.card, borderRadius: 20, padding: 32, maxWidth: 400, width: '90%', border: `2px solid ${T.border}` }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: T.text, marginBottom: 8 }}>Finish Race #{race.number}?</div>
            <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>This will set positions, mark the race FINISHED, and create Race #{race.number + 1}.</div>
            <div style={{ marginBottom: 20 }}>
              {race.entries.map((e, i) => (
                <div key={e.id} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: i < race.entries.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <span>{['🥇', '🥈', '🥉'][i]}</span>
                  <span style={{ fontSize: 14, color: T.text }}>{e.pet.emoji} {e.pet.name}</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 800, color: T.lime }}>◎ {e.totalSol.toFixed(3)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <OutlineButton onClick={() => setShowFinishConfirm(false)} fullWidth>Cancel</OutlineButton>
              <LimeButton onClick={finishRace} fullWidth>{finishing ? 'Finishing...' : 'Confirm & Finish ✓'}</LimeButton>
            </div>
          </div>
        </div>
      )}

      {/* Stream settings */}
      <div style={{ background: T.card, border: `2px solid ${T.border}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Stream Settings</div>
        {settings && (
          <>
            <Field label="Stream URL" value={settings.streamUrl} onSave={(v) => saveSettings({ streamUrl: v })} />
            <Field label="Replay URL (optional)" value={settings.replayUrl ?? ''} onSave={(v) => saveSettings({ replayUrl: v || null })} />
          </>
        )}
      </div>
    </div>
  )
}
