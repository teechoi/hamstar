# HamstarHub — Build Progress

*Last updated: March 2026*

---

## Completed

### Landing Page
- [x] Hero section — title, subtitle, CTA button (all configurable)
- [x] Meet the Racers section — configurable title
- [x] About Hamstar section — configurable title + body text
- [x] Hamstar Arena section — countdown, live status, configurable content
- [x] Footer — brand description, tagline, social links (all configurable)
- [x] Nav — tagline strip, auth state, mobile hamburger menu

### Arena Page
- [x] Hamster cards — support bar, cheer button, pet names/images
- [x] Race status card — Preparing / Open / Live / Finished states
- [x] Pool bar — SOL totals, supporter counts
- [x] Result section — winner display, positions
- [x] Highlight section — video cards, winner bar, oats decoration
- [x] Live countdown timer

### Wallet / Auth / Onboarding
- [x] All Solana wallets via Wallet Standard auto-discovery (Phantom, Backpack, Solflare, OKX, Coinbase, Magic Eden, etc.)
- [x] Mobile Wallet Adapter (MWA 2.0) — Android wallet chooser, Seeker phone support
- [x] **Privy embedded wallets** — email, Google, Apple sign-in active (`NEXT_PUBLIC_PRIVY_APP_ID` configured)
  - `next.config.js`: `serverComponentsExternalPackages` fix resolves CJS/ESM webpack conflict
  - `PrivyProvider` wraps `SolanaWalletProvider` in `Providers.tsx`
  - Embedded Solana wallet created on login for all users (no seed phrase)
- [x] App identity configured ("Hamstar" appears in wallet signing prompts)
- [x] LoginModal — fully branded: yellow 🐹 icon, HAMSTAR badge, yellow Connect badges, Privy social buttons wired
- [x] AccountModal — fan tier system, SOL + $HAMSTAR balance display, cheering history, deposit routing
- [x] DepositModal — tabbed (Deposit SOL / Get $HAMSTAR), QR code, address copy, contract address
- [x] Auto-close modal when wallet connects
- [x] Disconnect flow
- [x] Cheering history tracked locally (`lib/cheer-history.ts`)

### $HAMSTAR Token
- [x] `lib/hamstar-token.ts` — token config, fan tier definitions, balance fetch, formatters
- [x] Fan tier system: 🌱 Fan (0) → 🥉 Bronze (100) → 🥈 Silver (1K) → 🥇 Gold (10K) → 👑 Legend (100K)
- [x] Token balance fetched via `getParsedTokenAccountsByOwner` — placeholder guard until mint goes live
- [x] Tier drives avatar ring gradient, badge color, and token card styling in AccountModal
- [x] Jupiter swap CTA in AccountModal + DepositModal Get $HAMSTAR tab
- [x] Contract address display with copy button (shows "Coming soon" while mint is placeholder)

### Admin Dashboard
- [x] Content page — all text configurable (nav, hero, about, arena, footer, login modal, terms, how-it-works steps)
- [x] Media upload (Cloudinary)
- [x] Settings API (`/api/admin/settings` GET/PATCH)
- [x] Public settings API (`/api/settings`)
- [x] Decoration layer editor
- [x] Sponsors management

### Infrastructure
- [x] Prisma schema + `SiteSettings` singleton
- [x] Supabase realtime + 30s polling fallback
- [x] Helius webhook → SOL donation tracking
- [x] Deterministic 48h race schedule (`race-scheduler.ts`)
- [x] JWT session auth (`auth.ts`)
- [x] Admin password protection
- [x] PWA manifest (`/public/manifest.json`) + meta tags → homescreen installability on Seeker + iOS

### Design System
- [x] Inline `React.CSSProperties` — no Tailwind, no CSS modules
- [x] Design tokens (`/lib/theme.ts`) — all modals use `T.*` tokens, no hardcoded hex
- [x] Kanit (headings) + Pretendard (body) fonts
- [x] `useIsMobile()` hook — single 768px breakpoint
- [x] Component library (`/components/ui/index.tsx`)
- [x] Modal design language — yellow header, white body, cheese-hideout.png decoration, pill buttons at `borderRadius: 48.5`

### Documentation
- [x] `CLAUDE.md` — full design system + codebase rules
- [x] `docs/SEEKER.md` — Solana Seeker phone + SMS integration guide

---

## In Progress / Pending

### Wallet — Phase 3
- [ ] Cheer button → real SOL transfer (`SystemProgram.transfer` via `sendTransaction`)
- [ ] Watch Live Race button → live stream URL

### $HAMSTAR Token — Launch
- [ ] Replace `HAMSTAR_MINT` placeholder with real SPL mint address
- [ ] Replace `HAMSTAR_JUPITER_URL` with real Jupiter pool URL once liquidity is seeded
- [ ] Token balance will auto-display in AccountModal as soon as mint address is live

### Social Logins (beyond Privy)
- [ ] X / Twitter OAuth
- [ ] Discord OAuth
- [ ] Telegram bot auth

### Seeker / Mobile Native (future)
- [ ] TWA + APK → Solana dApp Store listing
- [ ] React Native / Expo app (full Seeker hardware features, SKR rewards)
- [ ] iOS Phantom deep link flow

### Arena — Real Data
- [ ] Replace mock support data (`MOCK_SUPPORT`) with real Supabase queries
- [ ] Wire Cheer button to actual on-chain SOL transfer
- [ ] Real-time pool balance updates

### Pet Page
- [ ] Pet stats from real race history
- [ ] Dynamic win rate, race count from DB

### Highlights / Video
- [ ] Real video thumbnails + stream clips from Pump.fun
- [ ] Working video player for race replay

---

## Known Issues / Tech Debt
- `effectiveResult` variable in `ArenaClient.tsx` — same value assigned in both branches. Clean up when result logic is finalized.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | Prisma + PostgreSQL (Supabase) |
| Realtime | Supabase Realtime |
| Solana | `@solana/wallet-adapter-react` 0.15.39 |
| Mobile | `@solana-mobile/wallet-adapter-mobile` (MWA 2.0) |
| Auth | Privy (`@privy-io/react-auth`) — email, Google, Apple + embedded wallets |
| Media | Cloudinary |
| Session | JWT (`jose`) |
| Styling | Inline `React.CSSProperties` |
| Fonts | Kanit (Google) + Pretendard (CDN) |
