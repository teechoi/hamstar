'use client'
import { useEffect, useState } from 'react'
import { A } from '../theme'

const KANIT = "var(--font-kanit), sans-serif"

interface Settings {
  navTagline: string
  heroTitle: string
  aboutText: string
  arenaSubtitle: string
  footerTagline: string
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: A.card, borderRadius: 16, border: `1.5px solid ${A.border}`,
      marginBottom: 24, overflow: 'hidden',
    }}>
      <div style={{ padding: '18px 24px', borderBottom: `1px solid ${A.border}`, background: A.pageBg }}>
        <h2 style={{ fontFamily: KANIT, fontSize: 15, fontWeight: 700, color: A.text }}>{title}</h2>
      </div>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {children}
      </div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: A.textMid, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</label>
      {hint && <p style={{ fontSize: 12, color: A.textMuted, marginBottom: 2 }}>{hint}</p>}
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        padding: '10px 14px', borderRadius: 10,
        border: `1.5px solid ${A.borderMid}`,
        fontSize: 14, color: A.text, outline: 'none',
        background: '#fff', transition: 'border-color 0.15s',
        width: '100%',
      }}
    />
  )
}

function Textarea({ value, onChange, rows = 4, placeholder }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      style={{
        padding: '10px 14px', borderRadius: 10,
        border: `1.5px solid ${A.borderMid}`,
        fontSize: 14, color: A.text, outline: 'none',
        background: '#fff', resize: 'vertical', lineHeight: 1.6,
        fontFamily: 'Pretendard, sans-serif', width: '100%',
      }}
    />
  )
}

export default function ContentPage() {
  const [form, setForm] = useState<Settings>({
    navTagline: '',
    heroTitle: '',
    aboutText: '',
    arenaSubtitle: '',
    footerTagline: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => {
        setForm({
          navTagline:    d.navTagline    ?? '',
          heroTitle:     d.heroTitle     ?? '',
          aboutText:     d.aboutText     ?? '',
          arenaSubtitle: d.arenaSubtitle ?? '',
          footerTagline: d.footerTagline ?? '',
        })
        setLoading(false)
      })
      .catch(e => { setErr(String(e)); setLoading(false) })
  }, [])

  const set = (k: keyof Settings) => (v: string) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    setSaving(true); setSaved(false); setErr('')
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500) }
    else setErr('Failed to save')
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div style={{ height: 28, width: 160, borderRadius: 8, background: A.border, marginBottom: 28, animation: 'pulse 1.4s ease-in-out infinite' }} />
        {[1,2,3].map(i => (
          <div key={i} style={{ background: A.card, borderRadius: 16, border: `1.5px solid ${A.border}`, marginBottom: 24, padding: 24 }}>
            <div style={{ height: 16, width: '40%', borderRadius: 6, background: A.border, marginBottom: 20, animation: 'pulse 1.4s ease-in-out infinite' }} />
            <div style={{ height: 40, borderRadius: 10, background: A.border, animation: 'pulse 1.4s ease-in-out infinite' }} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: KANIT, fontSize: 26, fontWeight: 700, color: A.text }}>Content</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {saved && <span style={{ fontSize: 13, color: A.green, fontWeight: 600 }}>Saved</span>}
          {err && <span style={{ fontSize: 13, color: A.red }}>{err}</span>}
          <button onClick={save} disabled={saving} style={{
            padding: '10px 24px', borderRadius: 48.5,
            background: A.yellow, border: 'none',
            fontFamily: KANIT, fontSize: 14, fontWeight: 700, color: A.yellowText,
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'Saving…' : 'Save All'}
          </button>
        </div>
      </div>

      <Section title="Nav Bar">
        <Field label="Top Tagline Strip" hint="Purple banner at top of every page">
          <Input value={form.navTagline} onChange={set('navTagline')} placeholder="The smallest sport on the internet." />
        </Field>
      </Section>

      <Section title="Hero Section">
        <Field label="Hero Title" hint="Main heading on the landing page">
          <Input value={form.heroTitle} onChange={set('heroTitle')} placeholder="Who Will Be The Hamstar?" />
        </Field>
      </Section>

      <Section title="About Section">
        <Field label="About Body Text" hint="Use \\n\\n for paragraph breaks, \\n for line breaks">
          <Textarea value={form.aboutText} onChange={set('aboutText')} rows={7} placeholder="Hamstar is a tiny internet sport..." />
        </Field>
      </Section>

      <Section title="Hamstar Arena Section">
        <Field label="Arena Subtitle" hint="Shown below the 'Hamstar Arena' heading on the landing page">
          <Input value={form.arenaSubtitle} onChange={set('arenaSubtitle')} placeholder="Hamstar races are streamed live on Pump.fun..." />
        </Field>
      </Section>

      <Section title="Footer">
        <Field label="Footer Tagline" hint="Tagline shown in the site footer">
          <Input value={form.footerTagline} onChange={set('footerTagline')} placeholder="The smallest sport on the internet." />
        </Field>
      </Section>
    </div>
  )
}
