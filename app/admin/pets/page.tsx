'use client'
import { useState, useEffect, useRef } from 'react'
import { A } from '../theme'

type Pet = {
  id: string; name: string; number: string; emoji: string; team: string
  tagline: string; bio: string; image: string; color: string
  speedBase: number; chaosBase: number; wins: number; snackLevel: number; cageLevel: number
}

const PET_FALLBACK: Record<string, string> = {
  dash:  '/images/hamster-dash.png',
  flash: '/images/hamster-flash.png',
  turbo: '/images/hamster-turbo.png',
}

function Field({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  const base: React.CSSProperties = {
    width: '100%', padding: '11px 16px',
    background: A.inputBg, border: `1.5px solid ${A.borderMid}`,
    borderRadius: 12, fontSize: 14, color: A.text,
    outline: 'none', fontFamily: 'inherit',
  }
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={4} style={{ ...base, resize: 'vertical', lineHeight: 1.65 }} />
        : <input value={value} onChange={e => onChange(e.target.value)} style={base} />
      }
    </div>
  )
}

function Slider({ label, value, onChange, color }: { label: string; value: number; onChange: (v: number) => void; color: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <label style={{ fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</label>
        <span style={{ fontSize: 14, fontWeight: 900, color: A.text }}>{value}</span>
      </div>
      <input type="range" min={0} max={100} value={value} onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: color }} />
    </div>
  )
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: A.card, borderRadius: 24,
      boxShadow: '0 4px 20px rgba(77,67,83,0.06)',
      border: `1px solid ${A.border}`,
      padding: '24px 28px', marginBottom: 16,
    }}>
      {title && (
        <div style={{ fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>
          {title}
        </div>
      )}
      {children}
    </div>
  )
}

