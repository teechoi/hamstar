'use client'
import { useEffect, useState } from 'react'
import { A } from '../theme'

const KANIT = "var(--font-kanit), sans-serif"

interface Step {
  num: number
  title: string
  body: string
  image: string
  badge?: { text: string; color: string } | null
  note?: string | null
  cta: string
}

interface Settings {
  navTagline: string
  heroTitle: string
  heroSubtitle: string
  heroCtaTag: string
  heroButtonText: string
  racersTitle: string
  aboutTitle: string
  aboutText: string
  arenaTitle: string
  arenaSubtitle: string
  arenaStreamNote: string
  footerBrandDesc: string
  footerTaglineRight: string
  footerTagline: string
  loginTitle: string
  loginSubtitle: string
  termsButtonText: string
  howitWorksSteps: Step[]
}

const DEFAULT_STEPS: Step[] = [
  { num: 1, title: 'Pick Your Hamster',       body: 'Choose the racer you believe will win.\nEach race features three hamsters.',                       image: '/images/carousel-pick-hamster.png', badge: { text: 'Support me!', color: '#735DFF' }, note: null, cta: 'Next' },
  { num: 2, title: 'Join The Race Round',      body: 'Join the race round before the countdown ends.\nEach hamster gathers supporters into their pool.',  image: '/images/carousel-join-race.png',    badge: null, note: null, cta: 'Next' },
  { num: 3, title: 'Watch The Live Race',      body: 'The race is streamed live on Pump.fun.\nWatch the hamsters compete in real time',                  image: '/images/carousel-watch-race.png',   badge: null, note: '*Races are streamed externally on Pump.fun.', cta: 'Next' },
  { num: 4, title: 'Champion Takes The Wheel', body: 'The winning hamster takes the wheel.\nSupporters of the champion share the reward pool.',         image: '/images/carousel-champion.png',     badge: null, note: null, cta: 'Enter The Arena' },
]

const EMPTY: Settings = {
  navTagline: '', heroTitle: '', heroSubtitle: '', heroCtaTag: '', heroButtonText: '',
  racersTitle: '', aboutTitle: '', aboutText: '',
  arenaTitle: '', arenaSubtitle: '', arenaStreamNote: '',
  footerBrandDesc: '', footerTaglineRight: '', footerTagline: '',
  loginTitle: '', loginSubtitle: '', termsButtonText: '',
  howitWorksSteps: DEFAULT_STEPS,
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
      style={{ padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${A.borderMid}`, fontSize: 14, color: A.text, outline: 'none', background: '#fff', width: '100%' }}
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
      style={{ padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${A.borderMid}`, fontSize: 14, color: A.text, outline: 'none', background: '#fff', resize: 'vertical', lineHeight: 1.6, fontFamily: 'Pretendard, sans-serif', width: '100%' }}
    />
  )
}

function StepEditor({ step, onChange }: { step: Step; onChange: (s: Step) => void }) {
  const set = (k: keyof Step) => (v: string) => onChange({ ...step, [k]: v })
  return (
    <div style={{ background: A.pageBg, borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, border: `1px solid ${A.border}` }}>
      <p style={{ fontFamily: KANIT, fontSize: 13, fontWeight: 700, color: A.textMid, margin: 0 }}>Step {step.num}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Title">
          <Input value={step.title} onChange={set('title')} placeholder="Step title" />
        </Field>
        <Field label="CTA Button">
          <Input value={step.cta} onChange={set('cta')} placeholder="Next" />
        </Field>
      </div>
      <Field label="Body" hint="Use \\n for line breaks">
        <Textarea value={step.body} onChange={set('body')} rows={2} placeholder="Step description" />
      </Field>
      <Field label="Note" hint="Small disclaimer text below body (optional)">
        <Input value={step.note ?? ''} onChange={v => onChange({ ...step, note: v || null })} placeholder="Optional footnote" />
      </Field>
    </div>
  )
}

