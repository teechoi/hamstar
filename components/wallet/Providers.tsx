'use client'
import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { SolanaWalletProvider } from './WalletProvider'

// Privy is disabled until a confirmed valid app ID is configured.
// When ready: re-enable by importing PrivyProvider and wiring PrivyLoginCtx.
type PrivyLogin = ((...args: any[]) => void) | null
export const PrivyLoginCtx = createContext<PrivyLogin>(null)
export function usePrivyLogin(): PrivyLogin { return useContext(PrivyLoginCtx) }

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PrivyLoginCtx.Provider value={null}>
      <SolanaWalletProvider>{children}</SolanaWalletProvider>
    </PrivyLoginCtx.Provider>
  )
}
