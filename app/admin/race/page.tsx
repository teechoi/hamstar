'use client'
import { useEffect, useState } from 'react'
import { A } from '../theme'

export const dynamic = 'force-dynamic'

const KANIT = "var(--font-kanit), sans-serif"
const SLUGS = ['dash', 'flash', 'turbo']

interface Race {
  id: string; number: number; status: string
  startsAt: string; endsAt: string; recap: string | null
  onChainRaceId: string | null
  onChainCreated: boolean
  onChainSettled: boolean
  escrowAddress: string | null
  entries: { id: string; pet: { id: string; name: string; slug: string; emoji: string }; totalSol: string }[]
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    UPCOMING: [A.yellowSoft, '#8a6a00'],
    LIVE:     [A.redSoft,    A.red],
    FINISHED: [A.greenSoft,  A.green],
  }
  const [bg, fg] = map[status] ?? [A.border, A.textMuted]
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 99, background: bg, color: fg, textTransform: 'uppercase', letterSpacing: 0.8 }}>
      {status === 'LIVE' ? '● LIVE' : status}
    </span>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: A.card, borderRadius: 16, border: `1.5px solid ${A.border}`, marginBottom: 20, overflow: 'hidden' }}>
      <div style={{ padding: '16px 24px', borderBottom: `1px solid ${A.border}`, background: A.pageBg }}>
        <h2 style={{ fontFamily: KANIT, fontSize: 15, fontWeight: 700, color: A.text }}>{title}</h2>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  )
}

function Btn({ children, onClick, disabled, color = A.purple, small }: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean; color?: string; small?: boolean
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: small ? '8px 18px' : '10px 24px',
      borderRadius: 48.5, border: 'none',
      background: disabled ? A.border : color,
      fontFamily: KANIT, fontSize: small ? 13 : 14, fontWeight: 700,
      color: disabled ? A.textMuted : '#fff',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.7 : 1,
      transition: 'opacity 0.15s',
    }}>
      {children}
    </button>
  )
}

