'use client'
import { useEffect, useRef, useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { HAMSTAR_MINT, HAMSTAR_JUPITER_URL } from '@/lib/hamstar-token'
import { T } from '@/lib/theme'

// Window type declaration — Jupiter Terminal loaded via CDN script tag in layout.tsx
declare global {
  interface Window {
    Jupiter?: {
      init: (config: Record<string, unknown>) => void
      close: () => void
      resume: () => void
      _instance?: unknown
    }
  }
}

const CONTAINER_ID = 'hamstar-jupiter-swap'
const SOL_MINT = 'So11111111111111111111111111111111111111112'
const KANIT = "var(--font-kanit), sans-serif"

export function JupiterTerminal() {
  const { publicKey, connected, signTransaction, signAllTransactions, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const [scriptReady, setScriptReady] = useState(false)
  const cleanupRef = useRef<() => void>(() => {})

  // Poll for script availability on first mount
  useEffect(() => {
    if (window.Jupiter) { setScriptReady(true); return }
    const timer = setInterval(() => {
      if (window.Jupiter) { setScriptReady(true); clearInterval(timer) }
    }, 50)
    return () => clearInterval(timer)
  }, [])

  // (Re-)init Terminal whenever script becomes ready or wallet state changes
  useEffect(() => {
    if (!scriptReady || !window.Jupiter) return

    const isPlaceholder = HAMSTAR_MINT.includes('xxx')
    const endpoint = connection.rpcEndpoint

    window.Jupiter.init({
      displayMode: 'integrated',
      integratedTargetId: CONTAINER_ID,
      endpoint,
      formProps: {
        initialInputMint: SOL_MINT,
        ...(!isPlaceholder && {
          initialOutputMint: HAMSTAR_MINT,
          fixedOutputMint: true,
        }),
      },
      // Pass through existing wallet so users don't need to reconnect inside Jupiter
      passthroughWallet: connected
        ? { publicKey, signTransaction, signAllTransactions, sendTransaction, connected }
        : undefined,
    })

    cleanupRef.current = () => { window.Jupiter?.close() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptReady, publicKey?.toBase58(), connected])

  // Close terminal on unmount
  useEffect(() => () => { cleanupRef.current?.() }, [])

  return (
    <div style={{ position: 'relative', minHeight: 460 }}>
      {/* Loading state — shown until Jupiter script replaces this div's contents */}
      {!scriptReady && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 12, color: 'rgba(255,255,255,0.4)',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: T.yellow,
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{ fontFamily: KANIT, fontSize: 13, letterSpacing: '-0.01em' }}>
            Loading swap...
          </span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Fallback link — shown if script fails (ad blocker, network issue) */}
      {scriptReady && !window.Jupiter && (
        <div style={{
          padding: '32px 24px', textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            Swap widget unavailable — open Jupiter directly
          </p>
          <a
            href={HAMSTAR_JUPITER_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 48.5,
              background: T.yellow, color: '#000',
              fontFamily: KANIT, fontSize: 14, fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            🪐 Open Jupiter ↗
          </a>
        </div>
      )}

      {/* Jupiter Terminal renders into this div */}
      <div id={CONTAINER_ID} style={{ width: '100%' }} />
    </div>
  )
}
