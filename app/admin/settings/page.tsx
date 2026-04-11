'use client'
import { useEffect, useState } from 'react'
import { A } from '../theme'

const KANIT = "var(--font-kanit), sans-serif"

interface Settings {
  raceNumber: number; isLive: boolean; streamUrl: string; replayUrl: string
  twitterUrl: string; tiktokUrl: string; instagramUrl: string; youtubeUrl: string
  sponsorEmail: string; siteName: string; tagline: string; ogImageUrl: string
  buttonLabels: Record<string, string>
  hamstarMint: string; hamstarPoolAddress: string
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
  hamstarMint: 'HAMSTARxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  hamstarPoolAddress: 'POOLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
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
          raceNumber:         d.raceNumber         ?? 1,
          isLive:             d.isLive             ?? false,
          streamUrl:          d.streamUrl          ?? '',
          replayUrl:          d.replayUrl          ?? '',
          twitterUrl:         d.twitterUrl         ?? '',
          tiktokUrl:          d.tiktokUrl          ?? '',
          instagramUrl:       d.instagramUrl       ?? '',
          youtubeUrl:         d.youtubeUrl         ?? '',
          sponsorEmail:       d.sponsorEmail       ?? '',
          siteName:           d.siteName           ?? 'Hamstar',
          tagline:            d.tagline            ?? '',
          ogImageUrl:         d.ogImageUrl         ?? '',
          buttonLabels:       typeof d.buttonLabels === 'object' ? d.buttonLabels : {},
          hamstarMint:        d.hamstarMint        ?? 'HAMSTARxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          hamstarPoolAddress: d.hamstarPoolAddress ?? 'POOLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
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

      <TokenSection
        form={form}
        set={set}
      />
    </div>
  )
}

function TokenSection({ form, set }: { form: Settings; set: (k: keyof Settings) => (v: string) => void }) {
  const PROGRAM_ID = '7VumdroGjCGoY8skLuATZY6U7uMJeiE6fRaewdXLSVwQ'
  const [copied, setCopied] = useState<string | null>(null)

  const copy = (val: string, key: string) => {
    navigator.clipboard.writeText(val)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  const mintLaunched = form.hamstarMint && !form.hamstarMint.includes('xxx')
  const poolReady    = form.hamstarPoolAddress && !form.hamstarPoolAddress.includes('xxx')
  const tokenLive    = mintLaunched && poolReady

  return (
    <div id="token" style={{ background: A.card, borderRadius: 16, border: `1.5px solid ${A.border}`, marginBottom: 24, overflow: 'hidden' }}>
      <div style={{ padding: '18px 24px', borderBottom: `1px solid ${A.border}`, background: A.pageBg, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontFamily: KANIT, fontSize: 15, fontWeight: 700, color: A.text }}>$HAMSTAR Token Config</h2>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
          background: tokenLive ? A.greenSoft : A.yellowSoft,
          color: tokenLive ? A.green : '#7a6a00',
        }}>
          {tokenLive ? '● LIVE' : '○ PRE-LAUNCH'}
        </span>
      </div>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Status summary */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: 'Mint set',       ok: mintLaunched },
            { label: 'Pool set',       ok: poolReady    },
            { label: 'On-chain cheers', ok: tokenLive   },
          ].map(({ label, ok }) => (
            <span key={label} style={{
              fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 99,
              background: ok ? A.greenSoft : A.redSoft,
              color: ok ? A.green : A.red,
            }}>
              {ok ? '✓' : '✗'} {label}
            </span>
          ))}
        </div>

        {/* Token Mint */}
        <Field
          label="HAMSTAR Token Mint"
          hint="SPL token mint address. Replace the placeholder with the real mint address once deployed."
        >
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={form.hamstarMint}
              onChange={e => set('hamstarMint')(e.target.value)}
              placeholder="Base58 mint address…"
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 10,
                border: `1.5px solid ${mintLaunched ? 'rgba(0,197,102,0.4)' : A.borderMid}`,
                fontSize: 13, color: A.text, background: '#fff', outline: 'none',
                fontFamily: 'monospace',
              }}
            />
            {form.hamstarMint && (
              <button onClick={() => copy(form.hamstarMint, 'mint')} style={{
                padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${A.borderMid}`,
                background: copied === 'mint' ? A.greenSoft : '#fff', cursor: 'pointer',
                fontSize: 12, fontWeight: 700, color: copied === 'mint' ? A.green : A.textMuted, flexShrink: 0,
              }}>
                {copied === 'mint' ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
        </Field>

        {/* Pool Address */}
        <Field
          label="Race Pool Address"
          hint="The wallet or PDA that receives cheered HAMSTAR and distributes payouts to winners. Its HAMSTAR ATA must be pre-created before cheering opens."
        >
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={form.hamstarPoolAddress}
              onChange={e => set('hamstarPoolAddress')(e.target.value)}
              placeholder="Base58 pool address…"
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 10,
                border: `1.5px solid ${poolReady ? 'rgba(0,197,102,0.4)' : A.borderMid}`,
                fontSize: 13, color: A.text, background: '#fff', outline: 'none',
                fontFamily: 'monospace',
              }}
            />
            {form.hamstarPoolAddress && (
              <button onClick={() => copy(form.hamstarPoolAddress, 'pool')} style={{
                padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${A.borderMid}`,
                background: copied === 'pool' ? A.greenSoft : '#fff', cursor: 'pointer',
                fontSize: 12, fontWeight: 700, color: copied === 'pool' ? A.green : A.textMuted, flexShrink: 0,
              }}>
                {copied === 'pool' ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
        </Field>

        {/* Launch checklist */}
        {!tokenLive && (
          <div style={{ padding: '14px 16px', borderRadius: 10, background: A.yellowSoft, border: '1px solid rgba(255,200,0,0.3)' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#7a6a00', marginBottom: 8 }}>Launch checklist</p>
            <ol style={{ paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                'Deploy the $HAMSTAR SPL token and paste the mint address above',
                'Create a pool wallet or PDA and paste its address above',
                'Pre-create the pool\'s HAMSTAR ATA (one-time on-chain tx)',
                'Click "Save All" — on-chain cheers activate automatically',
                'Update HAMSTAR_MINT in lib/hamstar-token.ts to match (for SwapWidget)',
              ].map((step, i) => (
                <li key={i} style={{ fontSize: 12, color: '#7a6a00' }}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Read-only: Program ID + RPC */}
        <div style={{ borderTop: `1px solid ${A.border}`, paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Read-only (env vars)
          </p>
          {[
            { label: 'Program ID', value: PROGRAM_ID },
            { label: 'RPC Endpoint', value: process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? '(server-side Helius)' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: A.textMuted, minWidth: 100, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
              <span style={{ fontSize: 12, fontFamily: 'monospace', color: A.text, flex: 1, wordBreak: 'break-all' }}>{value}</span>
              <button onClick={() => copy(value, label)} style={{
                padding: '4px 10px', borderRadius: 6, border: `1px solid ${A.borderMid}`,
                background: copied === label ? A.greenSoft : '#fff', cursor: 'pointer',
                fontSize: 10, fontWeight: 700, color: copied === label ? A.green : A.textMuted, flexShrink: 0,
              }}>
                {copied === label ? '✓' : 'Copy'}
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