export default function PetsPage() {
  const [pets,      setPets]      = useState<Pet[]>([])
  const [draft,     setDraft]     = useState<Pet | null>(null)
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [uploading, setUploading] = useState(false)
  const [seeding,   setSeeding]   = useState(false)
  const [seedMsg,   setSeedMsg]   = useState<string | null>(null)
  const [loadErr,   setLoadErr]   = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    try {
      const r = await fetch('/api/admin/pets')
      const data = await r.json()
      if (!r.ok || !Array.isArray(data)) {
        setLoadErr(data?.error ?? 'Failed to load hamsters')
        return
      }
      setLoadErr(null)
      setPets(data)
      setDraft(prev => prev ? (data.find((p: Pet) => p.id === prev.id) ?? data[0] ?? null) : (data[0] ?? null))
    } catch (e) {
      setLoadErr('Network error — could not reach API')
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line

  const select = (pet: Pet) => { setDraft(pet); setSaved(false) }
  const update = (patch: Partial<Pet>) => setDraft(d => d ? { ...d, ...patch } : d)

  const save = async () => {
    if (!draft) return
    setSaving(true)
    const res = await fetch(`/api/admin/pets/${draft.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    })
    if (res.ok) {
      const updated: Pet = await res.json()
      setPets(prev => prev.map(p => p.id === updated.id ? updated : p))
      setDraft(updated); setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
    setSaving(false)
  }

  const uploadPhoto = async (file: File) => {
    if (!draft) return
    setUploading(true)
    try {
      const sig = await fetch('/api/admin/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folder: 'hamstar/pets' }) })
      const { signature, timestamp, apiKey, folder, uploadUrl } = await sig.json()
      const form = new FormData()
      form.append('file', file); form.append('api_key', apiKey)
      form.append('timestamp', timestamp); form.append('signature', signature); form.append('folder', folder)
      const up = await fetch(uploadUrl, { method: 'POST', body: form })
      const data = await up.json()
      if (data.secure_url) update({ image: data.secure_url })
    } finally { setUploading(false) }
  }

  const seedFromConfig = async () => {
    if (!confirm('This will create or update all hamsters in the DB using data from config/site.ts. Continue?')) return
    setSeeding(true)
    const res  = await fetch('/api/admin/seed', { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      setSeedMsg(`✓ Seeded ${data.count} hamsters from config.`)
      await load()
    } else {
      setSeedMsg(`Error: ${data.error}`)
    }
    setSeeding(false)
    setTimeout(() => setSeedMsg(null), 4000)
  }

  if (loadErr) return (
    <div style={{ padding: 40 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: A.red, marginBottom: 8 }}>Failed to load hamsters</div>
      <div style={{ fontSize: 13, color: A.textMuted, marginBottom: 20 }}>{loadErr}</div>
      <button onClick={load} style={{ padding: '10px 24px', background: A.yellow, border: 'none', borderRadius: 9999, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
        Retry
      </button>
    </div>
  )
  if (!draft) return <div style={{ padding: 40, fontSize: 14, color: A.textMuted }}>Loading...</div>

  const imgSrc = draft.image || PET_FALLBACK[draft.id.toLowerCase()] || ''

  return (
    <div className="admin-page" style={{ maxWidth: 940 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 900, color: A.text }}>Hamsters</div>
          <div style={{ fontSize: 14, color: A.textMuted, marginTop: 4 }}>Edit racer profiles, stats, and photos</div>
        </div>
        <button onClick={seedFromConfig} disabled={seeding} style={{
          padding: '10px 22px', background: A.purpleSoft, border: `1.5px solid ${A.purple}44`,
          borderRadius: 9999, color: A.purple, fontSize: 13, fontWeight: 800,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          {seeding ? 'Syncing...' : '↺ Sync from Config'}
        </button>
      </div>

      {seedMsg && (
        <div style={{
          background: seedMsg.startsWith('✓') ? A.greenSoft : A.redSoft,
          border: `1.5px solid ${seedMsg.startsWith('✓') ? A.green : A.red}`,
          borderRadius: 16, padding: '12px 20px', marginBottom: 20,
          fontSize: 14, color: seedMsg.startsWith('✓') ? A.green : A.red, fontWeight: 700,
        }}>
          {seedMsg}
        </div>
      )}

      {/* Pet tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        {pets.map(pet => {
          const active = draft.id === pet.id
          const img    = pet.image || PET_FALLBACK[pet.id.toLowerCase()] || ''
          return (
            <button key={pet.id} onClick={() => select(pet)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 22px',
              border: `2px solid ${active ? pet.color : A.border}`,
              borderRadius: 9999,
              background: active ? pet.color + '14' : A.card,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: active ? `0 4px 16px ${pet.color}33` : '0 2px 8px rgba(77,67,83,0.05)',
              transition: 'all 0.15s',
            }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', background: A.pageBg, flexShrink: 0 }}>
                {img
                  ? <img src={img} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                  : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 20 }}>{pet.emoji}</span>
                }
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: active ? pet.color : A.text }}>{pet.name}</div>
                <div style={{ fontSize: 10, color: A.textMuted }}>#{pet.number}</div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="admin-2col">
        {/* Left — identity + photo */}
        <div>
          <Card title="Identity">
            <Field label="Name"    value={draft.name}    onChange={v => update({ name: v })} />
            <Field label="Number"  value={draft.number}  onChange={v => update({ number: v })} />
            <Field label="Team"    value={draft.team}    onChange={v => update({ team: v })} />
            <Field label="Tagline" value={draft.tagline} onChange={v => update({ tagline: v })} />
            <Field label="Emoji"   value={draft.emoji}   onChange={v => update({ emoji: v })} />
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Accent Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="color" value={draft.color} onChange={e => update({ color: e.target.value })}
                  style={{ width: 48, height: 40, border: `1.5px solid ${A.borderMid}`, borderRadius: 12, cursor: 'pointer', padding: 2, background: 'transparent' }} />
                <span style={{ fontSize: 13, color: A.textMuted, fontFamily: 'monospace' }}>{draft.color}</span>
              </div>
            </div>
          </Card>

          <Card title="Photo">
            {imgSrc && (
              <div style={{ marginBottom: 16, display: 'flex', alignItems: 'flex-end', gap: 16 }}>
                <div style={{ width: 100, height: 100, borderRadius: 20, overflow: 'hidden', background: A.pageBg, border: `2px solid ${draft.color}44` }}>
                  <img src={imgSrc} alt={draft.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                </div>
                <button onClick={() => update({ image: '' })} style={{ fontSize: 12, color: A.red, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 700 }}>
                  Remove
                </button>
              </div>
            )}
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) uploadPhoto(f) }}
              style={{ border: `2px dashed ${A.borderMid}`, borderRadius: 16, padding: '28px', textAlign: 'center', cursor: 'pointer', background: A.pageBg }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>{uploading ? '⏳' : '📷'}</div>
              <div style={{ fontSize: 14, color: A.textMuted }}>{uploading ? 'Uploading...' : 'Drag & drop or click'}</div>
              <div style={{ fontSize: 11, color: A.textMuted, marginTop: 4 }}>JPG, PNG, WEBP</div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadPhoto(f) }} />
            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Or paste URL</label>
              <input value={draft.image} onChange={e => update({ image: e.target.value })} placeholder="https://..."
                style={{ width: '100%', padding: '11px 16px', background: A.inputBg, border: `1.5px solid ${A.borderMid}`, borderRadius: 12, fontSize: 13, color: A.text, outline: 'none', fontFamily: 'inherit' }} />
            </div>
          </Card>
        </div>

        {/* Right — stats + bio + preview */}
        <div>
          <Card title="Stats">
            <Slider label="Speed"       value={draft.speedBase}  onChange={v => update({ speedBase: v })}  color={draft.color} />
            <Slider label="Chaos"       value={draft.chaosBase}  onChange={v => update({ chaosBase: v })}  color={draft.color} />
            <Slider label="Snack Level" value={draft.snackLevel} onChange={v => update({ snackLevel: v })} color={draft.color} />
            <Slider label="Cage Level"  value={draft.cageLevel}  onChange={v => update({ cageLevel: v })}  color={draft.color} />
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Wins</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => update({ wins: Math.max(0, draft.wins - 1) })} style={{ width: 40, height: 40, borderRadius: '50%', border: `1.5px solid ${A.borderMid}`, background: A.pageBg, fontSize: 20, cursor: 'pointer', color: A.text, fontFamily: 'inherit' }}>−</button>
                <span style={{ fontSize: 26, fontWeight: 900, color: A.text, width: 48, textAlign: 'center' }}>{draft.wins}</span>
                <button onClick={() => update({ wins: draft.wins + 1 })} style={{ width: 40, height: 40, borderRadius: '50%', border: `1.5px solid ${A.borderMid}`, background: A.pageBg, fontSize: 20, cursor: 'pointer', color: A.text, fontFamily: 'inherit' }}>+</button>
              </div>
            </div>
          </Card>

          <Card title="Bio">
            <Field label={`About ${draft.name}`} value={draft.bio} onChange={v => update({ bio: v })} multiline />
          </Card>

          {/* Preview */}
          <Card title="Preview">
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', background: A.pageBg, flexShrink: 0, border: `2px solid ${draft.color}44` }}>
                {imgSrc && <img src={imgSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: draft.color, marginBottom: 3 }}>{draft.emoji} {draft.name}</div>
                <div style={{ fontSize: 13, color: A.textMuted, marginBottom: 10 }}>{draft.tagline}</div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {[['Speed', draft.speedBase], ['Chaos', draft.chaosBase], ['Wins', draft.wins]].map(([l, v]) => (
                    <span key={l as string} style={{ fontSize: 12, color: A.textMuted }}>
                      {l}: <span style={{ color: A.text, fontWeight: 700 }}>{v}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={save} disabled={saving} style={{
          padding: '14px 40px', background: A.yellow, border: 'none', borderRadius: 9999,
          color: A.yellowText, fontSize: 16, fontWeight: 900,
          cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.7 : 1, fontFamily: 'inherit',
          boxShadow: '0 8px 24px rgba(255,231,144,0.3)',
        }}>
          {saving ? 'Saving...' : saved ? '✓ Saved!' : `Save ${draft.name}`}
        </button>
      </div>
    </div>
  )
}
