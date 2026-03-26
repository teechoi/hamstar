'use client'
import { useState, useEffect } from 'react'
import { PETS } from '@/config/site'
import { A } from '../theme'

type Sponsor    = { id: string; name: string; emoji: string; tier: 'SILVER' | 'GOLD' | 'TITLE'; petId: string | null; websiteUrl: string | null; active: boolean; solPerRace: number; pet: { id: string; name: string; emoji: string } | null }
type NewSponsor = { name: string; emoji: string; tier: 'SILVER' | 'GOLD' | 'TITLE'; petId: string; websiteUrl: string }

const EMPTY: NewSponsor = { name: '', emoji: '🏆', tier: 'SILVER', petId: '', websiteUrl: '' }

const PET_IMAGES: Record<string, string> = {
  dash: '/images/hamster-dash.png', flash: '/images/hamster-flash.png', turbo: '/images/hamster-turbo.png',
}

const TIER_META = {
  TITLE:  { label: 'Title',  color: '#FF3B5C', soft: 'rgba(255,59,92,0.12)',   star: '👑' },
  GOLD:   { label: 'Gold',   color: '#F5A623', soft: 'rgba(245,166,35,0.12)',  star: '⭐' },
  SILVER: { label: 'Silver', color: '#A78BFA', soft: 'rgba(167,139,250,0.12)', star: '✦' },
}

