'use client'
import { useEffect, useState, useCallback } from 'react'
import { A } from '../theme'

export const dynamic = 'force-dynamic'

const KANIT = "var(--font-kanit), sans-serif"
const MONO  = 'monospace'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OnChainConfig {
  initialized:           boolean
  configAddress?:        string
  admin?:                string
  treasury?:             string
  hamstarMint?:          string
  feeBps:                number
  burnBps:               number
  minCheerAmount:        string   // BigInt serialized as string
  timeWeightMaxBps:      number
  timeWeightMinBps:      number
  maxPoolShareBps:       number
  upsetReserveBps:       number
  darkHorseThresholdBps: number
  darkHorseBonusBps:     number
  streakTwoBonusBps:     number
  streakThreeBonusBps:   number
  treasuryBps:           number
}

// ─── Helper: bps ↔ percent string ─────────────────────────────────────────────
const bpsToPercent   = (bps: number)    => (bps / 100).toFixed(2)
const percentToBps   = (pct: string)    => Math.round(parseFloat(pct) * 100)
const bpsToMult      = (bps: number)    => (bps / 1000).toFixed(3)
const multToBps      = (m: string)      => Math.round(parseFloat(m) * 1000)
const rawToUi        = (raw: string, dec = 9) => (Number(raw) / 10 ** dec).toLocaleString()
const uiToRaw        = (ui: string, dec = 9)  => BigInt(Math.round(parseFloat(ui) * 10 ** dec))

// ─── UI Components ────────────────────────────────────────────────────────────

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: A.card, borderRadius: 16, border: `1.5px solid ${A.border}`, marginBottom: 20, overflow: 'hidden' }}>
      <div style={{ padding: '16px 24px', borderBottom: `1px solid ${A.border}`, background: A.pageBg }}>
        <h2 style={{ fontFamily: KANIT, fontSize: 15, fontWeight: 700, color: A.text, marginBottom: subtitle ? 3 : 0 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 12, color: A.textMuted, margin: 0 }}>{subtitle}</p>}
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  )
}

function Field({
  label, hint, value, onChange, suffix, type = 'text',
}: {
  label: string; hint?: string; value: string
  onChange: (v: string) => void
  suffix?: string; type?: string
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: A.textMid, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          step="any"
          style={{
            flex: 1, padding: '9px 14px',
            border: `1.5px solid ${A.borderMid}`,
            borderRadius: 10, fontSize: 14, fontFamily: MONO,
            outline: 'none', background: '#fff', color: A.text,
          }}
        />
        {suffix && <span style={{ fontSize: 13, color: A.textMuted, whiteSpace: 'nowrap' }}>{suffix}</span>}
      </div>
      {hint && <p style={{ fontSize: 11, color: A.textMuted, margin: '4px 0 0 2px' }}>{hint}</p>}
    </div>
  )
}

function SaveBtn({ onClick, saving, disabled, label = 'Save to Chain' }: { onClick: () => void; saving: boolean; disabled?: boolean; label?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || saving}
      style={{
        padding: '10px 28px', borderRadius: 48.5, border: 'none',
        background: disabled || saving ? A.border : A.purple,
        fontFamily: KANIT, fontSize: 14, fontWeight: 700,
        color: disabled || saving ? A.textMuted : '#fff',
        cursor: disabled || saving ? 'not-allowed' : 'pointer',
        opacity: saving ? 0.7 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      {saving ? 'Sending tx…' : label}
    </button>
  )
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '4px 12px',
      borderRadius: 99, letterSpacing: 0.5,
      background: ok ? A.greenSoft : A.redSoft,
      color:      ok ? A.green    : A.red,
    }}>{label}</span>
  )
}

