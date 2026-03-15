export const dynamic = 'force-dynamic'
'use client'
import { useState, useEffect, useRef } from 'react'
import { T, LimeButton, RaceBar } from '@/components/ui'

type Pet = {
  id: string; name: string; number: string; emoji: string; team: string
  tagline: string; bio: string; image: string; color: string
  speedBase: number; chaosBase: number; wins: number; snackLevel: number; cageLevel: number
}

function Field({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  const base = { width: '100%', padding: '10px 12px', border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 13, color: T.text, fontFamily: 'inherit', outline: 'none', background: T.bg }
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} style={{ ...base, resize: 'vertical', lineHeight: 1.6 }} />
        : <input value={value} onChange={(e) => onChange(e.target.value)} style={base} />
      }
    </div>
  )
}

function Slider({ label, value, onChange, color }: { label: string; value: number; onChange: (v: number) => void; color: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</label>
        <span style={{ fontSize: 13, fontWeight: 900, color: T.text }}>{value}</span>
      </div>
      <input type="range" min={0} max={100} value={value} onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: color }} />
    </div>
  )
}

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [selected, setSelected] = useState<Pet | null>(null)
  const [draft, setDraft] = useState<Pet | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/pets').then((r) => r.json()).then((data: Pet[]) => {
      setPets(data)
      if (data[0]) { setSelected(data[0]); setDraft(data[0]) }
    })
  }, [])

  const selectPet = (pet: Pet) => { setSelected(pet); setDraft(pet); setSaved(false) }
  const update = (patch: Partial<Pet>) => setDraft((d) => d ? { ...d, ...patch } : d)

  const save = async () => {
    if (!draft) return
    setSaving(true)
    const res = await fetch(`/api/admin/pets/${draft.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    })
    if (res.ok) {
      const updated = await res.json()
      setPets((prev) => prev.map((p) => p.id === updated.id ? updated : p))
      setSelected(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
    setSaving(false)
  }

  const uploadPhoto = async (file: File) => {
    if (!draft) return
    setUploading(true)
    try {
      const sigRes = await fetch('/api/admin/upload', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'hamstar/pets' }),
      })
      const { signature, timestamp, apiKey, cloudName, folder, uploadUrl } = await sigRes.json()

      const form = new FormData()
      form.append('file', file)
      form.append('api_key', apiKey)
      form.append('timestamp', timestamp)
      form.append('signature', signature)
      form.append('folder', folder)

      const uploadRes = await fetch(uploadUrl, { method: 'POST', body: form })
      const uploadData = await uploadRes.json()
      if (uploadData.secure_url) {
        update({ image: uploadData.secure_url })
      }
    } finally {
      setUploading(false)
    }
  }

  if (!draft) return <div style={{ padding: 32, color: T.textMuted }}>Loading...</div>

  return (
    <div style={{ padding: '32px 28px', maxWidth: 900 }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: T.text, marginBottom: 4 }}>Pet Manager</div>
      <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 24 }}>Edit racer profiles, stats, and photos</div>

      {/* Pet selector */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        {pets.map((pet) => (
          <button key={pet.id} onClick={() => selectPet(pet)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px',
            border: `2px solid ${selected?.id === pet.id ? pet.color : T.border}`,
            borderRadius: 12, background: selected?.id === pet.id ? pet.color + '18' : T.card,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: selected?.id === pet.id ? `4px 4px 0 ${pet.color}` : 'none',
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: pet.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, overflow: 'hidden' }}>
              {pet.image ? <img src={pet.image} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : pet.emoji}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, color: selected?.id === pet.id ? pet.color : T.text }}>{pet.name}</div>
              <div style={{ fontSize: 10, color: T.textMuted }}>#{pet.number}</div>
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left col */}
        <div>
          <div style={{ background: T.card, border: `2px solid ${T.border}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Identity</div>
            <Field label="Name" value={draft.name} onChange={(v) => update({ name: v })} />
            <Field label="Number" value={draft.number} onChange={(v) => update({ number: v })} />
            <Field label="Team" value={draft.team} onChange={(v) => update({ team: v })} />
            <Field label="Tagline" value={draft.tagline} onChange={(v) => update({ tagline: v })} />
            <Field label="Emoji (used when no photo)" value={draft.emoji} onChange={(v) => update({ emoji: v })} />
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Accent Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="color" value={draft.color} onChange={(e) => update({ color: e.target.value })}
                  style={{ width: 44, height: 36, border: `1.5px solid ${T.border}`, borderRadius: 8, cursor: 'pointer', padding: 2 }} />
                <span style={{ fontSize: 12, color: T.textMuted, fontFamily: 'monospace' }}>{draft.color}</span>
              </div>
            </div>
          </div>

          {/* Photo upload */}
          <div style={{ background: T.card, border: `2px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Pet Photo</div>
            {draft.image && (
              <img src={draft.image} alt={draft.name} style={{ width: 80, height: 80, borderRadius: 14, objectFit: 'cover', marginBottom: 12, border: `2px solid ${draft.color}` }} />
            )}
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) uploadPhoto(f) }}
              style={{
                border: `2px dashed ${T.border}`, borderRadius: 10, padding: '20px',
                textAlign: 'center', cursor: 'pointer', background: T.bg,
              }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{uploading ? '⏳' : '📁'}</div>
              <div style={{ fontSize: 13, color: T.textMuted }}>
                {uploading ? 'Uploading...' : 'Drag & drop or click to upload'}
              </div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>JPG, PNG, WEBP</div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f) }} />
            {draft.image && (
              <button onClick={() => update({ image: '' })} style={{ marginTop: 8, fontSize: 11, color: T.coral, background: 'none', border: 'none', cursor: 'pointer' }}>
                Remove photo
              </button>
            )}
          </div>
        </div>

        {/* Right col */}
        <div>
          <div style={{ background: T.card, border: `2px solid ${T.border}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Stats</div>
            <Slider label="Speed" value={draft.speedBase} onChange={(v) => update({ speedBase: v })} color={draft.color} />
            <Slider label="Chaos" value={draft.chaosBase} onChange={(v) => update({ chaosBase: v })} color={draft.color} />
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Wins</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => update({ wins: Math.max(0, draft.wins - 1) })} style={{ width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.bg, fontSize: 18, cursor: 'pointer' }}>−</button>
                <span style={{ fontSize: 20, fontWeight: 900, color: T.text, width: 40, textAlign: 'center' }}>{draft.wins}</span>
                <button onClick={() => update({ wins: draft.wins + 1 })} style={{ width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.bg, fontSize: 18, cursor: 'pointer' }}>+</button>
              </div>
            </div>
            <Slider label="Snack Level %" value={draft.snackLevel} onChange={(v) => update({ snackLevel: v })} color={draft.color} />
            <Slider label="Cage Level %" value={draft.cageLevel} onChange={(v) => update({ cageLevel: v })} color={draft.color} />
          </div>

          <div style={{ background: T.card, border: `2px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Bio</div>
            <Field label={`About ${draft.name}`} value={draft.bio} onChange={(v) => update({ bio: v })} multiline />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
        <LimeButton onClick={save}>
          {saving ? 'Saving...' : saved ? '✓ Saved!' : `Save ${draft.name}`}
        </LimeButton>
      </div>
    </div>
  )
}
