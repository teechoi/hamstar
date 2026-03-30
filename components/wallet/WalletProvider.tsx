'use client'
import { useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import {
  SolanaMobileWalletAdapter,
  createDefaultAuthorizationResultCache,
  createDefaultAddressSelector,
  createDefaultWalletNotFoundHandler,
} from '@solana-mobile/wallet-adapter-mobile'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'

// Use Helius RPC if configured, fall back to public mainnet
const ENDPOINT =
  process.env.NEXT_PUBLIC_HELIUS_RPC ?? 'https://api.mainnet-beta.solana.com'

// Cast to resolve React 18.3 / wallet-adapter type mismatch
const Conn   = ConnectionProvider as React.FC<{ endpoint: string; children: React.ReactNode }>
const Wallet = WalletProvider as React.FC<{ wallets: any[]; autoConnect: boolean; children: React.ReactNode }>

export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(() => [
    // Explicit Solflare adapter — ensures it appears reliably without depending
    // on Wallet Standard timing (which can cause it to flash or not show at all)
    new SolflareWalletAdapter(),
    // Solana Mobile Wallet Adapter — handles Android wallet chooser (Seeker + all MWA wallets)
    // Solana Seeker phone connects through this on Android. Shows as "Unsupported"
    // on desktop / iOS — filtered out in the UI.
    new SolanaMobileWalletAdapter({
      appIdentity: {
        name: 'Hamstar',
        uri: typeof window !== 'undefined' ? window.location.origin : 'https://hamstarhub.xyz',
        icon: '/images/hamster-champion.png',
      },
      authorizationResultCache: createDefaultAuthorizationResultCache(),
      addressSelector: createDefaultAddressSelector(),
      onWalletNotFound: createDefaultWalletNotFoundHandler(),
      cluster: 'mainnet-beta',
    } as any),
    // All other Wallet Standard wallets (Phantom, Backpack, OKX, Coinbase, Magic Eden, etc.)
    // register themselves on window automatically — no explicit adapters needed.
  ], [])

  return (
    <Conn endpoint={ENDPOINT}>
      <Wallet wallets={wallets} autoConnect>
        {children}
      </Wallet>
    </Conn>
  )
}
