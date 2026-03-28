'use client'
import { useEffect, useState } from 'react'
import { A } from '../theme'

const KANIT = "var(--font-kanit), sans-serif"

interface Pet {
  id: string; slug: string; name: string; tagline: string; bio: string
  image: string; color: string; wins: number; speedBase: number; chaosBase: number
  snackLevel: number; cageLevel: number
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: A.textMid, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</label>
        <span style={{ fontSize: 12, fontWeight: 700, color: A.purple }}>{value}</span>
      </div>
      <input type="range" min={0} max={100} value={value} onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: A.purple }} />
    </div>
  )
}

function Input({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: A.textMid, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${A.borderMid}`, fontSize: 14, color: A.text, outline: 'none', background: '#fff', width: '100%' }} />
    </div>
  )
}

function PetEditor({ pet, onSaved }: { pet: Pet; onSaved: (p: Pet) => void }) {
  const [form, setForm] = useState(pet)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = (k: keyof Pet) => (v: string | number) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    setSaving(true)
    const res = await fetch(`/api/admin/pets/${pet.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      const updated = await res.json()
      onSaved(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <div style={{ background: A.card, borderRadius: 16, border: `1.5px solid ${A.border}`, overflow: 'hidden', marginBottom: 20 }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: `1px solid ${A.border}`, background: A.pageBg, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {form.image && <img src={form.image} alt={form.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', background: '#ddd' }} />}
          <div>
            <h2 style={{ fontFamily: KANIT, fontSize: 16, fontWeight: 700, color: A.text }}>{form.name}</h2>
            <p style={{ fontSize: 12, color: A.textMuted }}>{pet.slug}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saved && <span style={{ fontSize: 12, color: A.green, fontWeight: 600 }}>Saved</span>}
          <button onClick={save} disabled={saving} style={{
            padding: '8px 20px', borderRadius: 48.5, background: A.yellow, border: 'none',
            fontFamily: KANIT, fontSize: 13, fontWeight: 700, color: A.yellowText,
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div style={{ padding: 24, display: 'grid', gap: 20 }} className="admin-2col">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Name" value={form.name} onChange={set('name')} />
          <Input label="Tagline" value={form.tagline} onChange={set('tagline')} />
          <Input label="Wins" type="number" value={form.wins} onChange={v => set('wins')(Number(v))} />
          <Input label="Color (hex)" value={form.color} onChange={set('color')} placeholder="#735DFF" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: A.textMid, textTransform: 'uppercase', letterSpacing: 0.6 }}>Bio</label>
            <textarea value={form.bio} onChange={e => set('bio')(e.target.value)} rows={4}
              style={{ padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${A.borderMid}`, fontSize: 14, color: A.text, outline: 'none', background: '#fff', resize: 'vertical', fontFamily: 'Pretendard, sans-serif', lineHeight: 1.6, width: '100%' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Image URL" value={form.image} onChange={set('image')} placeholder="https://..." />
          {form.image && (
            <img src={form.image} alt="" style={{ width: '100%', height: 160, objectFit: 'contain', background: '#f0f0f0', borderRadius: 10 }} />
          )}
          <Slider label="Speed" value={form.speedBase} onChange={v => set('speedBase')(v)} />
          <Slider label="Chaos" value={form.chaosBase} onChange={v => set('chaosBase')(v)} />
          <Slider label="Snack Level" value={form.snackLevel} onChange={v => set('snackLevel')(v)} />
          <Slider label="Cage Level" value={form.cageLevel} onChange={v => set('cageLevel')(v)} />
        </div>
      </div>
    </div>
  )
}

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    fetch('/api/admin/pets')
      .then(r => r.json())
      .then(d => Array.isArray(d) ? setPets(d) : setErr(d.error ?? 'Error'))
      .catch(e => setErr(String(e)))
      .finally(() => setLoading(false))
  }, [])

  const onSaved = (updated: Pet) => setPets(ps => ps.map(p => p.id === updated.id ? updated : p))

  return (
    <div className="admin-page">
      <h1 style={{ fontFamily: KANIT, fontSize: 26, fontWeight: 700, color: A.text, marginBottom: 28 }}>Hamsters</h1>
      {err && <div style={{ padding: '12px 16px', background: A.redSoft, border: `1px solid ${A.red}`, borderRadius: 10, color: A.red, fontSize: 14, marginBottom: 20 }}>{err}</div>}
      {loading ? (
        [1,2,3].map(i => <div key={i} style={{ background: A.card, borderRadius: 16, border: `1.5px solid ${A.border}`, height: 240, marginBottom: 20, animation: 'pulse 1.4s ease-in-out infinite' }} />)
      ) : (
        pets.map(p => <PetEditor key={p.id} pet={p} onSaved={onSaved} />)
      )}
    </div>
  )
}
