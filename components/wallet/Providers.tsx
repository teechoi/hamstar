'use client'
import type { ReactNode } from 'react'
import { SolanaWalletProvider } from './WalletProvider'

export function AppProviders({ children }: { children: ReactNode }) {
  return <SolanaWalletProvider>{children}</SolanaWalletProvider>
}
