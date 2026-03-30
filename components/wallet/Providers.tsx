'use client'
import { useState, useEffect, useRef, Component, createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { PrivyProvider, usePrivy } from '@privy-io/react-auth'
import { SolanaWalletProvider } from './WalletProvider'

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? ''

// Exposed to the rest of the app — null means Privy isn't available
type PrivyLogin = ((...args: any[]) => void) | null
export const PrivyLoginCtx = createContext<PrivyLogin>(null)
export function usePrivyLogin(): PrivyLogin { return useContext(PrivyLoginCtx) }

// Null-rendering component inside PrivyProvider that extracts login and publishes it upward
function PrivyLoginExtractor({ onLogin }: { onLogin: (fn: PrivyLogin) => void }) {
  const { login } = usePrivy()
  const onLoginRef = useRef(onLogin)
  onLoginRef.current = onLogin
  useEffect(() => {
    onLoginRef.current(login)
    return () => { onLoginRef.current(null) }
  }, [login])
  return null
}

// Catches any Privy init throw — renders nothing (app continues normally)
class PrivyErrorBoundary extends Component<
  { children: ReactNode },
  { crashed: boolean }
> {
  state = { crashed: false }
  static getDerivedStateFromError() { return { crashed: true } }
  render() { return this.state.crashed ? null : this.props.children }
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [privyLogin, setPrivyLogin] = useState<PrivyLogin>(null)
  useEffect(() => { setMounted(true) }, [])

  return (
    <PrivyLoginCtx.Provider value={privyLogin}>
      {/*
        SolanaWalletProvider is ALWAYS the stable root — it never remounts.
        Previously it was inside a conditional branch, causing remount when
        `mounted` flipped and losing wallet connection state.
      */}
      <SolanaWalletProvider>
        {children}
        {/* PrivyProvider runs alongside the app tree (not wrapping it).
            This way a Privy crash cannot affect the main UI. */}
        {mounted && PRIVY_APP_ID && (
          <PrivyErrorBoundary>
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
              <PrivyLoginExtractor onLogin={setPrivyLogin} />
            </PrivyProvider>
          </PrivyErrorBoundary>
        )}
      </SolanaWalletProvider>
    </PrivyLoginCtx.Provider>
  )
}
