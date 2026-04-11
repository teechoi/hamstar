# HamstarHub — Build Progress

*Last updated: April 11, 2026*

---

## Completed

### Landing Page
- [x] Hero section — title, subtitle, CTA button (all configurable via admin)
- [x] Meet the Racers section — Dash, Flash, Turbo cards with hover animation
- [x] About Hamstar section — configurable title + body text
- [x] Hamstar Arena section — countdown timer, live status badge, configurable content
- [x] Footer — brand desc, tagline, social links, legal modals, contact email
- [x] Nav — tagline strip, auth state (connected/disconnected), mobile hamburger menu
- [x] LegalModal — Terms, Privacy, Cookie Policy, Disclaimer
- [x] HowItWorksModal — 4-step carousel (configurable via admin content page)
- [x] Custom sunflower seed cursor site-wide

### Arena Page
- [x] Hamster cards — support bar, cheer button, pet names/images
- [x] Race status card — Preparing / Open / Live / Finished states
- [x] Pool bar — real-time SOL totals, supporter counts (from DB via useRace hook)
- [x] Result section — winner display, positions
- [x] Highlight section — past race result rows, oats decoration
- [x] Live countdown timer
- [x] Live implied odds — per-hamster payout multiplier + pool share % (real data)
- [x] Frenzy mode — final 60s countdown pulses red, copy changes to lock-in urgency
- [x] Form cards — last 5 race W/L pills, win rate %, streak label on each HamsterCard (real DB data)
- [x] Dark horse badge — DARK HORSE label on any hamster < 20% of pool (open/live)
- [x] Upset bonus badge — UPSET BONUS 1.5x on winning dark horse card in result state
- [x] Streak bonus display — CheerModal shows 🔥 N-race streak + +0.2x/+0.4x weight bonus label
- [x] Demo mode disabled — arena uses real race scheduler (set `demo.arenaState: null` in config/site.ts)

### Highlights Page
- [x] Fetches real finished races from DB via `/api/highlights`
- [x] Expandable race rows — click to reveal recap text
- [x] Media section — shows DB media items (videos/photos) when uploaded via admin; hidden if none
- [x] Latest champion banner — real DB data
- [x] Empty state when no races have finished
- [x] Proper useWallet() integration

### Pet Page
- [x] Hamster profile selector tabs (Dash, Flash, Turbo)
- [x] Real stats from DB — win rate, race count via `/api/pets/[id]/stats`
- [x] Style label from chaos stat
- [x] Bio and performance metrics

### Wallet / Auth / Onboarding
- [x] All Solana wallets via Wallet Standard auto-discovery (Phantom, Backpack, Solflare, OKX, etc.)
- [x] Mobile Wallet Adapter (MWA 2.0) — Android wallet chooser
- [x] Privy embedded wallets — email, Google, Apple sign-in (`NEXT_PUBLIC_PRIVY_APP_ID` configured)
- [x] LoginModal — branded, wallet list, social login via Privy
- [x] AccountModal — SOL + $HAMSTAR balance, cheer history, fan tier system
- [x] DepositModal — tabbed (Deposit SOL / Get $HAMSTAR), QR code, address copy
- [x] CheerModal — amount input, quick-picks, streak bonus preview, confirmed state
- [x] Cheer history tracked locally (`lib/cheer-history.ts`) + synced to DB
- [x] Auto-close modal on wallet connect, disconnect flow

### $HAMSTAR Token
- [x] `lib/hamstar-token.ts` — token config, fan tier definitions, balance fetch
- [x] Fan tier system: 🌱 Fan → 🥉 Bronze → 🥈 Silver → 🥇 Gold → 👑 Legend
- [x] Token balance fetch via `getParsedTokenAccountsByOwner` (placeholder guard until mint is live)
- [x] Jupiter swap CTA in AccountModal + DepositModal

### Solana Smart Contract (`hamstar-program`)
Full Anchor program — PDA-based escrow, dark horse bonus, hot streak multiplier.

