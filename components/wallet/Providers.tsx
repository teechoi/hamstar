'use client'
import { PrivyProvider } from '@privy-io/react-auth'
import { SolanaWalletProvider } from './WalletProvider'

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? ''

export function AppProviders({ children }: { children: React.ReactNode }) {
  // If Privy app ID is not configured, skip PrivyProvider and just use wallet adapter
  if (!PRIVY_APP_ID) {
    return <SolanaWalletProvider>{children}</SolanaWalletProvider>
  }

  return (
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
  )
}
