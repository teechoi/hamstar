'use client'
import { useEffect, useState } from 'react'
import { A } from '../theme'

const KANIT = "var(--font-kanit), sans-serif"

interface WalletEntry {
  label: string
  address: string
  balanceSol: number | null
  type: string
  meta?: string
}

interface WalletData {
  wallets: WalletEntry[]
  programId: string
  rpcUrl: string
  currentRace: { id: string; number: number } | null
  tokenLaunched:      boolean
  hamstarMint:        string
  hamstarPoolAddress: string
  poolHamstarBalance: number | null
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy} style={{
      padding: '3px 10px', borderRadius: 6, border: `1px solid ${A.borderMid}`,
      background: copied ? A.greenSoft : '#fff', cursor: 'pointer',
      fontSize: 11, fontWeight: 700, color: copied ? A.green : A.textMuted,
      transition: 'all 0.15s',
    }}>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function SolscanBtn({ address }: { address: string }) {
  return (
    <a
      href={`https://solscan.io/account/${address}?cluster=devnet`}
      target="_blank" rel="noopener noreferrer"
      style={{
        padding: '3px 10px', borderRadius: 6, border: `1px solid ${A.borderMid}`,
        background: '#fff', cursor: 'pointer', textDecoration: 'none',
        fontSize: 11, fontWeight: 700, color: A.purple,
      }}
    >
      Solscan ↗
    </a>
  )
}

const TYPE_META: Record<string, { label: string; bg: string; fg: string }> = {
  treasury: { label: 'Treasury',     bg: A.yellowSoft,  fg: '#8a6a00'  },
  pet:      { label: 'Hamster',      bg: A.purpleSoft,  fg: A.purple   },
  pda:      { label: 'PDA',         bg: A.greenSoft,   fg: A.green    },
}

function TypeBadge({ type }: { type: string }) {
  const m = TYPE_META[type] ?? { label: type, bg: A.border, fg: A.textMuted }
  return (
    <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 99, background: m.bg, color: m.fg, textTransform: 'uppercase', letterSpacing: 0.6 }}>
      {m.label}
    </span>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: `1px solid ${A.border}` }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, flexShrink: 0 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, color: A.text, fontFamily: mono ? 'monospace' : undefined, wordBreak: 'break-all', textAlign: 'right' }}>{value}</span>
        <CopyBtn text={value} />
      </div>
    </div>
  )
}