export default function RacePage() {
  const [race,      setRace]      = useState<Race | null>(null)
  const [isLive,    setIsLive]    = useState(false)
  const [loading,   setLoading]   = useState(true)
  const [busy,      setBusy]      = useState(false)
  const [msg,       setMsg]       = useState<{ text: string; ok: boolean } | null>(null)

  // Create form
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ startsAt: '', endsAt: '' })

  // Finish form
  const [positions, setPositions] = useState<string[]>([SLUGS[0], SLUGS[1], SLUGS[2]])

  // Recap editor
  const [recap,     setRecap]     = useState('')
  const [savingRecap, setSavingRecap] = useState(false)

  // Settlement / on-chain pipeline
  const [settleLog,  setSettleLog]  = useState<string[]>([])
  const [pushResult, setPushResult] = useState<{ pushed: number; failed: number } | null>(null)
  const [settling,   setSettling]   = useState(false)
  const [pushing,    setPushing]    = useState(false)

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok })
    setTimeout(() => setMsg(null), 3500)
  }

  const load = async () => {
    setLoading(true)
    const [raceRes, settingsRes] = await Promise.all([
      fetch('/api/admin/race/current').then(r => r.json()),
      fetch('/api/admin/settings').then(r => r.json()),
    ])
    setRace(raceRes && !raceRes.error ? raceRes : null)
    setIsLive(settingsRes.isLive ?? false)
    setRecap(raceRes?.recap ?? '')
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // ── Actions ────────────────────────────────────────────────────────────────

  const toggleLive = async () => {
    setBusy(true)
    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isLive: !isLive }),
    })
    setIsLive(v => !v)
    setBusy(false)
    flash(isLive ? 'Marked as not live' : 'Marked LIVE')
  }

  const createRace = async () => {
    if (!createForm.startsAt || !createForm.endsAt) { flash('Set start and end times', false); return }
    setBusy(true)
    const res = await fetch('/api/admin/race/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createForm),
    })
    const data = await res.json()
    setBusy(false)
    if (res.ok) {
      flash(`Race #${data.race.number} created`)
      setShowCreate(false)
      setCreateForm({ startsAt: '', endsAt: '' })
      load()
    } else {
      flash(data.error ?? 'Failed to create race', false)
    }
  }

  const changeStatus = async (status: string) => {
    if (!race) return
    setBusy(true)
    const res = await fetch('/api/admin/race/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raceId: race.id, status }),
    })
    setBusy(false)
    if (res.ok) {
      flash(`Race set to ${status}`)
      setIsLive(status === 'LIVE')
      load()
    } else {
      flash('Failed to update status', false)
    }
  }

  const finishRace = async () => {
    if (!race) return
    setBusy(true)
    const res = await fetch('/api/admin/race/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raceId: race.id, positions }),
    })
    setBusy(false)
    if (res.ok) {
      flash('Race finished — winner recorded')
      load()
    } else {
      flash('Error finishing race', false)
    }
  }

  const settleRace = async (winnerHamsterIndex: number) => {
    if (!race) return
    setSettling(true)
    setSettleLog([])
    try {
      const res  = await fetch('/api/admin/race/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raceId: race.id, winnerHamsterIndex }),
      })
      const data = await res.json()
      if (res.ok) {
        setSettleLog(data.steps ?? [])
        flash('Race settled on-chain')
        load()
      } else {
        flash(data.error ?? 'Settlement failed', false)
        setSettleLog([data.error ?? 'Error'])
      }
    } catch (e) {
      flash(String(e), false)
    } finally {
      setSettling(false)
    }
  }

  const pushRewards = async () => {
    if (!race) return
    setPushing(true)
    setPushResult(null)
    try {
      const res  = await fetch('/api/admin/race/push-rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raceId: race.id }),
      })
      const data = await res.json()
      if (res.ok) {
        setPushResult({ pushed: data.pushed, failed: data.failed })
        flash(`Rewards pushed: ${data.pushed} sent, ${data.failed} failed`)
      } else {
        flash(data.error ?? 'Push rewards failed', false)
      }
    } catch (e) {
      flash(String(e), false)
    } finally {
      setPushing(false)
    }
  }

  const cancelRace = async () => {
    if (!race) return
    if (!confirm('Cancel this race? All cheers will be eligible for on-chain refund.')) return
    setBusy(true)
    const res  = await fetch('/api/admin/race/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raceId: race.id }),
    })
    const data = await res.json()
    setBusy(false)
    if (res.ok) {
      flash(data.onChainError ? `Cancelled (off-chain only: ${data.onChainError})` : 'Race cancelled on-chain')
      load()
    } else {
      flash(data.error ?? 'Cancel failed', false)
    }
  }

  const saveRecap = async () => {
    if (!race) return
    setSavingRecap(true)
    await fetch('/api/admin/history', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raceId: race.id, recap }),
    })
    setSavingRecap(false)
    flash('Recap saved')
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: KANIT, fontSize: 26, fontWeight: 700, color: A.text }}>Race Control</h1>
        {!loading && !race && (
          <Btn onClick={() => setShowCreate(v => !v)} color={A.green}>
            {showCreate ? 'Cancel' : '+ Create New Race'}
          </Btn>
        )}
      </div>

      {msg && (
        <div style={{ padding: '12px 16px', background: msg.ok ? A.greenSoft : A.redSoft, border: `1px solid ${msg.ok ? A.green : A.red}`, borderRadius: 10, color: msg.ok ? A.green : A.red, fontSize: 14, marginBottom: 20, fontWeight: 600 }}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <div style={{ background: A.card, borderRadius: 16, border: `1.5px solid ${A.border}`, height: 220, animation: 'pulse 1.4s ease-in-out infinite' }} />
      ) : (<>

        {/* ── Live Indicator Toggle ─────────────────────────────────────── */}
        <Section title="Live Indicator">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p style={{ fontSize: 14, color: A.text, fontWeight: 600, marginBottom: 4 }}>
                Site-wide "LIVE NOW" badge is currently{' '}
                <span style={{ color: isLive ? A.red : A.textMuted }}>{isLive ? 'ON' : 'OFF'}</span>
              </p>
              <p style={{ fontSize: 13, color: A.textMuted }}>
                Automatically synced when you transition race status. Override here if needed.
              </p>
            </div>
            <Btn onClick={toggleLive} disabled={busy} color={isLive ? A.red : A.green}>
              {isLive ? '⏹ Turn Off Live' : '▶ Turn On Live'}
            </Btn>
          </div>
        </Section>

        {/* ── Create Race Form ─────────────────────────────────────────── */}
        {showCreate && (
          <Section title="Create New Race">
            <div className="admin-2col" style={{ marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: A.textMid, textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 6 }}>
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={createForm.startsAt}
                  onChange={e => setCreateForm(f => ({ ...f, startsAt: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${A.borderMid}`, fontSize: 14, color: A.text }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: A.textMid, textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 6 }}>
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={createForm.endsAt}
                  onChange={e => setCreateForm(f => ({ ...f, endsAt: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${A.borderMid}`, fontSize: 14, color: A.text }}
                />
              </div>
            </div>
            <p style={{ fontSize: 12, color: A.textMuted, marginBottom: 16 }}>
              Race entries will be created automatically for all active hamsters. Race number auto-increments.
            </p>
            <Btn onClick={createRace} disabled={busy} color={A.green}>
              {busy ? 'Creating…' : 'Create Race'}
            </Btn>
          </Section>
        )}

        {/* ── Active Race ──────────────────────────────────────────────── */}
        {race ? (<>

          {/* Race header */}
          <Section title={`Race #${race.number}`}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <StatusBadge status={race.status} />
                <span style={{ fontSize: 13, color: A.textMuted }}>
                  {new Date(race.startsAt).toLocaleString()} → {new Date(race.endsAt).toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {race.status === 'UPCOMING' && (
                  <Btn onClick={() => changeStatus('LIVE')} disabled={busy} color={A.red}>
                    ▶ Mark LIVE
                  </Btn>
                )}
                {race.status === 'LIVE' && (
                  <Btn onClick={() => changeStatus('UPCOMING')} disabled={busy} color={A.textMuted} small>
                    Revert to Upcoming
                  </Btn>
                )}
              </div>
            </div>

            {/* Entry pool cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              {race.entries.map(e => (
                <div key={e.id} style={{ background: A.pageBg, borderRadius: 10, padding: '14px 16px' }}>
                  <p style={{ fontSize: 16, marginBottom: 4 }}>{e.pet.emoji}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: A.text }}>{e.pet.name}</p>
                  <p style={{ fontSize: 13, color: A.purple, fontWeight: 700, marginTop: 4 }}>◎ {Number(e.totalSol).toFixed(4)}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Finish race controls */}
          {race.status !== 'FINISHED' && (
            <Section title="Finish Race — Set Final Positions">
              <p style={{ fontSize: 13, color: A.textMuted, marginBottom: 20 }}>
                Record the official race result. This marks the race as FINISHED, awards the win, and turns off the live indicator.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, maxWidth: 400 }}>
                {([['1st', 0], ['2nd', 1], ['3rd', 2]] as [string, number][]).map(([label, idx]) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: idx === 0 ? A.medalGold : A.textMuted, width: 36 }}>{label}</span>
                    <select
                      value={positions[idx]}
                      onChange={e => {
                        const next = [...positions]
                        next[idx] = e.target.value
                        setPositions(next)
                      }}
                      style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${A.borderMid}`, fontSize: 14, color: A.text, background: '#fff' }}
                    >
                      {race.entries.map(e => (
                        <option key={e.pet.slug} value={e.pet.slug}>
                          {e.pet.emoji} {e.pet.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn onClick={finishRace} disabled={busy} color={A.purple}>
                  {busy ? 'Saving…' : 'Finish Race'}
                </Btn>
                <Btn onClick={cancelRace} disabled={busy} color={A.red} small>
                  Cancel Race
                </Btn>
              </div>
            </Section>
          )}

          {/* ── On-chain settlement & rewards ─────────────────────────────── */}
          {race.status === 'FINISHED' && (
            <Section title="On-Chain Settlement & Rewards">
              {/* Status row */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 99,
                  background: race.onChainCreated ? A.greenSoft : A.yellowSoft,
                  fontSize: 12, fontWeight: 700,
                  color: race.onChainCreated ? A.green : '#8a6a00',
                }}>
                  {race.onChainCreated ? '✓ Created on-chain' : '⏳ Not created on-chain'}
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 99,
                  background: race.onChainSettled ? A.greenSoft : A.yellowSoft,
                  fontSize: 12, fontWeight: 700,
                  color: race.onChainSettled ? A.green : '#8a6a00',
                }}>
                  {race.onChainSettled ? '✓ Settled on-chain' : '⏳ Awaiting settlement'}
                </div>
              </div>

              {!race.onChainSettled && race.onChainCreated && (
                <>
                  <p style={{ fontSize: 13, color: A.textMuted, marginBottom: 16, lineHeight: 1.6 }}>
                    Select the winning hamster (0-indexed, matching on-chain hamster slots) then settle.
                    This calls <code style={{ background: A.pageBg, padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>lock_race → propose_settlement → confirm_settlement</code>.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                    {race.entries.map((e, idx) => (
                      <button
                        key={e.pet.slug}
                        disabled={settling}
                        onClick={() => settleRace(idx)}
                        style={{
                          padding: '10px 20px', borderRadius: 48.5, border: `1.5px solid ${A.purple}`,
                          background: '#fff', cursor: settling ? 'not-allowed' : 'pointer',
                          fontFamily: KANIT, fontSize: 13, fontWeight: 700, color: A.purple,
                        }}
                      >
                        {settling ? 'Settling…' : `${e.pet.emoji} ${e.pet.name} wins (slot ${idx})`}
                      </button>
                    ))}
                  </div>
                  {settleLog.length > 0 && (
                    <div style={{ background: A.pageBg, borderRadius: 10, padding: '12px 16px', fontSize: 12, fontFamily: 'monospace', color: A.textMid }}>
                      {settleLog.map((l, i) => <div key={i}>{l}</div>)}
                    </div>
                  )}
                </>
              )}

              {race.onChainSettled && (
                <>
                  <p style={{ fontSize: 13, color: A.textMuted, marginBottom: 16, lineHeight: 1.6 }}>
                    Race is settled. Click below to push HAMSTAR rewards to all winning wallets.
                  </p>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Btn onClick={pushRewards} disabled={pushing} color={A.green}>
                      {pushing ? 'Pushing rewards…' : '💸 Push All Rewards'}
                    </Btn>
                    {pushResult && (
                      <span style={{ fontSize: 13, color: A.textMid, fontWeight: 600 }}>
                        {pushResult.pushed} pushed, {pushResult.failed} failed
                      </span>
                    )}
                  </div>
                </>
              )}

              {!race.onChainCreated && (
                <p style={{ fontSize: 12, color: A.textMuted, marginTop: 12 }}>
                  This race was created before on-chain integration was live. Settlement must be done manually off-chain.
                </p>
              )}
            </Section>
          )}

          {/* Recap editor */}
          <Section title="Race Recap">
            <p style={{ fontSize: 13, color: A.textMuted, marginBottom: 12 }}>
              Optional post-race summary shown in highlights and race history.
            </p>
            <textarea
              value={recap}
              onChange={e => setRecap(e.target.value)}
              placeholder="e.g. Flash took an early lead and never looked back…"
              rows={4}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${A.borderMid}`, fontSize: 14, color: A.text, resize: 'vertical', fontFamily: 'Pretendard, sans-serif', outline: 'none' }}
            />
            <div style={{ marginTop: 12 }}>
              <Btn onClick={saveRecap} disabled={savingRecap} small>
                {savingRecap ? 'Saving…' : 'Save Recap'}
              </Btn>
            </div>
          </Section>

          {/* Create next race (only after current is finished) */}
          {race.status === 'FINISHED' && !showCreate && (
            <div style={{ textAlign: 'center', paddingTop: 8 }}>
              <Btn onClick={() => setShowCreate(true)} color={A.green}>
                + Create Next Race
              </Btn>
            </div>
          )}

          {race.status === 'FINISHED' && showCreate && (
            <Section title="Create Next Race">
              <div className="admin-2col" style={{ marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: A.textMid, textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 6 }}>
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={createForm.startsAt}
                    onChange={e => setCreateForm(f => ({ ...f, startsAt: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${A.borderMid}`, fontSize: 14, color: A.text }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: A.textMid, textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 6 }}>
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={createForm.endsAt}
                    onChange={e => setCreateForm(f => ({ ...f, endsAt: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${A.borderMid}`, fontSize: 14, color: A.text }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn onClick={createRace} disabled={busy} color={A.green}>
                  {busy ? 'Creating…' : 'Create Race'}
                </Btn>
                <Btn onClick={() => setShowCreate(false)} disabled={busy} color={A.textMuted} small>
                  Cancel
                </Btn>
              </div>
            </Section>
          )}

        </>) : !showCreate && (
          <div style={{ background: A.card, borderRadius: 16, border: `1.5px solid ${A.border}`, padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>🏁</p>
            <p style={{ fontFamily: KANIT, fontSize: 18, fontWeight: 700, color: A.text, marginBottom: 8 }}>No active race</p>
            <p style={{ fontSize: 14, color: A.textMuted, marginBottom: 24 }}>Create a race to get started. Entries for all active hamsters are created automatically.</p>
            <Btn onClick={() => setShowCreate(true)} color={A.green}>+ Create New Race</Btn>
          </div>
        )}

      </>)}
    </div>
  )
}