- [x] `initialize` — global `ProgramConfig` with fee splits, streak/bonus params
- [x] `create_race` — admin opens race with pick window + PDA escrow
- [x] `place_cheer` — user stakes HAMSTAR; time-weighted, streak bonus applied
- [x] `lock_race` — permissionless lock after pick window closes
- [x] `propose_settlement` / `confirm_settlement` — 2-of-3 settler consensus
- [x] `push_reward` / `claim_reward` — payout with dark horse bonus logic
- [x] `cancel_race` / `claim_refund` — admin cancel → full refund path
- [x] `create_upset_reserve` — one-time PDA reserve account init
- [x] `StreakAccount` PDA per wallet — streak increments on win, expires naturally on loss
- [x] Dark horse threshold: < 20% pool → 1.5x upset bonus from reserve
- [x] Fee split: 3% total → 1.5% treasury / 1% upset reserve / 0.5% burn

### Admin Panel
- [x] Login — password-protected (bcrypt), JWT session cookie, proper form (no infinite redirect loop)
- [x] Dashboard — stat cards, quick-action links, recent donations table, $HAMSTAR token launch status banner
- [x] Race Control — full lifecycle: create race (datetime pickers), UPCOMING→LIVE→FINISHED, recap editor, isLive auto-sync
- [x] On-chain settlement pipeline — lock_race → propose_settlement → confirm_settlement UI in Race Control
- [x] Push rewards — batch push_reward to all winning wallets from Race Control
- [x] Race History — all finished races, podium, pool SOL, supporter count, inline recap editor
- [x] Wallet & Treasury — SOL balances for all wallets (treasury, hamster wallets, upset reserve PDA), Solscan links
- [x] Users — paginated table, cheer stats, win rate, fav hamster, wallet search
- [x] Hamsters — edit all pet fields (name, bio, stats, image, color)
- [x] Sponsors — CRUD sponsor entries with tiers
- [x] Media — upload/manage videos and photos (used by highlights page)
- [x] Content — all page copy editable (hero, about, arena, footer, modals, carousel steps)
- [x] Settings — race config, social links, site identity, $HAMSTAR token config (mint + pool address), button labels
- [x] Program Config — on-chain fee/bonus params editor (fee_bps, burn_bps, streak bonuses, dark horse system)
- [x] Admin nav — all pages with emoji icons
- [x] Admin mobile optimization — responsive grids, safe-area padding, correct icon display on bottom nav
- [x] Admin auth re-enabled — JWT session in `middleware.ts`

### API Routes
- [x] `GET /api/races` — current race + past 5, real supporter counts, total SOL
- [x] `GET /api/pets/[id]/form` — W/L history from DB, falls back to static config
- [x] `GET /api/pets/[id]/stats` — live wins/races/winRate from DB
- [x] `GET /api/highlights` — finished races + media for highlights page
- [x] `GET /api/settings` — public site settings from DB with config fallback
- [x] `POST /api/admin/race/create` — create new race + entries for all active pets
- [x] `PATCH /api/admin/race/status` — transition race status (syncs isLive)
- [x] `POST /api/admin/race/finish` — record positions, award win, turn off live
- [x] `GET /api/admin/wallet` — SOL balances for all tracked addresses via RPC
- [x] `GET /api/admin/users` — paginated user list with cheer stats
- [x] `GET/PATCH /api/admin/history` — race history + recap editing

### Security
- [x] On-chain TX verification — `POST /api/user/claim-reward` verifies signature on Solana before marking rewardPushed
- [x] Admin route defense-in-depth — all admin race routes read JWT cookie directly (not just middleware)
- [x] SameSite=Strict cookies — prevents CSRF via cross-site navigation
- [x] Pet ID validation on cheer endpoint — rejects invalid petId before DB upsert
- [x] `SECURITY.md` — documents all patches and deployment hardening checklist

### Mobile UX
- [x] CheerModal — bottom sheet on mobile (slide-up, pull handle, safe-area padding)
- [x] Win celebration overlay — full-screen confetti + Share to X button
- [x] MobileStickyCheerBar — fixed bottom CTA with countdown pill + frenzy mode
- [x] HamsterCard — larger image (220px mobile), 52px min-height cheer button
- [x] Touch targets — all interactive elements ≥44px (WCAG AAA)
- [x] Font labels — all labels ≥11px

### Infrastructure
- [x] Prisma schema — all models (Pet, Race, RaceEntry, Donation, Sponsor, Media, User, Cheer, SiteSettings)
- [x] SiteSettings.hamstarMint + hamstarPoolAddress — DB columns added and synced (prisma db push)
- [x] Supabase realtime + 30s polling fallback for live pool updates
- [x] Helius webhook receiver (`/api/webhook`) — SOL donation tracking
- [x] Deterministic 48h race schedule (`race-scheduler.ts`)
- [x] Admin auth: JWT session (jose), bcrypt password hash
- [x] PWA manifest + meta tags → homescreen installability
- [x] `tsconfig.json` excludes `hamstar-program/` from Next.js type-checking
- [x] Deployed to Vercel — live at hamstar.io

