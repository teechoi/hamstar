# Solana Seeker Phone — HamstarHub Integration Guide

## What Is the Seeker?

The Solana Seeker is a crypto-native Android phone released August 4, 2025 (~$450–500). It ships with the **Solana Mobile Stack** built into the OS — most importantly a hardware **Seed Vault**: a Trusted Execution Environment (TEE) secure element where private keys live. Keys never leave the chip. Signing uses a double-tap physical button + fingerprint.

**Specs:** MediaTek Dimensity 7300 · 8 GB RAM · 128 GB · 6.36" · Android 15 · 108 MP main camera

Over 150,000 units shipped. 100,000+ active device owners as of Jan 2026 (SKR token airdrop recipients).

---

## How HamstarHub Already Supports Seeker

**Zero extra code required.** Our stack (`@solana/wallet-adapter-react@0.15.39`) bundles `@solana-mobile/wallet-adapter-mobile` and activates it automatically when it detects Android Chrome. On Seeker, the flow is:

1. User opens hamstarhub.xyz in Chrome on Seeker
2. Wallet adapter detects Android → activates `SolanaMobileWalletAdapter`
3. User taps "Connect Wallet" in our modal
4. Chrome fires an Android intent → Seed Vault Wallet (or Phantom/Solflare) opens
5. User double-taps + fingerprint to authorize
6. Signed transaction returned to HamstarHub
7. Wallet app closes, user is back in Chrome, fully connected

**Hardware security is transparent** — HamstarHub gets Seed Vault-backed signing automatically through the MWA chain: `HamstarHub web → MWA → Seed Vault Wallet → TEE`.

---

## Solana Mobile Stack (SMS) — Three Components

### 1. Seed Vault
A **system service** (not an app) running inside the hardware TEE. Wallet apps call its API; it prompts for biometric confirmation and signs. The web app never touches the key material.

### 2. Mobile Wallet Adapter (MWA 2.0)
Protocol for connecting web/native dApps to wallet apps on the same Android device. Uses local WebSocket — no cloud relay. Each signing session:
- dApp triggers connect → MWA launches wallet as Android Activity
- Wallet prompts user → signs → returns result
- Connection closes

Works in **Chrome on Android** only. Firefox/Brave on Android may not support the required local WebSocket permissions.

### 3. dApp Store
Alternative APK distribution (not Google Play). 225+ dApps listed. In-store features include SKR reward mechanics and device-native install prompts. **HamstarHub does NOT need to be in the dApp Store to work on Seeker** — the web app in Chrome is fully functional.

---

## App Identity Configuration

Our `WalletProvider.tsx` already passes `appIdentity`:

```tsx
new SolanaMobileWalletAdapter({
  appIdentity: {
    name: 'Hamstar',
    uri: window.location.origin,   // 'https://hamstarhub.xyz'
    icon: '/images/sunflower-seed.png',
  },
  ...
})
```

This means users see **"Hamstar"** (not "Unknown app") in the Seed Vault Wallet authorization prompt. The icon appears in the wallet UI during signing.

---

## Seeker vs Regular Android: Differences

| | Seeker | Other Android |
|---|---|---|
| Seed Vault backing | Hardware TEE (secure element) | Software TEE only |
| Default wallet | Seed Vault Wallet (Solflare) | Whatever is installed |
| Signing UX | Double-tap button + fingerprint | App biometric/PIN |
| TEEPIN attestation | Yes — device identity on-chain | No |
| MWA protocol | MWA 2.0 (same spec) | MWA 2.0 (same spec) |
| Browser needed | Chrome (default on device) | Chrome required |

---

## iOS Limitations

MWA **cannot run on iOS** — iOS doesn't allow inter-app local WebSocket connections. On iPhone, wallet connections fall back to:
- **QR code scan** — user scans with their phone wallet (we already have `qrcode.react`)
- **Privy / embedded wallet** — email/Google login creates a wallet in-browser (no external app needed)
- **Phantom deep links** — manual deep link flow (documented on phantom.com)

For iOS users, the Privy embedded wallet path is the smoothest experience.

---

## Going Further: dApp Store Listing (Future)

To appear in the Solana dApp Store and earn SKR reward mechanics:

1. **Add PWA manifest** — makes HamstarHub installable from Chrome on Seeker homescreen
2. **Wrap as TWA** — Trusted Web Activity: a thin Android shell that renders our URL in Chrome full-screen
3. **Build APK** — from the TWA, using Bubblewrap CLI or similar
4. **Submit to dApp Store** — via the Solana dApp Publisher Portal (publisher.solanamobile.com)
   - Must use a **separate signing key** (not Google Play's)
   - Pass content review (no illegal gambling, etc.)

Being in the dApp Store unlocks:
- Discovery by Seeker users browsing the store
- SKR token reward mechanics (users earn SKR for using dApps)
- "Seeker Guardian" partnership potential
- Native install prompt within the store UI

---

## React Native App (Future — Full Seeker Experience)

A React Native / Expo app would give access to features unavailable in the web app:

- **Persistent MWA sessions** — reuse wallet authorization within a session (no per-transaction re-launch)
- **Push notifications** — race start alerts, winner announcements
- **SKR reward integration** — earn SKR through dApp Store mechanics
- **Seeker widgets** — homescreen widgets for race status / countdown
- **Camera** — QR code scanning for deposits
- **Seeker Guardian features** — Helius RPC and Jito MEV protection integrations

Setup uses `@solana-mobile/mobile-wallet-adapter-clientlib` instead of the web adapter. Expo is the recommended framework per official Solana Mobile docs.

**Verdict for now:** The web app gives excellent Seeker support for free. A native app is a separate project warranted when usage on Seeker grows enough to justify it.

---

## Privy + Seeker Notes

- Privy's web SDK works fine on Chrome on Seeker — no known compatibility issues
- Privy embedded wallets **bypass the Seed Vault** — keys live in Privy's MPC infrastructure, not the hardware TEE
- Use Privy for users without wallets; use MWA + Seed Vault Wallet for existing Solana users who want hardware security
- Both can coexist in the same app (our modal shows both paths)

---

## Summary: What Works Today vs Future Work

| Feature | Status |
|---|---|
| All Wallet Standard wallets (Phantom, Backpack, Solflare, etc.) | ✅ Live |
| MWA — Android wallet chooser (Seeker + all Android) | ✅ Live |
| App identity ("Hamstar" in wallet prompt) | ✅ Live |
| QR code for non-MWA mobile | ✅ Live (`qrcode.react` in DepositModal) |
| PWA manifest → homescreen install | ✅ Live (`/public/manifest.json` + meta tags) |
| Privy email/Google/Apple embedded wallets | ✅ Live (`NEXT_PUBLIC_PRIVY_APP_ID` configured) |
| dApp Store listing | 🔲 Needs TWA + APK (PWA manifest done) |
| React Native / Expo app | 🔲 Future native app project |
| SKR reward mechanics | 🔲 Requires dApp Store listing + native integration |

---

*Last updated: March 2026. Research sources: docs.solanamobile.com, blog.solanamobile.com, privy.io/blog.*
