# Solana Seeker Phone — HamstarHub Launch Guide

*Last updated: April 2026*

---

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

`components/wallet/WalletProvider.tsx` already passes `appIdentity`:

```tsx
new SolanaMobileWalletAdapter({
  appIdentity: {
    name: 'Hamstar',
    uri: window.location.origin,   // must be 'https://hamstarhub.xyz' in production
    icon: '/images/hamster-champion.png',
  },
  cluster: 'mainnet-beta',
  ...
})
```

This means users see **"Hamstar"** (not "Unknown app") in the Seed Vault Wallet authorization prompt. The icon appears in the wallet UI during signing.

**Important:** `window.location.origin` must resolve to the production domain when deployed. The `uri` is used to identify the app across sessions — if it changes, cached authorizations are invalidated.

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

## Current Status — What Works Today

| Feature | Status | Notes |
|---|---|---|
| All Wallet Standard wallets (Phantom, Backpack, Solflare, etc.) | ✅ Live | Auto-register via Wallet Standard |
| MWA — Android wallet chooser (Seeker + all Android) | ✅ Live | `SolanaMobileWalletAdapter` in `WalletProvider.tsx` |
| App identity ("Hamstar" in wallet prompt) | ✅ Live | `appIdentity` configured |
| QR code for non-MWA mobile | ✅ Live | `qrcode.react` in DepositModal |
| PWA manifest → homescreen install | ✅ Partial | Manifest exists but icons are broken (see gaps below) |
| Privy email/Google/Apple embedded wallets | ✅ Live | `NEXT_PUBLIC_PRIVY_APP_ID` configured |
| Mobile-responsive UI | ✅ Live | `useIsMobile()` throughout, bottom sheet CheerModal |
| dApp Store listing | 🔲 Not done | Needs TWA + APK |
| React Native / Expo app | 🔲 Future | Separate project |
| SKR reward mechanics | 🔲 Future | Requires dApp Store listing |

---

## Known Gaps Blocking a Clean Launch

| Gap | File | Fix |
|-----|------|-----|
| App icon is `sunflower-seed.png` (50×55 cursor asset) | `public/manifest.json` | Create proper 192×192 and 512×512 PNGs |
| `"screenshots": []` empty | `public/manifest.json` | Add 2–3 portrait screenshots |
| `"start_url": "/"` goes to landing page | `public/manifest.json` | Change to `"/arena"` |
| No service worker | — | Add `next-pwa` |
| Smart contract on devnet | `lib/hamstar-program.ts` | `anchor deploy --provider.cluster mainnet-beta` |
| `hamstarMint` is placeholder | Admin Settings | Replace with real SPL mint after token launch |
| `assetlinks.json` missing | — | Needed for dApp Store TWA verification |

---

## Phase 1 — Production Deploy (Prerequisite)

This must happen before anything else. The app is non-functional for real users without it.

```
[ ] 1. Lock in production domain (hamstarhub.xyz)
[ ] 2. Hardcode the domain in WalletProvider.tsx appIdentity.uri
        - Change: uri: typeof window !== 'undefined' ? window.location.origin : 'https://hamstarhub.xyz'
        - To:     uri: 'https://hamstarhub.xyz'
[ ] 3. Deploy Anchor program to mainnet-beta
        - cd hamstar-program
        - anchor build
        - anchor deploy --provider.cluster mainnet-beta
        - Update PROGRAM_ID in lib/hamstar-program.ts
[ ] 4. Launch $HAMSTAR SPL token
        - Deploy via Metaplex or CLI
        - Update hamstarMint in admin Settings
        - Update HAMSTAR_MINT in lib/hamstar-token.ts
[ ] 5. Set production env vars on host (Vercel/Railway):
        - DATABASE_URL / DIRECT_URL (production Supabase)
        - ADMIN_KEYPAIR (base58 admin wallet secret key)
        - TREASURY_WALLET (base58 public key)
        - SETTLER_2_KEYPAIR (base58 second settler)
        - HELIUS_API_KEY
        - NEXT_PUBLIC_HELIUS_RPC
        - JWT_SECRET (random 32+ char string)
        - NEXT_PUBLIC_PRIVY_APP_ID
[ ] 6. Run database migration on production
        - npx prisma migrate deploy
        (or npx prisma db push for first-time setup)
[ ] 7. Run seed-settings script
        - npx tsx scripts/seed-settings.ts
[ ] 8. Register Helius webhook on production domain
        - /api/webhook receives SOL donation events
        - Register treasury + pet wallet addresses in Helius dashboard
```

