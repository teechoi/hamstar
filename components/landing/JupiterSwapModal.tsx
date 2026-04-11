'use client'
import { useState } from 'react'
import { T } from '@/lib/theme'
import { JupiterTerminal } from './JupiterTerminal'
import { HAMSTAR_SYMBOL, HAMSTAR_MINT } from '@/lib/hamstar-token'

const KANIT = "var(--font-kanit), sans-serif"

interface JupiterSwapModalProps {
  onClose: () => void
}

export function JupiterSwapModal({ onClose }: JupiterSwapModalProps) {
  const [hovClose, setHovClose] = useState(false)
  const isPlaceholder = HAMSTAR_MINT.includes('xxx')

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 20000,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#131218',
          borderRadius: 24,
          width: '100%',
          maxWidth: 460,
          position: 'relative',
          boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: T.yellow,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <img src="/images/hamster-flash-flex.png" alt="" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
            </div>
            <div>
              <p style={{ fontFamily: KANIT, fontSize: 15, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>
                Swap for {HAMSTAR_SYMBOL}
              </p>
              {isPlaceholder && (
                <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 11, color: T.yellow, margin: 0, opacity: 0.8 }}>
                  Token launching soon — swap any pair now
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            onMouseEnter={() => setHovClose(true)}
            onMouseLeave={() => setHovClose(false)}
            style={{
              background: hovClose ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)',
              border: 'none', borderRadius: 8,
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.6)', fontSize: 20, lineHeight: 1,
              cursor: 'pointer', transition: 'background 0.15s',
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* Jupiter Terminal */}
        <JupiterTerminal />
      </div>
    </div>
  )
}
