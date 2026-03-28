'use client'
import { useEffect, useState } from 'react'
import { A } from '../theme'

const KANIT = "var(--font-kanit), sans-serif"
const TIERS = ['SILVER', 'GOLD', 'TITLE']
const TIER_COLORS: Record<string, [string, string]> = {
  SILVER: ['#f0f0f0', '#888'],
  GOLD:   [A.yellowSoft, '#B8860B'],
  TITLE:  [A.purpleSoft, A.purple],
}

interface Pet { id: string; name: string }
interface Sponsor {
  id: string; name: string; emoji: string; tier: string
  solPerRace: number; walletAddress?: string; websiteUrl?: string
  active: boolean; pet?: { id: string; name: string }
}

const EMPTY_FORM = { name: '', emoji: '🏆', tier: 'SILVER', solPerRace: '0', petId: '', walletAddress: '', websiteUrl: '', active: true }

function Input({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: A.textMid, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${A.borderMid}`, fontSize: 14, color: A.text, outline: 'none', background: '#fff', width: '100%' }} />
    </div>
  )
}

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/sponsors').then(r => r.json()),
      fetch('/api/admin/pets').then(r => r.json()),
    ]).then(([s, p]) => {
      setSponsors(Array.isArray(s) ? s : [])
      setPets(Array.isArray(p) ? p : [])
    }).finally(() => setLoading(false))
  }, [])

  const set = (k: keyof typeof form) => (v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  const addSponsor = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/sponsors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, solPerRace: Number(form.solPerRace), petId: form.petId || null }),
    })
    setSaving(false)
    if (res.ok) {
      const s = await res.json()
      setSponsors(prev => [s, ...prev])
      setForm({ ...EMPTY_FORM })
      setAdding(false)
    } else setErr('Failed to add')
  }

  const toggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/admin/sponsors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    })
    setSponsors(prev => prev.map(s => s.id === id ? { ...s, active } : s))
  }

  const deleteSponsor = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    await fetch(`/api/admin/sponsors/${id}`, { method: 'DELETE' })
    setSponsors(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, gap: 12 }}>
        <h1 style={{ fontFamily: KANIT, fontSize: 26, fontWeight: 700, color: A.text }}>Sponsors</h1>
        <button onClick={() => setAdding(a => !a)} style={{
          padding: '10px 20px', borderRadius: 48.5, background: A.yellow, border: 'none',
          fontFamily: KANIT, fontSize: 14, fontWeight: 700, color: A.yellowText, cursor: 'pointer',
        }}>
          {adding ? 'Cancel' : '+ Add Sponsor'}
        </button>
      </div>

      {err && <div style={{ padding: '12px 16px', background: A.redSoft, border: `1px solid ${A.red}`, borderRadius: 10, color: A.red, fontSize: 14, marginBottom: 20 }}>{err}</div>}

      {adding && (
        <div style={{ background: A.card, borderRadius: 16, border: `1.5px solid ${A.border}`, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontFamily: KANIT, fontSize: 16, fontWeight: 700, color: A.text, marginBottom: 20 }}>New Sponsor</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="admin-2col">
              <Input label="Name" value={form.name} onChange={set('name')} />
              <Input label="Emoji" value={form.emoji} onChange={set('emoji')} />
            </div>
            <div className="admin-2col">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: A.textMid, textTransform: 'uppercase', letterSpacing: 0.6 }}>Tier</label>
                <select value={form.tier} onChange={e => set('tier')(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${A.borderMid}`, fontSize: 14, color: A.text, background: '#fff' }}>
                  {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: A.textMid, textTransform: 'uppercase', letterSpacing: 0.6 }}>Linked Pet</label>
                <select value={form.petId} onChange={e => set('petId')(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${A.borderMid}`, fontSize: 14, color: A.text, background: '#fff' }}>
                  <option value="">None</option>
                  {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div className="admin-2col">
              <Input label="SOL per Race" type="number" value={form.solPerRace} onChange={set('solPerRace')} />
              <Input label="Website URL" value={form.websiteUrl} onChange={set('websiteUrl')} placeholder="https://..." />
            </div>
            <Input label="Wallet Address" value={form.walletAddress} onChange={set('walletAddress')} placeholder="Solana wallet" />
            <button onClick={addSponsor} disabled={saving || !form.name} style={{
              alignSelf: 'flex-start', padding: '10px 24px', borderRadius: 48.5, background: A.purple, border: 'none',
              fontFamily: KANIT, fontSize: 14, fontWeight: 700, color: '#fff',
              cursor: (saving || !form.name) ? 'not-allowed' : 'pointer', opacity: (saving || !form.name) ? 0.6 : 1,
            }}>
              {saving ? 'Adding…' : 'Add Sponsor'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        [1,2,3].map(i => <div key={i} style={{ height: 80, borderRadius: 16, background: A.border, marginBottom: 12, animation: 'pulse 1.4s ease-in-out infinite' }} />)
      ) : sponsors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: A.textMuted, fontSize: 14 }}>No sponsors yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sponsors.map(s => {
            const [tierBg, tierFg] = TIER_COLORS[s.tier] ?? [A.border, A.textMuted]
            return (
              <div key={s.id} style={{
                background: A.card, borderRadius: 16, border: `1.5px solid ${A.border}`,
                padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                opacity: s.active ? 1 : 0.5,
              }}>
                <span style={{ fontSize: 28 }}>{s.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <p style={{ fontFamily: KANIT, fontSize: 15, fontWeight: 700, color: A.text }}>{s.name}</p>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: tierBg, color: tierFg }}>{s.tier}</span>
                    {s.pet && <span style={{ fontSize: 11, color: A.textMuted }}>→ {s.pet.name}</span>}
                  </div>
                  <p style={{ fontSize: 12, color: A.textMuted }}>◎ {Number(s.solPerRace).toFixed(2)}/race{s.websiteUrl ? ` · ${s.websiteUrl}` : ''}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => toggleActive(s.id, !s.active)} style={{
                    padding: '7px 14px', borderRadius: 99, border: `1.5px solid ${A.borderMid}`,
                    fontSize: 12, fontWeight: 600, color: s.active ? A.red : A.green,
                    background: 'transparent', cursor: 'pointer',
                  }}>
                    {s.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => deleteSponsor(s.id, s.name)} style={{
                    padding: '7px 14px', borderRadius: 99, border: `1.5px solid ${A.redSoft}`,
                    fontSize: 12, fontWeight: 600, color: A.red, background: 'transparent', cursor: 'pointer',
                  }}>
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
