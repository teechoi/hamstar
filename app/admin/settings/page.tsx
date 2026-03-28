'use client'
import { useEffect, useState } from 'react'
import { A } from '../theme'

const KANIT = "var(--font-kanit), sans-serif"

interface Settings {
  raceNumber: number; isLive: boolean; streamUrl: string; replayUrl: string
  twitterUrl: string; tiktokUrl: string; instagramUrl: string; youtubeUrl: string
  sponsorEmail: string; siteName: string; tagline: string; ogImageUrl: string
  buttonLabels: Record<string, string>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: A.card, borderRadius: 16, border: `1.5px solid ${A.border}`, marginBottom: 24, overflow: 'hidden' }}>
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
      {hint && <p style={{ fontSize: 12, color: A.textMuted }}>{hint}</p>}
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text' }: { value: string | number; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${A.borderMid}`, fontSize: 14, color: A.text, outline: 'none', background: '#fff', width: '100%' }} />
  )
}

const DEFAULT: Settings = {
  raceNumber: 1, isLive: false, streamUrl: '', replayUrl: '',
  twitterUrl: '', tiktokUrl: '', instagramUrl: '', youtubeUrl: '',
  sponsorEmail: '', siteName: 'Hamstar', tagline: '', ogImageUrl: '',
  buttonLabels: {},
}

export default function SettingsPage() {
  const [form, setForm] = useState<Settings>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => {
        setForm({
          raceNumber:   d.raceNumber   ?? 1,
          isLive:       d.isLive       ?? false,
          streamUrl:    d.streamUrl    ?? '',
          replayUrl:    d.replayUrl    ?? '',
          twitterUrl:   d.twitterUrl   ?? '',
          tiktokUrl:    d.tiktokUrl    ?? '',
          instagramUrl: d.instagramUrl ?? '',
          youtubeUrl:   d.youtubeUrl   ?? '',
          sponsorEmail: d.sponsorEmail ?? '',
          siteName:     d.siteName     ?? 'Hamstar',
          tagline:      d.tagline      ?? '',
          ogImageUrl:   d.ogImageUrl   ?? '',
          buttonLabels: typeof d.buttonLabels === 'object' ? d.buttonLabels : {},
        })
        setLoading(false)
      })
      .catch(e => { setErr(String(e)); setLoading(false) })
  }, [])

  const set = (k: keyof Settings) => (v: string | number | boolean) => setForm(f => ({ ...f, [k]: v }))

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

  if (loading) return (
    <div className="admin-page">
      {[1,2,3,4].map(i => (
        <div key={i} style={{ background: A.card, borderRadius: 16, border: `1.5px solid ${A.border}`, height: 160, marginBottom: 24, animation: 'pulse 1.4s ease-in-out infinite' }} />
      ))}
    </div>
  )

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: KANIT, fontSize: 26, fontWeight: 700, color: A.text }}>Settings</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {saved && <span style={{ fontSize: 13, color: A.green, fontWeight: 600 }}>Saved</span>}
          {err && <span style={{ fontSize: 13, color: A.red }}>{err}</span>}
          <button onClick={save} disabled={saving} style={{
            padding: '10px 24px', borderRadius: 48.5, background: A.yellow, border: 'none',
            fontFamily: KANIT, fontSize: 14, fontWeight: 700, color: A.yellowText,
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'Saving…' : 'Save All'}
          </button>
        </div>
      </div>

      <Section title="Race">
        <div className="admin-2col">
          <Field label="Race Number">
            <Input type="number" value={form.raceNumber} onChange={v => set('raceNumber')(Number(v))} />
          </Field>
          <Field label="Stream URL">
            <Input value={form.streamUrl} onChange={set('streamUrl')} placeholder="https://pump.fun/..." />
          </Field>
        </div>
        <Field label="Replay URL">
          <Input value={form.replayUrl} onChange={set('replayUrl')} placeholder="https://..." />
        </Field>
        <Field label="Live Override">
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isLive} onChange={e => set('isLive')(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: A.purple }} />
            <span style={{ fontSize: 14, color: A.text }}>Force live status on</span>
          </label>
        </Field>
      </Section>

      <Section title="Site Identity">
        <div className="admin-2col">
          <Field label="Site Name">
            <Input value={form.siteName} onChange={set('siteName')} />
          </Field>
          <Field label="Sponsor Contact Email">
            <Input type="email" value={form.sponsorEmail} onChange={set('sponsorEmail')} placeholder="sponsors@..." />
          </Field>
        </div>
        <Field label="Meta Tagline" hint="Used in page <title> and meta description">
          <Input value={form.tagline} onChange={set('tagline')} />
        </Field>
        <Field label="OG Image URL" hint="Social share preview image">
          <Input value={form.ogImageUrl} onChange={set('ogImageUrl')} placeholder="https://..." />
        </Field>
      </Section>

      <Section title="Social Links">
        <div className="admin-2col">
          <Field label="Twitter / X"><Input value={form.twitterUrl} onChange={set('twitterUrl')} placeholder="https://x.com/..." /></Field>
          <Field label="TikTok"><Input value={form.tiktokUrl} onChange={set('tiktokUrl')} placeholder="https://tiktok.com/..." /></Field>
          <Field label="Instagram"><Input value={form.instagramUrl} onChange={set('instagramUrl')} placeholder="https://instagram.com/..." /></Field>
          <Field label="YouTube"><Input value={form.youtubeUrl} onChange={set('youtubeUrl')} placeholder="https://youtube.com/..." /></Field>
        </div>
      </Section>

      <Section title="Button Labels">
        {[
          ['watchLive',      'Watch Live button'],
          ['watchUpcoming',  'Watch Upcoming button'],
          ['raceHistory',    'Race History button'],
          ['arenasNotify',   'Arenas Notify button'],
          ['sponsorCta',     'Sponsor CTA button'],
        ].map(([key, label]) => (
          <Field key={key} label={label}>
            <Input
              value={form.buttonLabels[key] ?? ''}
              onChange={v => setForm(f => ({ ...f, buttonLabels: { ...f.buttonLabels, [key]: v } }))}
              placeholder={label}
            />
          </Field>
        ))}
      </Section>
    </div>
  )
}