### Design System
- [x] Inline `React.CSSProperties` — no Tailwind, no CSS modules
- [x] Design tokens (`/lib/theme.ts`) — `T.*` tokens
- [x] Kanit (headings) + Pretendard (body)
- [x] `useIsMobile()` — single 768px breakpoint
- [x] Component library (`/components/ui/index.tsx`)

---

## Pending / What's Left

### 🔴 Launch Blockers

- [ ] **Deploy Anchor program to mainnet-beta** — `anchor deploy --provider.cluster mainnet-beta`; update `PROGRAM_ID` in `lib/hamstar-program.ts`; call `create_upset_reserve` once
- [ ] **Launch $HAMSTAR token** — deploy SPL token; update `hamstarMint` in admin Settings and `HAMSTAR_MINT` in `lib/hamstar-token.ts`
- [ ] **Real stream URL** — set stream URL in admin Settings → Race → Stream URL
- [ ] **Production env vars** — ADMIN_KEYPAIR, TREASURY_WALLET, SETTLER_2_KEYPAIR on host
- [x] **Real pet wallet addresses** — Dash/Flash/Turbo wallet addresses set in DB and `.env.local`
- [x] **Helius webhook** — API key + secret configured in Vercel env; wallets registered manually in Helius dashboard
- [x] **Admin auth** — JWT session auth re-enabled in `middleware.ts`; login page working at `/admin/login`

### 🟡 On-Chain Integration

- [ ] **Wire Cheer button → `place_cheer` instruction** — currently records locally + DB only; needs `@coral-xyz/anchor` client + deployed IDL
- [ ] **Real HAMSTAR mint address** — replace placeholder in `lib/hamstar-token.ts` with actual SPL mint once launched
- [ ] **Real Jupiter pool URL** — update once liquidity is seeded
- [ ] **On-chain streak fetch** — `ArenaClient` has the fetch logic wired; works once program is deployed

### 🟠 Seeker / Mobile Store

- [ ] **Create proper app icons** — 192×192 and 512×512 PNG (Hamstar logo, not sunflower cursor); update `manifest.json`
- [ ] **Add PWA service worker** — `npm install next-pwa`, wrap `next.config.js`
- [ ] **Capture store screenshots** — 3× portrait 1080×1920 (arena, cheer, win); add to `manifest.json`
- [ ] **Change start_url** — `manifest.json` from `"/"` to `"/arena"`
- [ ] **Generate signing keystore** — `keytool -genkey`, save `.jks` securely
- [ ] **Create `assetlinks.json`** — `public/.well-known/assetlinks.json` with keystore SHA-256
- [ ] **Bubblewrap init** — `bubblewrap init --manifest https://hamstarhub.xyz/manifest.json`
- [ ] **Build and sign APK** — `bubblewrap build`
- [ ] **Submit to dApp Store** — fork `solana-mobile/dapp-publishing`, create listing YAML, submit

See `docs/SEEKER.md` for full instructions on each step.

### 🟢 Nice to Have

- [ ] **Watch Live Race button** — set real stream URL in admin so the button links somewhere
- [ ] **Race replay URL** — admin Settings → Replay URL for post-race "Watch Replay" CTA
- [ ] **Rate limiting on /api/user/cheer** — add in middleware or route handler
- [ ] **Sponsor page** — removed; if sponsors come in, can re-add as a simple page
- [ ] **`effectiveResult` cleanup** — dead ternary in ArenaClient.tsx line 87 (same value both branches)

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | Prisma + PostgreSQL (Supabase) |
| Realtime | Supabase Realtime |
| Solana | `@solana/wallet-adapter-react` 0.15.39 |
| Mobile | `@solana-mobile/wallet-adapter-mobile` (MWA 2.0) |
| Auth | Privy — email, Google, Apple + embedded wallets |
| Smart Contract | Anchor 0.30 — `hamstar-program` |
| Media | Cloudinary |
| Session | JWT (jose) — currently bypassed |
| Styling | Inline `React.CSSProperties` |
| Fonts | Kanit (Google) + Pretendard (CDN) |
| Hosting | Vercel (hamstar.io) |