export default function WalletPage() {
  const [data, setData] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const load = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await fetch('/api/admin/wallet')
      const d = await res.json()
      if (d.error) setErr(d.error)
      else setData(d)
    } catch (e) {
      setErr(String(e))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  const totalSol = data?.wallets.reduce((s, w) => s + (w.balanceSol ?? 0), 0) ?? 0

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: KANIT, fontSize: 26, fontWeight: 700, color: A.text }}>Wallet & Treasury</h1>
        <button onClick={() => load(true)} disabled={refreshing} style={{
          padding: '8px 18px', borderRadius: 48.5, border: `1.5px solid ${A.borderMid}`,
          background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: A.textMid,
        }}>
          {refreshing ? 'Refreshing…' : '↻ Refresh Balances'}
        </button>
      </div>

      {err && (
        <div style={{ padding: '12px 16px', background: A.redSoft, border: `1px solid ${A.red}`, borderRadius: 10, color: A.red, fontSize: 14, marginBottom: 20 }}>
          {err}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ background: A.card, borderRadius: 16, height: 80, border: `1.5px solid ${A.border}`, animation: 'pulse 1.4s ease-in-out infinite' }} />
          ))}
        </div>
      ) : data && (<>

        {/* Total balance summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
          <div style={{ background: A.card, borderRadius: 16, padding: '22px 24px', border: `1.5px solid ${A.border}` }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Total SOL (all wallets)</p>
            <p style={{ fontFamily: KANIT, fontSize: 30, fontWeight: 700, color: A.text }}>◎ {totalSol.toFixed(4)}</p>
          </div>

          {/* HAMSTAR pool balance */}
          <div style={{
            background: data.tokenLaunched ? A.card : A.pageBg,
            borderRadius: 16, padding: '22px 24px',
            border: `1.5px solid ${data.tokenLaunched ? A.border : A.borderMid}`,
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
              $HAMSTAR Pool Balance
            </p>
            {data.tokenLaunched ? (
              <p style={{ fontFamily: KANIT, fontSize: 30, fontWeight: 700, color: A.purple }}>
                {data.poolHamstarBalance !== null
                  ? data.poolHamstarBalance >= 1_000_000
                    ? `${(data.poolHamstarBalance / 1_000_000).toFixed(2)}M`
                    : data.poolHamstarBalance >= 1_000
                      ? `${(data.poolHamstarBalance / 1_000).toFixed(1)}k`
                      : data.poolHamstarBalance.toFixed(0)
                  : '—'}
              </p>
            ) : (
              <p style={{ fontFamily: KANIT, fontSize: 16, fontWeight: 600, color: A.textMuted }}>
                Token not launched
              </p>
            )}
            {data.tokenLaunched && data.hamstarPoolAddress && (
              <p style={{ fontSize: 11, color: A.textMuted, marginTop: 6, fontFamily: 'monospace' }}>
                {data.hamstarPoolAddress.slice(0, 10)}…{data.hamstarPoolAddress.slice(-6)}
              </p>
            )}
          </div>

          <div style={{ background: A.card, borderRadius: 16, padding: '22px 24px', border: `1.5px solid ${A.border}` }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Tracked Wallets</p>
            <p style={{ fontFamily: KANIT, fontSize: 30, fontWeight: 700, color: A.text }}>{data.wallets.length}</p>
          </div>
          {data.currentRace && (
            <div style={{ background: A.card, borderRadius: 16, padding: '22px 24px', border: `1.5px solid ${A.border}` }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Active Race</p>
              <p style={{ fontFamily: KANIT, fontSize: 30, fontWeight: 700, color: A.purple }}>#{data.currentRace.number}</p>
            </div>
          )}
        </div>

        {/* Wallet rows */}
        <div style={{ background: A.card, borderRadius: 16, border: `1.5px solid ${A.border}`, overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ padding: '16px 24px', borderBottom: `1px solid ${A.border}`, background: A.pageBg }}>
            <h2 style={{ fontFamily: KANIT, fontSize: 15, fontWeight: 700, color: A.text }}>Wallet Balances</h2>
          </div>
          {data.wallets.length === 0 ? (
            <div style={{ padding: '32px 24px', textAlign: 'center', color: A.textMuted, fontSize: 14 }}>
              No wallets configured. Set TREASURY_WALLET env var and ensure pets have wallet addresses.
            </div>
          ) : (
            <div>
              {data.wallets.map((w, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px',
                  borderBottom: i < data.wallets.length - 1 ? `1px solid ${A.border}` : 'none',
                  flexWrap: 'wrap',
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <TypeBadge type={w.type} />
                      <span style={{ fontFamily: KANIT, fontSize: 14, fontWeight: 700, color: A.text }}>{w.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: A.textMuted, fontFamily: 'monospace' }}>
                        {w.address.slice(0, 12)}…{w.address.slice(-6)}
                      </span>
                      <CopyBtn text={w.address} />
                      <SolscanBtn address={w.address} />
                    </div>
                    {w.meta && (
                      <p style={{ fontSize: 11, color: A.textMuted, marginTop: 3, fontFamily: 'monospace' }}>{w.meta}</p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: KANIT, fontSize: 20, fontWeight: 700, color: w.balanceSol !== null ? A.text : A.textMuted }}>
                      {w.balanceSol !== null ? `◎ ${w.balanceSol.toFixed(4)}` : '—'}
                    </p>
                    {w.balanceSol !== null && (
                      <p style={{ fontSize: 11, color: A.textMuted }}>
                        ≈ ${(w.balanceSol * 160).toFixed(2)} USD
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Program & Token Info */}
        <div style={{ background: A.card, borderRadius: 16, border: `1.5px solid ${A.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: `1px solid ${A.border}`, background: A.pageBg, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontFamily: KANIT, fontSize: 15, fontWeight: 700, color: A.text }}>Program & Token Info</h2>
            <a href="/admin/settings#token" style={{ fontSize: 12, fontWeight: 700, color: A.purple, textDecoration: 'none' }}>Edit config →</a>
          </div>
          <div style={{ padding: '0 24px' }}>
            <InfoRow label="Program ID"   value={data.programId}   mono />
            <InfoRow label="RPC Endpoint" value={data.rpcUrl}      mono />
            <InfoRow
              label="HAMSTAR Mint"
              value={data.hamstarMint.includes('xxx') ? '(not set — update in Settings)' : data.hamstarMint}
              mono
            />
            <InfoRow
              label="Pool Address"
              value={data.hamstarPoolAddress.includes('xxx') ? '(not set — update in Settings)' : data.hamstarPoolAddress}
              mono
            />
            <div style={{ padding: '12px 0' }}>
              <p style={{ fontSize: 12, color: A.textMuted }}>
                PDA seeds: upset_reserve uses{' '}
                <code style={{ background: A.pageBg, padding: '1px 6px', borderRadius: 4 }}>["upset_reserve"]</code>.
                Streak uses{' '}
                <code style={{ background: A.pageBg, padding: '1px 6px', borderRadius: 4 }}>["streak", user_pubkey]</code>.
              </p>
            </div>
          </div>
        </div>

      </>)}
    </div>
  )
}