---

## Phase 2 — Seeker Browser (1–2 Days)

After Phase 1, Seeker users can already use the site in Chrome. This phase makes it installable as a home screen app with a proper icon and offline shell.

### 2a. Create proper app icons

Generate two square PNGs from the Hamstar logo (use `hamster-champion.png` as source or commission a dedicated app icon):
- `/public/images/app-icon-192.png` — 192×192px
- `/public/images/app-icon-512.png` — 512×512px

The 512px version should also work as a "maskable" icon (important content in the center 80% safe zone, background fills the rest).

### 2b. Update `public/manifest.json`

```json
{
  "name": "Hamstar",
  "short_name": "Hamstar",
  "description": "Three hamsters. One champion. The wheel decides.",
  "start_url": "/arena",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#080614",
  "theme_color": "#FFE790",
  "icons": [
    {
      "src": "/images/app-icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/images/app-icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["games", "entertainment", "finance"],
  "screenshots": [
    {
      "src": "/screenshots/arena.png",
      "sizes": "1080x1920",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Hamstar Arena — pick your racer"
    },
    {
      "src": "/screenshots/cheer.png",
      "sizes": "1080x1920",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Place your cheer before the race"
    },
    {
      "src": "/screenshots/winner.png",
      "sizes": "1080x1920",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Win celebration"
    }
  ]
}
```

### 2c. Add service worker via `next-pwa`

```bash
npm install next-pwa
```

Wrap `next.config.js`:

```js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})
module.exports = withPWA({ /* existing config */ })
```

This caches the app shell. Users get an "Add to Home Screen" prompt and offline splash screen.

### 2d. Capture screenshots

Take portrait screenshots on an actual mobile device (or Chrome DevTools mobile emulator) of:
1. Arena with a live race (hamster cards, pool bars)
2. CheerModal open (bottom sheet)
3. Win celebration overlay

Save as PNG at 1080×1920 to `/public/screenshots/`.

**Result after Phase 2:** Seeker users visit hamstarhub.xyz → Chrome shows "Add Hamstar to Home Screen" → installs as standalone app with proper icon. No App Store needed.

---

## Phase 3 — Solana Mobile dApp Store (1–2 Weeks)

The dApp Store requires an Android APK. The right approach is a **Trusted Web Activity (TWA)** — a thin Android wrapper that renders the PWA at full screen using Chrome, with domain ownership verified via `assetlinks.json`.

### 3a. Generate a signing keystore

```bash
keytool -genkey -v \
  -keystore hamstar-release.jks \
  -alias hamstar \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Store this `.jks` file and its password securely — losing it means you can never update the app on the dApp Store.

Get the SHA-256 fingerprint (needed for `assetlinks.json`):

```bash
keytool -list -v -keystore hamstar-release.jks -alias hamstar | grep "SHA256:"
```

### 3b. Create `public/.well-known/assetlinks.json`

Android verifies domain ownership by fetching this file. Replace `SHA256_FINGERPRINT` with the output from step 3a.

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "xyz.hamstarhub.app",
    "sha256_cert_fingerprints": ["AA:BB:CC:...YOUR_SHA256..."]
  }
}]
```

This file must be reachable at `https://hamstarhub.xyz/.well-known/assetlinks.json` before you submit.

### 3c. Generate the Android project with Bubblewrap

Bubblewrap CLI reads your PWA manifest and scaffolds a full Android Studio project:

```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://hamstarhub.xyz/manifest.json
```

Key settings to fill in during init:
- Package name: `xyz.hamstarhub.app`
- App name: `Hamstar`
- Launcher icon: path to your 512×512 maskable icon
- Signing key: point to the `.jks` from step 3a

Build the signed AAB:

