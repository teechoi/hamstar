# HamstarHub — Build Progress

*Last updated: April 2026*

---

## Completed

### Landing Page
- [x] Hero section — title, subtitle, CTA button (all configurable)
- [x] Meet the Racers section — configurable title
- [x] About Hamstar section — configurable title + body text
- [x] Hamstar Arena section — countdown, live status, configurable content
- [x] Footer — brand description, tagline, social links (all configurable)
- [x] Nav — tagline strip, auth state, mobile hamburger menu
- [x] LegalModal — terms of service
- [x] HowItWorksModal — step-by-step explainer
- [x] Custom sunflower seed cursor site-wide

### Arena Page
- [x] Hamster cards — support bar, cheer button, pet names/images
- [x] Race status card — Preparing / Open / Live / Finished states
- [x] Pool bar — SOL totals, supporter counts
- [x] Result section — winner display, positions
- [x] Highlight section — 3 tweet/video embeds, winner bar, oats decoration
- [x] Live countdown timer
- [x] **Live implied odds** — per-hamster payout multiplier + pool share % updates in real time
- [x] **Live cheer feed** — real-time scrolling ticker of incoming cheers with "big move" highlighting
- [x] **Frenzy mode** — final 60s countdown goes red + pulses, copy changes to lock-in urgency
- [x] **Form cards** — last 5 race results (W/L pills), win rate %, streak label on each HamsterCard
- [x] **Dark horse badge** — DARK HORSE label on any hamster with < 20% of the pool during open/live
- [x] **Upset bonus badge** — UPSET BONUS 1.5x displayed on winning dark horse card in result state
- [x] **Streak bonus display** — CheerModal shows 🔥 N-race streak badge + +0.2x / +0.4x weight bonus label

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
- [x] CheerModal — amount input, quick-pick buttons, live payout preview, confirmed state

### $HAMSTAR Token
- [x] `lib/hamstar-token.ts` — token config, fan tier definitions, balance fetch, formatters
- [x] Fan tier system: 🌱 Fan (0) → 🥉 Bronze (100) → 🥈 Silver (1K) → 🥇 Gold (10K) → 👑 Legend (100K)
- [x] Token balance fetched via `getParsedTokenAccountsByOwner` — placeholder guard until mint goes live
- [x] Tier drives avatar ring gradient, badge color, and token card styling in AccountModal
- [x] Jupiter swap CTA in AccountModal + DepositModal Get $HAMSTAR tab
- [x] Contract address display with copy button (shows "Coming soon" while mint is placeholder)

### Solana Smart Contract (`hamstar-program`)
Full Anchor program — PDA-based escrow, 2-of-3 settler consensus, SPL token cheering.

**Core mechanics:**
- [x] `initialize` — deploy global `ProgramConfig` (fee splits, settler pubkeys, mint, caps)
- [x] `create_race` — admin opens a race with pick window timestamps + PDA escrow
- [x] `place_cheer` — user stakes HAMSTAR tokens on a hamster; time-weight decays linearly over window
- [x] `lock_race` — permissionless lock once `pick_window_close` passes
- [x] `propose_settlement` / `confirm_settlement` — 2-of-3 settler consensus to declare winner
- [x] `push_reward` — admin pushes payout to each winner (primary path)
- [x] `claim_reward` — user self-claims if admin push fails (fallback)
- [x] `cancel_race` / `claim_refund` — admin cancels → full refunds enabled

**Feature 5 — Dark Horse Bonus:**
- [x] `create_upset_reserve` — one-time admin instruction to initialize PDA reserve token account
- [x] `push_reward` / `claim_reward`: always divert `upset_reserve_bps` (1%) from each payout to reserve
- [x] If winner had < `dark_horse_threshold_bps` (20%) of pool: additionally pay `dark_horse_bonus_bps` (50%) from reserve → 1.5x total
- [x] Fee split: 3% total → 1.5% treasury / 1% upset reserve / 0.5% burn

**Feature 6 — Hot Streak Multiplier:**
- [x] `StreakAccount` PDA per wallet: `{ streak: u8, last_win_race_id: u64 }`
- [x] `place_cheer`: if `last_win_race_id == race_id - 1`, applies streak bonus to time-weight (2-streak: +0.2x, 3+: +0.4x)
- [x] `push_reward` / `claim_reward`: increments winner's streak; losers' streaks expire naturally (no update needed)

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
- [x] Monorepo: `hamstarhub/` (Next.js) + `hamstar-program/` (Anchor) at repo root
- [x] `tsconfig.json` excludes `hamstar-program/` from Next.js type-checking

### Form Data API
- [x] `/api/pets/[id]/form` — returns last 5 W/L results, win rate %, and current streak derived from `RACE_HISTORY`

### Design System
- [x] Inline `React.CSSProperties` — no Tailwind, no CSS modules
- [x] Design tokens (`/lib/theme.ts`) — all modals use `T.*` tokens, no hardcoded hex
- [x] Kanit (headings) + Pretendard (body) fonts
- [x] `useIsMobile()` hook — single 768px breakpoint
- [x] Component library (`/components/ui/index.tsx`)
- [x] Modal design language — yellow header, white body, cheese-hideout.png decoration, pill buttons at `borderRadius: 48.5`

### Documentation
- [x] `CLAUDE.md` — full design system + codebase rules
- [x] `docs/FEATURES.md` — feature roadmap (Phases 1–3 complete, parlay cut)
- [x] `docs/SEEKER.md` — Solana Seeker phone + SMS integration guide

---

## In Progress / Pending

### Contract — Deployment
- [ ] Deploy `hamstar-program` to devnet with updated `InitializeParams` (streak + dark horse fields)
- [ ] Call `create_upset_reserve` once after deploy
- [ ] Fetch real `StreakAccount` on-chain and pass `userStreak` to `CheerModal` (currently hardcoded 0)

### Arena — Real Data
- [ ] Replace `MOCK_SUPPORT` with real Supabase queries (pool totals per hamster)
- [ ] Wire Cheer button → actual `place_cheer` instruction via `@coral-xyz/anchor` client
- [ ] Replace `RACE_HISTORY` form source with real `races` DB query once races are being recorded

### Wallet — Phase 3
- [ ] Cheer button → real SOL / HAMSTAR transfer (`SystemProgram.transfer` / SPL token CPI)
- [ ] Watch Live Race button → live stream URL

### $HAMSTAR Token — Launch
- [ ] Replace `HAMSTAR_MINT` placeholder with real SPL mint address
- [ ] Replace `HAMSTAR_JUPITER_URL` with real Jupiter pool URL once liquidity is seeded

### Pet Page
- [ ] Pet stats from real race history (win rate, race count from DB)

---

## Known Issues / Tech Debt
- `effectiveResult` in `ArenaClient.tsx` — same value in both branches; clean up when result logic is finalized.
- `userStreak` in `ArenaClient.tsx` hardcoded to 0; wire to on-chain `StreakAccount` after program deployment.

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
| Smart Contract | Anchor 0.30 — `hamstar-program` (SPL token escrow, PDA-based) |
| Media | Cloudinary |
| Session | JWT (`jose`) |
| Styling | Inline `React.CSSProperties` |
| Fonts | Kanit (Google) + Pretendard (CDN) |
