'use client'
import { useState, useEffect, Component } from 'react'
import type { ReactNode } from 'react'
import { PrivyProvider } from '@privy-io/react-auth'
import { SolanaWalletProvider } from './WalletProvider'

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? ''

// Error boundary so a Privy init failure falls back to wallet-adapter-only
// instead of crashing the entire page
class PrivyErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { crashed: boolean }
> {
  state = { crashed: false }
  static getDerivedStateFromError() { return { crashed: true } }
  render() {
    return this.state.crashed ? this.props.fallback : this.props.children
  }
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const fallback = <SolanaWalletProvider>{children}</SolanaWalletProvider>

  // During SSR / prerendering skip PrivyProvider to avoid validation errors
  if (!mounted || !PRIVY_APP_ID) return fallback

  return (
    <PrivyErrorBoundary fallback={fallback}>
      <PrivyProvider
        appId={PRIVY_APP_ID}
        config={{
          loginMethods: ['email', 'google', 'apple', 'wallet'],
          appearance: {
            walletChainType: 'solana-only',
            theme: 'light',
            accentColor: '#735DFF',
          },
          embeddedWallets: {
            solana: { createOnLogin: 'all-users' },
          },
        }}
      >
        <SolanaWalletProvider>{children}</SolanaWalletProvider>
      </PrivyProvider>
    </PrivyErrorBoundary>
  )
}