export default function ContentPage() {
  const [form, setForm] = useState<Settings>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => {
        setForm({
          navTagline:       d.navTagline       ?? '',
          heroTitle:        d.heroTitle        ?? '',
          heroSubtitle:     d.heroSubtitle     ?? '',
          heroCtaTag:       d.heroCtaTag       ?? '',
          heroButtonText:   d.heroButtonText   ?? '',
          racersTitle:      d.racersTitle      ?? '',
          aboutTitle:       d.aboutTitle       ?? '',
          aboutText:        d.aboutText        ?? '',
          arenaTitle:       d.arenaTitle       ?? '',
          arenaSubtitle:    d.arenaSubtitle    ?? '',
          arenaStreamNote:  d.arenaStreamNote  ?? '',
          footerBrandDesc:  d.footerBrandDesc  ?? '',
          footerTaglineRight: d.footerTaglineRight ?? '',
          footerTagline:    d.footerTagline    ?? '',
          loginTitle:       d.loginTitle       ?? '',
          loginSubtitle:    d.loginSubtitle    ?? '',
          termsButtonText:  d.termsButtonText  ?? '',
          howitWorksSteps:  Array.isArray(d.howitWorksSteps) && d.howitWorksSteps.length > 0
            ? d.howitWorksSteps
            : DEFAULT_STEPS,
        })
        setLoading(false)
      })
      .catch(e => { setErr(String(e)); setLoading(false) })
  }, [])

  const set = (k: keyof Settings) => (v: string) => setForm(f => ({ ...f, [k]: v }))

  const setStep = (i: number) => (s: Step) => setForm(f => {
    const steps = [...f.howitWorksSteps]
    steps[i] = s
    return { ...f, howitWorksSteps: steps }
  })

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
        {[1,2,3,4].map(i => (
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
        <Field label="Tagline Strip" hint="Purple banner shown at the top of every page">
          <Input value={form.navTagline} onChange={set('navTagline')} placeholder="The smallest sport on the internet." />
        </Field>
      </Section>

      <Section title="Hero Section">
        <Field label="Main Title" hint="Large heading on the black hero section">
          <Input value={form.heroTitle} onChange={set('heroTitle')} placeholder="Who Will Be The Hamstar?" />
        </Field>
        <Field label="Subtitle" hint="Yellow text below the title">
          <Input value={form.heroSubtitle} onChange={set('heroSubtitle')} placeholder="Three hamsters race. One takes the wheel." />
        </Field>
        <div className="admin-2col">
          <Field label="CTA Tag" hint="Small grey text above the button">
            <Input value={form.heroCtaTag} onChange={set('heroCtaTag')} placeholder="Round 1 Coming Soon!" />
          </Field>
          <Field label="CTA Button Text">
            <Input value={form.heroButtonText} onChange={set('heroButtonText')} placeholder="Watch Live Race" />
          </Field>
        </div>
      </Section>

      <Section title="Meet the Racers">
        <Field label="Section Title">
          <Input value={form.racersTitle} onChange={set('racersTitle')} placeholder="Meet the Racers" />
        </Field>
      </Section>

      <Section title="About Section">
        <Field label="Section Title">
          <Input value={form.aboutTitle} onChange={set('aboutTitle')} placeholder="About Hamstar" />
        </Field>
        <Field label="Body Text" hint="Use \\n\\n for paragraph breaks">
          <Textarea value={form.aboutText} onChange={set('aboutText')} rows={6} placeholder="Hamstar is a tiny internet sport…" />
        </Field>
      </Section>

      <Section title="Hamstar Arena Section">
        <Field label="Section Title">
          <Input value={form.arenaTitle} onChange={set('arenaTitle')} placeholder="Hamstar Arena" />
        </Field>
        <Field label="Subtitle" hint="Shown below the title">
          <Input value={form.arenaSubtitle} onChange={set('arenaSubtitle')} placeholder="Hamstar races are streamed live on Pump.fun…" />
        </Field>
        <Field label="Stream Note" hint="Small text inside the countdown card">
          <Input value={form.arenaStreamNote} onChange={set('arenaStreamNote')} placeholder="Race will be streamed live on Pump.fun" />
        </Field>
      </Section>

      <Section title="Footer">
        <Field label="Brand Description" hint="Text below the Hamstar logo in the footer">
          <Input value={form.footerBrandDesc} onChange={set('footerBrandDesc')} placeholder="Live hamster racing powered by community participation" />
        </Field>
        <Field label="Right Tagline" hint="Large text on the right side of the footer (use \\n for line breaks)">
          <Textarea value={form.footerTaglineRight} onChange={set('footerTaglineRight')} rows={3} placeholder={'Real hamsters.\nReal races.\nOne tiny champion.'} />
        </Field>
        <Field label="Footer Tagline" hint="Tagline used in meta and other footer references">
          <Input value={form.footerTagline} onChange={set('footerTagline')} placeholder="The smallest sport on the internet." />
        </Field>
      </Section>

      <Section title="Login Modal">
        <Field label="Title">
          <Input value={form.loginTitle} onChange={set('loginTitle')} placeholder="Welcome to Hamstar Arena" />
        </Field>
        <Field label="Subtitle">
          <Input value={form.loginSubtitle} onChange={set('loginSubtitle')} placeholder="A live-streamed blockchain-based entertainment experience" />
        </Field>
      </Section>

      <Section title="Terms Modal">
        <Field label="Accept Button Text">
          <Input value={form.termsButtonText} onChange={set('termsButtonText')} placeholder="I Understand & Enter Arena" />
        </Field>
      </Section>

      <Section title="How It Works — Steps">
        <p style={{ fontSize: 13, color: A.textMuted, margin: 0 }}>Edit the text for each step in the How It Works carousel. Images are managed via file upload.</p>
        {form.howitWorksSteps.map((step, i) => (
          <StepEditor key={step.num} step={step} onChange={setStep(i)} />
        ))}
      </Section>
    </div>
  )
}
