'use client'
import { useState, useEffect, Component, createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { PrivyProvider, usePrivy } from '@privy-io/react-auth'
import { SolanaWalletProvider } from './WalletProvider'

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? ''

// Exposed to the rest of the app — null means Privy isn't available
type PrivyLogin = ((...args: any[]) => void) | null
export const PrivyLoginCtx = createContext<PrivyLogin>(null)
export function usePrivyLogin(): PrivyLogin { return useContext(PrivyLoginCtx) }

// Reads login from inside a working PrivyProvider and publishes it to context
function PrivyBridge({ children }: { children: ReactNode }) {
  const { login } = usePrivy()
  return <PrivyLoginCtx.Provider value={login}>{children}</PrivyLoginCtx.Provider>
}

// Catches any Privy init throw and renders the wallet-only fallback instead
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

  // Wallet-only fallback — Privy login context stays null, wallet adapter works fine
  const fallback = (
    <PrivyLoginCtx.Provider value={null}>
      <SolanaWalletProvider>{children}</SolanaWalletProvider>
    </PrivyLoginCtx.Provider>
  )

  // Skip PrivyProvider during SSR/prerendering — it throws on the server
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
        <PrivyBridge>
          <SolanaWalletProvider>{children}</SolanaWalletProvider>
        </PrivyBridge>
      </PrivyProvider>
    </PrivyErrorBoundary>
  )
}
