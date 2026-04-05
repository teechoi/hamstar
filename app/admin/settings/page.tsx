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

      <SolanaSection />
    </div>
  )
}

function SolanaSection() {
  const PROGRAM_ID   = process.env.NEXT_PUBLIC_PROGRAM_ID ?? '7VumdroGjCGoY8skLuATZY6U7uMJeiE6fRaewdXLSVwQ'
  const [copied, setCopied] = useState<string | null>(null)

  const copy = (val: string, key: string) => {
    navigator.clipboard.writeText(val)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  function ReadonlyField({ label, value, hint }: { label: string; value: string; hint?: string }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: '#555555', textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</label>
        {hint && <p style={{ fontSize: 12, color: '#9A9A9A' }}>{hint}</p>}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E0E0E0', fontSize: 13, color: '#0D0D14', background: '#F8F9FA', fontFamily: 'monospace', wordBreak: 'break-all' }}>
            {value || '—'}
          </span>
          {value && (
            <button onClick={() => copy(value, label)} style={{
              padding: '8px 14px', borderRadius: 8, border: '1.5px solid #E0E0E0',
              background: copied === label ? 'rgba(0,197,102,0.10)' : '#fff',
              cursor: 'pointer', fontSize: 12, fontWeight: 700,
              color: copied === label ? '#00C566' : '#9A9A9A', flexShrink: 0,
            }}>
              {copied === label ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#ffffff', borderRadius: 16, border: '1.5px solid #F0F0F0', marginBottom: 24, overflow: 'hidden' }}>
      <div style={{ padding: '18px 24px', borderBottom: '1px solid #F0F0F0', background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontFamily: "var(--font-kanit), sans-serif", fontSize: 15, fontWeight: 700, color: '#0D0D14' }}>Solana & Program Config</h2>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'rgba(115,93,255,0.08)', color: '#735DFF' }}>READ-ONLY</span>
      </div>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <p style={{ fontSize: 13, color: '#9A9A9A', marginBottom: 4 }}>
          These values are set via environment variables at deploy time. To change them, update your env vars and redeploy.
        </p>
        <ReadonlyField
          label="Program ID"
          value={PROGRAM_ID}
          hint="The deployed Anchor program address on Solana"
        />
        <ReadonlyField
          label="HAMSTAR Token Mint"
          value={process.env.NEXT_PUBLIC_HAMSTAR_MINT ?? ''}
          hint="SPL token mint address for HAMSTAR (set NEXT_PUBLIC_HAMSTAR_MINT)"
        />
        <ReadonlyField
          label="Treasury Wallet"
          value={process.env.NEXT_PUBLIC_TREASURY_WALLET ?? ''}
          hint="Platform treasury wallet (set NEXT_PUBLIC_TREASURY_WALLET)"
        />
        <ReadonlyField
          label="RPC Endpoint"
          value={process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? 'Using Helius (server-side only)'}
          hint="Solana RPC URL used for on-chain reads"
        />
        <div style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,231,144,0.20)', border: '1px solid rgba(255,231,144,0.6)' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#8a6a00', marginBottom: 4 }}>Upset Reserve PDA</p>
          <p style={{ fontSize: 12, color: '#8a6a00' }}>
            Derived from seeds: <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 6px', borderRadius: 4 }}>[&quot;upset_reserve&quot;]</code> + Program ID.
            View live balance in the <a href="/admin/wallet" style={{ color: '#735DFF', fontWeight: 700, textDecoration: 'none' }}>Wallet page</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
