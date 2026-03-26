'use client'
import { useState } from 'react'
import { A } from '../theme'

type Settings = {
  raceNumber: number; isLive: boolean; streamUrl: string; replayUrl: string | null
  twitterUrl: string | null; tiktokUrl: string | null; instagramUrl: string | null; youtubeUrl: string | null
  sponsorEmail: string; siteName: string; tagline: string; ogImageUrl: string | null
  buttonLabels: Record<string, string>
}

const DEFAULT_BTNS: Record<string, string> = {
  watchLive: '▶ Watch Live Now',
  watchUpcoming: '🔔 View on pump.fun',
  raceHistory: '📋 Race History',
  arenasNotify: 'Notify Me →',
  sponsorCta: 'Get in Touch →',
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${A.border}` }}>
      <span style={{ fontSize: 13, color: A.textMid, fontWeight: 600 }}>{label}</span>
      <button onClick={() => onChange(!value)} style={{
        width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
        background: value ? A.gold : A.border, position: 'relative', transition: 'background 0.2s',
      }}>
        <span style={{ position: 'absolute', top: 3, left: value ? 24 : 3, width: 20, height: 20, borderRadius: '50%', background: value ? A.goldText : '#fff', transition: 'left 0.2s', display: 'block' }} />
      </button>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '10px 14px', background: A.inputBg, border: `1px solid ${A.border}`, borderRadius: 8, fontSize: 13, color: A.text, outline: 'none', fontFamily: 'inherit' }}
      />
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>{title}</div>
      {children}
    </div>
  )
}

export function SettingsForm({ initialSettings }: { initialSettings: Settings }) {
  const [s,      setS]      = useState<Settings>(initialSettings)
  const [btns,   setBtns]   = useState({ ...DEFAULT_BTNS, ...initialSettings.buttonLabels })
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  const upd = (patch: Partial<Settings>) => setS(prev => ({ ...prev, ...patch }))

  const save = async () => {
    setSaving(true)
    await fetch('/api/admin/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...s, buttonLabels: btns }) })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="admin-page" style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: A.text }}>Settings</div>
          <div style={{ fontSize: 13, color: A.textMuted, marginTop: 4 }}>Changes go live immediately after saving</div>
        </div>
        <button onClick={save} disabled={saving} style={{ padding: '11px 28px', background: A.gold, border: 'none', borderRadius: 12, color: A.goldText, fontSize: 14, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' }}>
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save All'}
        </button>
      </div>

      <Card title="Race">
        <Toggle label="Race is LIVE" value={s.isLive} onChange={v => upd({ isLive: v })} />
        <div style={{ height: 16 }} />
        <Field label="Current Race Number" value={String(s.raceNumber)} onChange={v => upd({ raceNumber: parseInt(v) || 1 })} />
        <Field label="Stream URL"         value={s.streamUrl}     onChange={v => upd({ streamUrl: v })}     placeholder="https://pump.fun/..." />
        <Field label="Replay URL"         value={s.replayUrl ?? ''} onChange={v => upd({ replayUrl: v || null })} placeholder="https://youtube.com/watch?v=..." />
      </Card>

      <Card title="Social Links">
        <Field label="Twitter / X" value={s.twitterUrl ?? ''}   onChange={v => upd({ twitterUrl: v || null })}   placeholder="https://twitter.com/hamstar" />
        <Field label="TikTok"      value={s.tiktokUrl ?? ''}    onChange={v => upd({ tiktokUrl: v || null })}    placeholder="https://tiktok.com/@hamstar" />
        <Field label="Instagram"   value={s.instagramUrl ?? ''} onChange={v => upd({ instagramUrl: v || null })} placeholder="https://instagram.com/hamstar" />
        <Field label="YouTube"     value={s.youtubeUrl ?? ''}   onChange={v => upd({ youtubeUrl: v || null })}   placeholder="https://youtube.com/@hamstar" />
      </Card>

      <Card title="Button Labels">
        <div style={{ fontSize: 12, color: A.textMuted, marginBottom: 16 }}>Change button text across the site without touching code.</div>
        {Object.entries(btns).map(([key, val]) => (
          <Field key={key}
            label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
            value={val}
            onChange={v => setBtns(b => ({ ...b, [key]: v }))}
          />
        ))}
      </Card>

      <Card title="General">
        <Field label="Site Name"            value={s.siteName}          onChange={v => upd({ siteName: v })} />
        <Field label="Tagline"              value={s.tagline}           onChange={v => upd({ tagline: v })} />
        <Field label="Sponsor Contact Email" value={s.sponsorEmail}     onChange={v => upd({ sponsorEmail: v })} type="email" />
        <Field label="OG Image URL"         value={s.ogImageUrl ?? ''} onChange={v => upd({ ogImageUrl: v || null })} placeholder="https://..." />
      </Card>
    </div>
  )
}
