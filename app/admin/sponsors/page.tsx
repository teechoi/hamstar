'use client'
import { useState, useEffect } from 'react'
import { T, LimeButton, OutlineButton, Tag } from '@/components/ui'
import { PETS } from '@/config/site'

type Sponsor = { id: string; name: string; emoji: string; tier: 'SILVER' | 'GOLD' | 'TITLE'; petId: string | null; websiteUrl: string | null; active: boolean; solPerRace: number; pet: { id: string; name: string; emoji: string } | null }
type NewSponsor = { name: string; emoji: string; tier: 'SILVER' | 'GOLD' | 'TITLE'; petId: string; websiteUrl: string }

const EMPTY: NewSponsor = { name: '', emoji: '🏆', tier: 'SILVER', petId: '', websiteUrl: '' }
const TIER_COLORS = { TITLE: T.coral, GOLD: T.yellow, SILVER: T.violet }
const TIER_BG = { TITLE: T.coralSoft, GOLD: '#FFFBE6', SILVER: T.violetSoft }

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<NewSponsor>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const load = () => fetch('/api/admin/sponsors').then((r) => r.json()).then(setSponsors)
  useEffect(() => { load() }, [])

  const update = (patch: Partial<NewSponsor>) => setForm((f) => ({ ...f, ...patch }))

  const save = async () => {
    setSaving(true)
    if (editId) {
      await fetch(`/api/admin/sponsors/${editId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, petId: form.petId || null, websiteUrl: form.websiteUrl || null }) })
    } else {
      await fetch('/api/admin/sponsors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, petId: form.petId || null, websiteUrl: form.websiteUrl || null }) })
    }
    setSaving(false)
    setShowForm(false)
    setEditId(null)
    setForm(EMPTY)
    load()
  }

  const deactivate = async (id: string) => {
    await fetch(`/api/admin/sponsors/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: false }) })
    load()
  }

  const reactivate = async (id: string) => {
    await fetch(`/api/admin/sponsors/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: true }) })
    load()
  }

  const active = sponsors.filter((s) => s.active)
  const inactive = sponsors.filter((s) => !s.active)

  return (
    <div style={{ padding: '32px 28px', maxWidth: 800 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: T.text }}>Sponsors</div>
          <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>{active.length} active sponsors</div>
        </div>
        <LimeButton onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY) }}>+ Add Sponsor</LimeButton>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: T.card, border: `2px solid ${T.blue}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 20 }}>{editId ? 'Edit Sponsor' : 'New Sponsor'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[['Name', 'name'], ['Emoji', 'emoji'], ['Website URL', 'websiteUrl']].map(([label, key]) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{label}</label>
                <input value={(form as Record<string, string>)[key]} onChange={(e) => update({ [key]: e.target.value } as Partial<NewSponsor>)}
                  style={{ width: '100%', padding: '9px 12px', border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 13, color: T.text, fontFamily: 'inherit', outline: 'none', background: T.bg }} />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Tier</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(['SILVER', 'GOLD', 'TITLE'] as const).map((tier) => (
                  <button key={tier} onClick={() => update({ tier })} style={{ padding: '7px 14px', border: `2px solid ${form.tier === tier ? TIER_COLORS[tier] : T.border}`, borderRadius: 8, background: form.tier === tier ? TIER_BG[tier] : T.bg, fontSize: 12, fontWeight: 800, cursor: 'pointer', color: form.tier === tier ? TIER_COLORS[tier] : T.textMid }}>
                    {tier}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Linked Pet</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => update({ petId: '' })} style={{ padding: '7px 12px', border: `2px solid ${form.petId === '' ? T.blue : T.border}`, borderRadius: 8, background: form.petId === '' ? T.blueSoft : T.bg, fontSize: 12, fontWeight: 700, cursor: 'pointer', color: form.petId === '' ? T.blue : T.textMid }}>
                  None
                </button>
                {PETS.map((p) => (
                  <button key={p.id} onClick={() => update({ petId: p.id })} style={{ padding: '7px 12px', border: `2px solid ${form.petId === p.id ? p.color : T.border}`, borderRadius: 8, background: form.petId === p.id ? p.color + '18' : T.bg, fontSize: 12, fontWeight: 700, cursor: 'pointer', color: form.petId === p.id ? p.color : T.textMid }}>
                    {p.emoji} {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <OutlineButton onClick={() => { setShowForm(false); setEditId(null) }}>Cancel</OutlineButton>
            <LimeButton onClick={save} >{saving ? 'Saving...' : 'Save Sponsor'}</LimeButton>
          </div>
        </div>
      )}

      {/* Active sponsors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {active.map((s) => {
          const tc = TIER_COLORS[s.tier]
          return (
            <div key={s.id} style={{ background: T.card, border: `2px solid ${tc}44`, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: tc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{s.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{s.name}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>
                  <Tag label={s.tier} color={tc} bg={TIER_BG[s.tier]} />
                  {s.pet && <span style={{ marginLeft: 6 }}>→ {s.pet.emoji} {s.pet.name}</span>}
                  {s.websiteUrl && <span style={{ marginLeft: 6 }}>· <a href={s.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ color: T.blue }}>website</a></span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setEditId(s.id); setForm({ name: s.name, emoji: s.emoji, tier: s.tier, petId: s.petId ?? '', websiteUrl: s.websiteUrl ?? '' }); setShowForm(true) }}
                  style={{ padding: '6px 12px', background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', color: T.textMid }}>✏️ Edit</button>
                <button onClick={() => deactivate(s.id)}
                  style={{ padding: '6px 12px', background: T.bg, border: `1.5px solid ${T.coral}44`, borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', color: T.coral }}>Deactivate</button>
              </div>
            </div>
          )
        })}
        {active.length === 0 && <div style={{ fontSize: 13, color: T.textMuted, padding: '12px 0' }}>No active sponsors yet. Add one above.</div>}
      </div>

      {/* Inactive */}
      {inactive.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Inactive Sponsors</div>
          {inactive.map((s) => (
            <div key={s.id} style={{ background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, opacity: 0.6 }}>
              <span style={{ fontSize: 18 }}>{s.emoji}</span>
              <span style={{ fontSize: 13, color: T.textMid, flex: 1 }}>{s.name}</span>
              <button onClick={() => reactivate(s.id)} style={{ padding: '5px 12px', background: T.greenSoft, border: `1.5px solid ${T.green}`, borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', color: T.green }}>Reactivate</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
