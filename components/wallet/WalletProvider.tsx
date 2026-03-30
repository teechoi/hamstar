'use client'
import { useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import {
  SolanaMobileWalletAdapter,
  createDefaultAuthorizationResultCache,
  createDefaultAddressSelector,
  createDefaultWalletNotFoundHandler,
} from '@solana-mobile/wallet-adapter-mobile'

// Use Helius RPC if configured, fall back to public mainnet
const ENDPOINT =
  process.env.NEXT_PUBLIC_HELIUS_RPC ?? 'https://api.mainnet-beta.solana.com'

// Cast to resolve React 18.3 / wallet-adapter type mismatch
const Conn   = ConnectionProvider as React.FC<{ endpoint: string; children: React.ReactNode }>
const Wallet = WalletProvider as React.FC<{ wallets: any[]; autoConnect: boolean; children: React.ReactNode }>

export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(() => [
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
    // All Wallet Standard wallets (Phantom, Backpack, Solflare, OKX, Coinbase, Magic Eden, etc.)
    // register themselves on window automatically — no explicit adapters needed.
    // Solflare uses Wallet Standard exclusively — adding an explicit adapter causes
    // duplicate registration conflicts, so we intentionally leave it out.
  ], [])

  return (
    <Conn endpoint={ENDPOINT}>
      <Wallet wallets={wallets} autoConnect>
        {children}
      </Wallet>
    </Conn>
  )
}
