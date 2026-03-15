'use client'
import { useState } from 'react'
import { T, LimeButton } from '@/components/ui'

type Settings = {
  raceNumber: number; isLive: boolean; streamUrl: string; replayUrl: string | null
  twitterUrl: string | null; tiktokUrl: string | null; instagramUrl: string | null; youtubeUrl: string | null
  sponsorEmail: string; siteName: string; tagline: string; ogImageUrl: string | null
  buttonLabels: Record<string, string>
}

const DEFAULT_BUTTON_LABELS: Record<string, string> = {
  watchLive: '▶ Watch Live Now',
  watchUpcoming: '🔔 View on pump.fun',
  raceHistory: '📋 Race History',
  arenasNotify: 'Notify Me →',
  sponsorCta: 'Get in Touch →',
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${T.border}` }}>
      <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{label}</span>
      <button onClick={() => onChange(!value)} style={{
        width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
        background: value ? T.lime : T.border, position: 'relative', transition: 'background 0.2s',
      }}>
        <span style={{
          position: 'absolute', top: 3, left: value ? 24 : 3,
          width: 20, height: 20, borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s', display: 'block',
        }} />
      </button>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{label}</label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', padding: '10px 12px', border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 13, color: T.text, fontFamily: 'inherit', outline: 'none', background: T.bg }}
      />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: T.card, border: `2px solid ${T.border}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>{title}</div>
      {children}
    </div>
  )
}

export function SettingsForm({ initialSettings }: { initialSettings: Settings }) {
  const [settings, setSettings] = useState<Settings>(initialSettings)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [buttonLabels, setButtonLabels] = useState<Record<string, string>>(
    { ...DEFAULT_BUTTON_LABELS, ...(initialSettings.buttonLabels ?? {}) }
  )

  const update = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }))

  const save = async () => {
    setSaving(true)
    await fetch('/api/admin/settings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...settings, buttonLabels }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="admin-page" style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: T.text }}>Site Settings</div>
          <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>Changes save to the database and go live immediately</div>
        </div>
        <LimeButton onClick={save}>{saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save All Changes'}</LimeButton>
      </div>

      <Section title="Race Settings">
        <Toggle label="Race is LIVE" value={settings.isLive} onChange={(v) => update({ isLive: v })} />
        <div style={{ height: 16 }} />
        <Field label="Current Race Number" value={String(settings.raceNumber)} onChange={(v) => update({ raceNumber: parseInt(v) || 1 })} />
        <Field label="Stream URL" value={settings.streamUrl} onChange={(v) => update({ streamUrl: v })} placeholder="https://pump.fun/..." />
        <Field label="Replay URL (optional)" value={settings.replayUrl ?? ''} onChange={(v) => update({ replayUrl: v || null })} placeholder="https://youtube.com/watch?v=..." />
      </Section>

      <Section title="Social Links">
        <Field label="Twitter / X" value={settings.twitterUrl ?? ''} onChange={(v) => update({ twitterUrl: v || null })} placeholder="https://twitter.com/hamstar" />
        <Field label="TikTok" value={settings.tiktokUrl ?? ''} onChange={(v) => update({ tiktokUrl: v || null })} placeholder="https://tiktok.com/@hamstar" />
        <Field label="Instagram" value={settings.instagramUrl ?? ''} onChange={(v) => update({ instagramUrl: v || null })} placeholder="https://instagram.com/hamstar" />
        <Field label="YouTube" value={settings.youtubeUrl ?? ''} onChange={(v) => update({ youtubeUrl: v || null })} placeholder="https://youtube.com/@hamstar" />
      </Section>

      <Section title="Button Labels & CTAs">
        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>Change any button text across the entire site without touching code.</div>
        {Object.entries(buttonLabels).map(([key, val]) => (
          <Field
            key={key}
            label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
            value={val}
            onChange={(v) => setButtonLabels((b) => ({ ...b, [key]: v }))}
          />
        ))}
      </Section>

      <Section title="General">
        <Field label="Site Name" value={settings.siteName} onChange={(v) => update({ siteName: v })} />
        <Field label="Tagline" value={settings.tagline} onChange={(v) => update({ tagline: v })} />
        <Field label="Sponsor Contact Email" value={settings.sponsorEmail} onChange={(v) => update({ sponsorEmail: v })} type="email" />
        <Field label="OG Image URL" value={settings.ogImageUrl ?? ''} onChange={(v) => update({ ogImageUrl: v || null })} placeholder="https://..." />
      </Section>
    </div>
  )
}