```bash
bubblewrap build
```

Outputs `app-release-signed.apk` and `.aab`.

### 3d. Submit to Solana Mobile dApp Store

The dApp Store uses a public GitHub repo format. Fork [`solana-mobile/dapp-publishing`](https://github.com/solana-mobile/dapp-publishing):

```
config/
  app.yaml           # app metadata
  release.yaml       # version info + APK hash
  localized/
    en-US/
      listing.yaml   # store description + tagline
      graphics/      # feature graphic (1024×500), screenshots
```

Example `app.yaml`:
```yaml
publisher_name: HamstarHub
name: Hamstar
android_package: xyz.hamstarhub.app
category: Gaming
website_url: https://hamstarhub.xyz
contact_email: contact@hamstarhub.xyz
```

Install their CLI and validate/submit:

```bash
npx dapp-store create-app
npx dapp-store create-release
npx dapp-store publish
```

Review takes approximately 1–2 weeks. Reviewers check:
- MWA integration present (✅ already done)
- No prohibited content (gambling laws apply — review your jurisdiction)
- App is functional
- APK is signed

**Result after Phase 3:** Hamstar appears in the Solana Mobile dApp Store. Seeker users can install directly from the store. App earns SKR reward mechanics — users earn SKR for using it.

---

## Phase 4 — Native App (Future, Optional)

A React Native / Expo app unlocks features unavailable in the web:

| Feature | Notes |
|---|---|
| Push notifications | Race start alerts, winner announcements |
| Persistent MWA sessions | No per-transaction wallet re-launch |
| SKR reward integration | Deep integration with dApp Store mechanics |
| Haptic feedback | Vibration on win, on cheer confirmation |
| Homescreen widgets | Race countdown / current hamster odds |
| Camera | QR scanning for deposits |

Setup uses `@solana-mobile/mobile-wallet-adapter-clientlib` instead of the web adapter. Framework: Expo with Expo Router.

**Verdict:** Not needed now. The PWA + TWA path gives 95% of the Seeker experience with a fraction of the engineering effort. Revisit when monthly active Seeker users justify a native build.

---

## Priority Checklist (Ordered)

```
Phase 1 — Production Deploy
[ ] Lock in production domain
[ ] Hardcode domain in WalletProvider.tsx appIdentity.uri
[ ] Deploy Anchor program to mainnet-beta, update PROGRAM_ID
[ ] Set all production env vars on host
[ ] Run prisma migrate deploy on production DB
[ ] Run seed-settings script
[ ] Register Helius webhook on production domain

Phase 2 — Seeker Browser (parallel with Phase 1 infra work)
[ ] Create 192×192 app-icon-192.png (Hamstar logo, square)
[ ] Create 512×512 app-icon-512.png (maskable, safe zone center)
[ ] Update manifest.json — icons, start_url: /arena, screenshots array
[ ] Capture 3 portrait screenshots (1080×1920) of arena/cheer/win
[ ] Add next-pwa service worker to next.config.js
[ ] Test "Add to Home Screen" install on Android Chrome

Phase 3 — dApp Store
[ ] Launch $HAMSTAR token, update admin Settings + lib/hamstar-token.ts
[ ] Generate release keystore (.jks), save SHA-256 fingerprint
[ ] Create public/.well-known/assetlinks.json with SHA-256
[ ] Install bubblewrap, run init against production manifest URL
[ ] Run bubblewrap build, verify signed APK
[ ] Create dapp-publishing repo fork with app/release/listing YAML
[ ] Submit via dapp-store CLI, await review (~2 weeks)
```

---

## Privy + Seeker Notes

- Privy's web SDK works fine on Chrome on Seeker — no known compatibility issues
- Privy embedded wallets **bypass the Seed Vault** — keys live in Privy's MPC infrastructure, not the hardware TEE
- Use Privy for users without wallets; use MWA + Seed Vault Wallet for existing Solana users who want hardware security
- Both coexist in our modal — the wallet list shows both paths

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

*Research sources: docs.solanamobile.com, blog.solanamobile.com, bubblewrap CLI docs, Solana dApp Publishing repo.*
