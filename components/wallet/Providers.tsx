'use client'
import { PrivyProvider } from '@privy-io/react-auth'
import { SolanaWalletProvider } from './WalletProvider'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
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