function TierPill({ tier }: { tier: 'TITLE' | 'GOLD' | 'SILVER' }) {
  const m = TIER_META[tier]
  return (
    <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 99, background: m.soft, color: m.color, border: `1px solid ${m.color}44` }}>
      {m.star} {m.label}
    </span>
  )
}

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form,     setForm]     = useState<NewSponsor>(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [editId,   setEditId]   = useState<string | null>(null)

  const load = () => fetch('/api/admin/sponsors').then(r => r.json()).then(setSponsors)
  useEffect(() => { load() }, [])

  const upd = (patch: Partial<NewSponsor>) => setForm(f => ({ ...f, ...patch }))

  const save = async () => {
    setSaving(true)
    const body = { ...form, petId: form.petId || null, websiteUrl: form.websiteUrl || null }
    if (editId) {
      await fetch(`/api/admin/sponsors/${editId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    } else {
      await fetch('/api/admin/sponsors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    setSaving(false); setShowForm(false); setEditId(null); setForm(EMPTY); load()
  }

  const toggle = async (id: string, active: boolean) => {
    await fetch(`/api/admin/sponsors/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active }) })
    load()
  }

  const startEdit = (s: Sponsor) => {
    setEditId(s.id)
    setForm({ name: s.name, emoji: s.emoji, tier: s.tier, petId: s.petId ?? '', websiteUrl: s.websiteUrl ?? '' })
    setShowForm(true)
  }

  const active   = sponsors.filter(s => s.active)
  const inactive = sponsors.filter(s => !s.active)

  const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', background: A.inputBg, border: `1px solid ${A.border}`, borderRadius: 8, fontSize: 13, color: A.text, outline: 'none', fontFamily: 'inherit' }

  return (
    <div className="admin-page" style={{ maxWidth: 820 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: A.text }}>Sponsors</div>
          <div style={{ fontSize: 13, color: A.textMuted, marginTop: 4 }}>{active.length} active</div>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY) }} style={{ padding: '10px 20px', background: A.gold, border: 'none', borderRadius: 10, color: A.goldText, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
          + Add Sponsor
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: A.card, border: `1px solid ${A.gold}44`, borderRadius: 16, padding: 24, marginBottom: 28 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: A.text, marginBottom: 20 }}>
            {editId ? 'Edit Sponsor' : 'New Sponsor'}
          </div>
          <div className="admin-2col" style={{ gap: 16 }}>
            <div>
              {[['Name', 'name'], ['Emoji', 'emoji'], ['Website URL', 'websiteUrl']].map(([label, key]) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{label}</label>
                  <input value={(form as Record<string, string>)[key]} onChange={e => upd({ [key]: e.target.value } as Partial<NewSponsor>)} style={inputStyle} />
                </div>
              ))}
            </div>
            <div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Tier</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(['TITLE', 'GOLD', 'SILVER'] as const).map(tier => {
                    const m = TIER_META[tier]
                    const active = form.tier === tier
                    return (
                      <button key={tier} onClick={() => upd({ tier })} style={{ padding: '8px 16px', border: `2px solid ${active ? m.color : A.border}`, borderRadius: 8, background: active ? m.soft : A.inputBg, fontSize: 12, fontWeight: 800, cursor: 'pointer', color: active ? m.color : A.textMuted, fontFamily: 'inherit' }}>
                        {m.star} {m.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Linked Hamster</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => upd({ petId: '' })} style={{ padding: '6px 14px', border: `2px solid ${form.petId === '' ? A.gold : A.border}`, borderRadius: 8, background: form.petId === '' ? A.goldSoft : A.inputBg, fontSize: 12, fontWeight: 700, cursor: 'pointer', color: form.petId === '' ? A.gold : A.textMuted, fontFamily: 'inherit' }}>
                    None
                  </button>
                  {PETS.map(p => (
                    <button key={p.id} onClick={() => upd({ petId: p.id })} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px 5px 6px', border: `2px solid ${form.petId === p.id ? p.color : A.border}`, borderRadius: 10, background: form.petId === p.id ? p.color + '18' : A.inputBg, fontSize: 12, fontWeight: 700, cursor: 'pointer', color: form.petId === p.id ? p.color : A.textMuted, fontFamily: 'inherit' }}>
                      <img src={PET_IMAGES[p.id] ?? ''} alt={p.name} style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', objectPosition: 'top', background: A.border }} />
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button onClick={() => { setShowForm(false); setEditId(null) }} style={{ padding: '10px 20px', background: 'transparent', border: `1px solid ${A.border}`, borderRadius: 8, color: A.textMid, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            <button onClick={save} disabled={saving} style={{ padding: '10px 24px', background: A.gold, border: 'none', borderRadius: 8, color: A.goldText, fontSize: 13, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' }}>
              {saving ? 'Saving...' : 'Save Sponsor'}
            </button>
          </div>
        </div>
      )}

      {/* Active sponsors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {active.map(s => {
          const petImg = s.pet ? (PET_IMAGES[s.pet.id] ?? '') : ''
          return (
            <div key={s.id} style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              {/* Pet image or emoji icon */}
              <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', background: A.bg, flexShrink: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                {petImg
                  ? <img src={petImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                  : <span style={{ fontSize: 24, lineHeight: '44px' }}>{s.emoji}</span>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: A.text }}>{s.emoji} {s.name}</span>
                  <TierPill tier={s.tier} />
                </div>
                <div style={{ fontSize: 12, color: A.textMuted }}>
                  {s.pet && <span>{s.pet.emoji} {s.pet.name} · </span>}
                  {s.websiteUrl && <a href={s.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ color: A.blue, textDecoration: 'none' }}>{s.websiteUrl}</a>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={() => startEdit(s)} style={{ padding: '7px 14px', background: A.inputBg, border: `1px solid ${A.border}`, borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', color: A.textMid, fontFamily: 'inherit' }}>Edit</button>
                <button onClick={() => toggle(s.id, false)} style={{ padding: '7px 14px', background: A.redSoft, border: `1px solid ${A.red}44`, borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', color: A.red, fontFamily: 'inherit' }}>Deactivate</button>
              </div>
            </div>
          )
        })}
        {active.length === 0 && <div style={{ fontSize: 13, color: A.textMuted, padding: '12px 0' }}>No active sponsors. Add one above.</div>}
      </div>

      {/* Inactive */}
      {inactive.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Inactive</div>
          {inactive.map(s => (
            <div key={s.id} style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, opacity: 0.5 }}>
              <span style={{ fontSize: 18 }}>{s.emoji}</span>
              <span style={{ fontSize: 13, color: A.textMid, flex: 1 }}>{s.name}</span>
              <button onClick={() => toggle(s.id, true)} style={{ padding: '5px 14px', background: A.greenSoft, border: `1px solid ${A.green}44`, borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', color: A.green, fontFamily: 'inherit' }}>Reactivate</button>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