function FeeBar({ feeBps, burnBps, upsetBps, treasuryBps }: { feeBps: number; burnBps: number; upsetBps: number; treasuryBps: number }) {
  if (feeBps === 0) return null
  const segments = [
    { label: 'Treasury', bps: treasuryBps, color: A.purple },
    { label: 'Burn',     bps: burnBps,     color: A.red     },
    { label: 'Reserve',  bps: upsetBps,    color: '#F59E0B' },
  ]
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: A.textMid, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Fee Split Preview</p>
      <div style={{ display: 'flex', height: 28, borderRadius: 8, overflow: 'hidden', border: `1px solid ${A.border}` }}>
        {segments.map(s => s.bps > 0 && (
          <div key={s.label} style={{ flex: s.bps, background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'flex 0.3s' }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', padding: '0 4px' }}>
              {s.label} {bpsToPercent(s.bps)}%
            </span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11, color: A.textMuted, marginTop: 6 }}>
        Total fee: <strong>{bpsToPercent(feeBps)}%</strong> — winners receive <strong>{(100 - feeBps / 100).toFixed(2)}%</strong> of the pool
      </p>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProgramConfigPage() {
  const [config,  setConfig]  = useState<OnChainConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  // Edit state — all stored as human-readable strings
  const [feePct,         setFeePct]         = useState('')
  const [burnPct,        setBurnPct]        = useState('')
  const [reservePct,     setReservePct]     = useState('')
  const [minCheerUi,     setMinCheerUi]     = useState('')
  const [whalePct,       setWhalePct]       = useState('')
  const [twMaxMult,      setTwMaxMult]      = useState('')
  const [twMinMult,      setTwMinMult]      = useState('')
  const [streak2Mult,    setStreak2Mult]    = useState('')
  const [streak3Mult,    setStreak3Mult]    = useState('')
  const [dhThreshPct,    setDhThreshPct]    = useState('')
  const [dhBonusPct,     setDhBonusPct]     = useState('')

  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; msg: string } | null>(null)

  // Derived fee preview
  const feeBpsPrev    = percentToBps(feePct)
  const burnBpsPrev   = percentToBps(burnPct)
  const reserveBpsPrev = percentToBps(reservePct)
  const treasuryBpsPrev = Math.max(0, feeBpsPrev - burnBpsPrev - reserveBpsPrev)
  const feeError = burnBpsPrev + reserveBpsPrev > feeBpsPrev
    ? 'Burn + Reserve cannot exceed total fee'
    : null

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch('/api/admin/program/config')
      if (!r.ok) throw new Error(await r.text())
      const d: OnChainConfig = await r.json()
      setConfig(d)
      if (d.initialized) {
        setFeePct(bpsToPercent(d.feeBps))
        setBurnPct(bpsToPercent(d.burnBps))
        setReservePct(bpsToPercent(d.upsetReserveBps))
        setMinCheerUi(rawToUi(d.minCheerAmount))
        setWhalePct(bpsToPercent(d.maxPoolShareBps))
        setTwMaxMult(bpsToMult(d.timeWeightMaxBps))
        setTwMinMult(bpsToMult(d.timeWeightMinBps))
        setStreak2Mult(bpsToMult(d.streakTwoBonusBps))
        setStreak3Mult(bpsToMult(d.streakThreeBonusBps))
        setDhThreshPct(bpsToPercent(d.darkHorseThresholdBps))
        setDhBonusPct(bpsToPercent(d.darkHorseBonusBps))
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const save = async () => {
    setSaving(true)
    setSaveMsg(null)
    try {
      const body = {
        feeBps:                percentToBps(feePct),
        burnBps:               percentToBps(burnPct),
        minCheerAmount:        uiToRaw(minCheerUi).toString(),
        timeWeightMaxBps:      multToBps(twMaxMult),
        timeWeightMinBps:      multToBps(twMinMult),
        maxPoolShareBps:       percentToBps(whalePct),
        upsetReserveBps:       percentToBps(reservePct),
        darkHorseThresholdBps: percentToBps(dhThreshPct),
        darkHorseBonusBps:     percentToBps(dhBonusPct),
        streakTwoBonusBps:     multToBps(streak2Mult),
        streakThreeBonusBps:   multToBps(streak3Mult),
      }
      const r = await fetch('/api/admin/program/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setSaveMsg({ ok: true, msg: `Saved on-chain — tx: ${d.sig}` })
      load()
    } catch (e) {
      setSaveMsg({ ok: false, msg: String(e) })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <p style={{ color: A.textMuted, fontSize: 14 }}>Loading on-chain config…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-page">
        <p style={{ color: A.red, fontSize: 14 }}>Error: {error}</p>
        <button onClick={load} style={{ marginTop: 12, padding: '8px 20px', borderRadius: 8, border: `1px solid ${A.border}`, background: A.card, cursor: 'pointer', fontSize: 13 }}>Retry</button>
      </div>
    )
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: KANIT, fontSize: 22, fontWeight: 800, color: A.text, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Program Config
          </h1>
          <p style={{ fontSize: 13, color: A.textMuted }}>
            All settings below are stored on-chain in the <code style={{ fontFamily: MONO, fontSize: 12, background: A.pageBg, padding: '2px 6px', borderRadius: 4 }}>ProgramConfig</code> PDA.
            Saving sends an <code style={{ fontFamily: MONO, fontSize: 12, background: A.pageBg, padding: '2px 6px', borderRadius: 4 }}>update_config</code> transaction signed by the admin keypair.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <StatusBadge ok={!!config?.initialized} label={config?.initialized ? 'Program Initialized' : 'Not Initialized'} />
          <button onClick={load} style={{ padding: '8px 18px', borderRadius: 48.5, border: `1.5px solid ${A.borderMid}`, background: A.card, cursor: 'pointer', fontSize: 13, color: A.textMid, fontFamily: KANIT, fontWeight: 700 }}>
            Refresh
          </button>
        </div>
      </div>

      {/* Read-only info row */}
      {config?.initialized && (
        <Section title="Program Addresses" subtitle="Read-only — set at initialize, not editable via update_config">
          {[
            { label: 'Config PDA',   value: config.configAddress },
            { label: 'Admin Wallet', value: config.admin },
            { label: 'Treasury',     value: config.treasury },
            { label: 'HAMSTAR Mint', value: config.hamstarMint },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4, padding: '10px 0', borderBottom: `1px solid ${A.border}` }}>
              <span style={{ fontSize: 13, color: A.textMid, fontWeight: 600, minWidth: 130, flexShrink: 0 }}>{label}</span>
              <span style={{ fontSize: 12, fontFamily: MONO, color: A.text, wordBreak: 'break-all', textAlign: 'right', flex: 1, minWidth: 0 }}>{value ?? '—'}</span>
            </div>
          ))}
        </Section>
      )}

      {/* Not initialized guard */}
      {!config?.initialized && (
        <div style={{ background: A.redSoft, border: `1px solid ${A.red}`, borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
          <p style={{ fontSize: 14, color: A.red, fontWeight: 600, margin: 0 }}>
            Program config account not found on-chain. Run <code>anchor deploy</code> and call <code>initialize</code> before editing fees.
          </p>
        </div>
      )}

      {config?.initialized && (
        <>
          {/* ── Fee Structure ── */}
          <Section
            title="Fee Structure"
            subtitle="All fees are deducted from the total cheer pool before winners are paid out"
          >
            <FeeBar
              feeBps={feeBpsPrev}
              burnBps={burnBpsPrev}
              upsetBps={reserveBpsPrev}
              treasuryBps={treasuryBpsPrev}
            />

            {feeError && (
              <p style={{ color: A.red, fontSize: 13, marginBottom: 16, fontWeight: 600 }}>⚠ {feeError}</p>
            )}

            <div className="admin-2col">
              <Field
                label="Total Platform Fee"
                hint="Percentage of the entire pool taken before payouts. On-chain: fee_bps"
                value={feePct}
                onChange={setFeePct}
                suffix="%"
                type="number"
              />
              <div style={{ background: A.purpleSoft, borderRadius: 12, padding: '14px 18px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: A.textMid, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Derived Treasury Cut</p>
                <p style={{ fontSize: 24, fontFamily: KANIT, fontWeight: 800, color: A.purple, margin: 0 }}>
                  {bpsToPercent(treasuryBpsPrev)}%
                </p>
                <p style={{ fontSize: 11, color: A.textMuted, marginTop: 4 }}>= Fee − Burn − Reserve</p>
              </div>
            </div>

            <div className="admin-2col">
              <Field
                label="Token Burn Portion"
                hint="Deflates supply on every race. On-chain: burn_bps"
                value={burnPct}
                onChange={setBurnPct}
                suffix="%"
                type="number"
              />
              <Field
                label="Upset Reserve Portion"
                hint="Funds the dark horse bonus pool. On-chain: upset_reserve_bps"
                value={reservePct}
                onChange={setReservePct}
                suffix="%"
                type="number"
              />
            </div>
          </Section>

          {/* ── Bet Limits ── */}
          <Section
            title="Bet Limits"
            subtitle="Controls minimum entry size and whale concentration cap"
          >
            <div className="admin-2col">
              <Field
                label="Minimum Cheer Amount"
                hint="Smallest allowed bet in HAMSTAR tokens (display units, not raw). On-chain: min_cheer_amount"
                value={minCheerUi}
                onChange={setMinCheerUi}
                suffix="HAMSTAR"
                type="number"
              />
              <Field
                label="Max Wallet Pool Share (Whale Cap)"
                hint="Single wallet cannot exceed this % of pool. Prevents domination. On-chain: max_pool_share_bps"
                value={whalePct}
                onChange={setWhalePct}
                suffix="%"
                type="number"
              />
            </div>
          </Section>

          {/* ── Time Weighting ── */}
          <Section
            title="Time-Weight Multipliers"
            subtitle="Early entry gets higher weight → proportionally larger payout. Weight decays linearly from max→min over the pick window."
          >
            <div className="admin-2col">
              <Field
                label="Early Entry Multiplier (max)"
                hint="Applied to the very first cheer placed. On-chain: time_weight_max_bps (1.5x = 1500)"
                value={twMaxMult}
                onChange={setTwMaxMult}
                suffix="×"
                type="number"
              />
              <Field
                label="Late Entry Multiplier (min)"
                hint="Applied to cheers placed at the last second. On-chain: time_weight_min_bps (1.0x = 1000)"
                value={twMinMult}
                onChange={setTwMinMult}
                suffix="×"
                type="number"
              />
            </div>
          </Section>

          {/* ── Streak Bonuses ── */}
          <Section
            title="Hot Streak Bonuses"
            subtitle="Extra weight bonus added on top of the time-weight for consecutive-race winners"
          >
            <div className="admin-2col">
              <Field
                label="2-Win Streak Bonus"
                hint="Added to time-weight for users on a 2-race win streak. 0.2x = 200bps. On-chain: streak_two_bonus_bps"
                value={streak2Mult}
                onChange={setStreak2Mult}
                suffix="×"
                type="number"
              />
              <Field
                label="3+ Win Streak Bonus"
                hint="Added to time-weight for 3+ consecutive wins. 0.4x = 400bps. On-chain: streak_three_bonus_bps"
                value={streak3Mult}
                onChange={setStreak3Mult}
                suffix="×"
                type="number"
              />
            </div>
          </Section>

          {/* ── Dark Horse ── */}
          <Section
            title="Dark Horse System"
            subtitle="Winners with low pre-race pool share receive a bonus payout from the upset reserve"
          >
            <div className="admin-2col">
              <Field
                label="Dark Horse Threshold"
                hint="A winner qualifies as dark horse if their hamster had < this% of the pool. On-chain: dark_horse_threshold_bps"
                value={dhThreshPct}
                onChange={setDhThreshPct}
                suffix="%"
                type="number"
              />
              <Field
                label="Dark Horse Bonus Payout"
                hint="Extra % on top of base reward, funded from upset reserve. 50% = 1.5x total. On-chain: dark_horse_bonus_bps"
                value={dhBonusPct}
                onChange={setDhBonusPct}
                suffix="%"
                type="number"
              />
            </div>
          </Section>

          {/* Save row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <SaveBtn onClick={save} saving={saving} disabled={!!feeError} />
            {saveMsg && (
              <p style={{ fontSize: 13, color: saveMsg.ok ? A.green : A.red, fontFamily: MONO, flex: 1, wordBreak: 'break-all', margin: 0 }}>
                {saveMsg.ok ? '✓ ' : '✗ '}{saveMsg.msg}
              </p>
            )}
          </div>

          {/* Current on-chain raw values */}
          <details style={{ marginTop: 24 }}>
            <summary style={{ cursor: 'pointer', fontSize: 12, fontWeight: 700, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, padding: '8px 0' }}>
              Raw On-Chain Values (basis points)
            </summary>
            <div style={{ background: A.pageBg, borderRadius: 12, padding: '16px 20px', marginTop: 8, fontFamily: MONO, fontSize: 12, lineHeight: 2 }}>
              {[
                ['fee_bps',                  config.feeBps],
                ['burn_bps',                 config.burnBps],
                ['upset_reserve_bps',        config.upsetReserveBps],
                ['treasury_bps (derived)',   config.treasuryBps],
                ['min_cheer_amount (raw)',   config.minCheerAmount],
                ['max_pool_share_bps',       config.maxPoolShareBps],
                ['time_weight_max_bps',      config.timeWeightMaxBps],
                ['time_weight_min_bps',      config.timeWeightMinBps],
                ['streak_two_bonus_bps',     config.streakTwoBonusBps],
                ['streak_three_bonus_bps',   config.streakThreeBonusBps],
                ['dark_horse_threshold_bps', config.darkHorseThresholdBps],
                ['dark_horse_bonus_bps',     config.darkHorseBonusBps],
              ].map(([k, v]) => (
                <div key={String(k)} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                  <span style={{ color: A.textMid }}>{String(k)}</span>
                  <span style={{ color: A.text, fontWeight: 700 }}>{String(v)}</span>
                </div>
              ))}
            </div>
          </details>
        </>
      )}
    </div>
  )
}
