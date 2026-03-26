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
  TITLE:  { label: 'Title',  color: '#FF3B5C', soft: 'rgba(255,59,92,0.08)',   star: '👑' },
  GOLD:   { label: 'Gold',   color: '#F5A623', soft: 'rgba(245,166,35,0.08)',  star: '⭐' },
  SILVER: { label: 'Silver', color: A.purple,  soft: A.purpleSoft,             star: '✦' },
}

function TierPill({ tier }: { tier: 'TITLE' | 'GOLD' | 'SILVER' }) {
  const m = TIER_META[tier]
  return (
    <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 9999, background: m.soft, color: m.color, border: `1px solid ${m.color}44` }}>
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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 16px',
    background: A.inputBg, border: `1.5px solid ${A.borderMid}`,
    borderRadius: 12, fontSize: 14, color: A.text, outline: 'none', fontFamily: 'inherit',
  }

  return (
    <div className="admin-page" style={{ maxWidth: 820 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 900, color: A.text }}>Sponsors</div>
          <div style={{ fontSize: 14, color: A.textMuted, marginTop: 4 }}>{active.length} active</div>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY) }} style={{
          padding: '12px 24px', background: A.yellow, border: 'none', borderRadius: 9999,
          color: A.yellowText, fontSize: 14, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: '0 8px 24px rgba(255,231,144,0.3)',
        }}>
          + Add Sponsor
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{
          background: A.card, border: `1.5px solid ${A.yellow}55`,
          borderRadius: 24, padding: '28px 32px', marginBottom: 28,
          boxShadow: '0 4px 20px rgba(77,67,83,0.06)',
        }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: A.text, marginBottom: 20 }}>
            {editId ? 'Edit Sponsor' : 'New Sponsor'}
          </div>
          <div className="admin-2col" style={{ gap: 20 }}>
            <div>
              {[['Name', 'name'], ['Emoji', 'emoji'], ['Website URL', 'websiteUrl']].map(([label, key]) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{label}</label>
                  <input value={(form as Record<string, string>)[key]} onChange={e => upd({ [key]: e.target.value } as Partial<NewSponsor>)} style={inputStyle} />
                </div>
              ))}
            </div>
            <div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Tier</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(['TITLE', 'GOLD', 'SILVER'] as const).map(tier => {
                    const m  = TIER_META[tier]
                    const on = form.tier === tier
                    return (
                      <button key={tier} onClick={() => upd({ tier })} style={{
                        padding: '9px 18px', border: `2px solid ${on ? m.color : A.border}`,
                        borderRadius: 9999, background: on ? m.soft : A.pageBg,
                        fontSize: 13, fontWeight: 800, cursor: 'pointer',
                        color: on ? m.color : A.textMuted, fontFamily: 'inherit',
                      }}>
                        {m.star} {m.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Linked Hamster</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => upd({ petId: '' })} style={{
                    padding: '7px 16px', border: `2px solid ${form.petId === '' ? A.yellow : A.border}`,
                    borderRadius: 9999, background: form.petId === '' ? A.yellowSoft : A.pageBg,
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    color: form.petId === '' ? A.yellowText : A.textMuted, fontFamily: 'inherit',
                  }}>
                    None
                  </button>
                  {PETS.map(p => (
                    <button key={p.id} onClick={() => upd({ petId: p.id })} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 14px 6px 6px',
                      border: `2px solid ${form.petId === p.id ? p.color : A.border}`,
                      borderRadius: 9999, background: form.petId === p.id ? p.color + '14' : A.pageBg,
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      color: form.petId === p.id ? p.color : A.textMuted, fontFamily: 'inherit',
                    }}>
                      <img src={PET_IMAGES[p.id] ?? ''} alt={p.name} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', background: A.pageBg }} />
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
            <button onClick={() => { setShowForm(false); setEditId(null) }} style={{ padding: '11px 22px', background: 'transparent', border: `1.5px solid ${A.borderMid}`, borderRadius: 9999, color: A.textMid, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            <button onClick={save} disabled={saving} style={{ padding: '11px 28px', background: A.yellow, border: 'none', borderRadius: 9999, color: A.yellowText, fontSize: 14, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' }}>
              {saving ? 'Saving...' : 'Save Sponsor'}
            </button>
          </div>
        </div>
      )}

      {/* Active sponsors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
        {active.map(s => {
          const petImg = s.pet ? (PET_IMAGES[s.pet.id] ?? '') : ''
          return (
            <div key={s.id} style={{
              background: A.card, border: `1px solid ${A.border}`,
              borderRadius: 20, padding: '18px 24px',
              display: 'flex', alignItems: 'center', gap: 16,
              flexWrap: 'wrap', boxShadow: '0 2px 12px rgba(77,67,83,0.05)',
            }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', background: A.pageBg, flexShrink: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                {petImg
                  ? <img src={petImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                  : <span style={{ fontSize: 26, lineHeight: '52px' }}>{s.emoji}</span>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: A.text }}>{s.emoji} {s.name}</span>
                  <TierPill tier={s.tier} />
                </div>
                <div style={{ fontSize: 13, color: A.textMuted }}>
                  {s.pet && <span>{s.pet.emoji} {s.pet.name} · </span>}
                  {s.websiteUrl && <a href={s.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ color: A.purple, textDecoration: 'none', fontWeight: 600 }}>{s.websiteUrl}</a>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={() => startEdit(s)} style={{ padding: '8px 16px', background: A.pageBg, border: `1.5px solid ${A.border}`, borderRadius: 9999, fontSize: 12, fontWeight: 700, cursor: 'pointer', color: A.textMid, fontFamily: 'inherit' }}>Edit</button>
                <button onClick={() => toggle(s.id, false)} style={{ padding: '8px 16px', background: A.redSoft, border: `1.5px solid ${A.red}44`, borderRadius: 9999, fontSize: 12, fontWeight: 700, cursor: 'pointer', color: A.red, fontFamily: 'inherit' }}>Deactivate</button>
              </div>
            </div>
          )
        })}
        {active.length === 0 && <div style={{ fontSize: 14, color: A.textMuted, padding: '16px 0' }}>No active sponsors. Add one above.</div>}
      </div>

      {/* Inactive */}
      {inactive.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14 }}>Inactive</div>
          {inactive.map(s => (
            <div key={s.id} style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 14, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, opacity: 0.5 }}>
              <span style={{ fontSize: 20 }}>{s.emoji}</span>
              <span style={{ fontSize: 14, color: A.textMid, flex: 1 }}>{s.name}</span>
              <button onClick={() => toggle(s.id, true)} style={{ padding: '6px 16px', background: A.greenSoft, border: `1.5px solid ${A.green}44`, borderRadius: 9999, fontSize: 12, fontWeight: 700, cursor: 'pointer', color: A.green, fontFamily: 'inherit' }}>Reactivate</button>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
