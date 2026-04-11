# HamstarHub

Live hamster racing on Solana. Three hamsters race, the community cheers with $HAMSTAR tokens, and the winning cheerers share the reward pool. Races are live-streamed. Results are settled on-chain via 2-of-3 multisig. Built as a PWA with full Solana Mobile / Seeker support.

---

## Repo structure

```
hamstarhub/          ← Next.js 14 web app + admin panel
hamstar-program/     ← Solana smart contract (Anchor 0.30)
docs/                ← PROGRESS.md · SEEKER.md · CONTENT.md · FEATURES.md
```

---

## How it works

```
Admin creates race on-chain → pick window opens
Users cheer (stake $HAMSTAR on a hamster) — time-weighted
Pick window closes
Race streams live
2-of-3 settler keys confirm winner on-chain
Rewards distributed to winning cheerers
Dark horse bonus paid from upset reserve if low-odds hamster wins
```

### Reward mechanics

- **Time-weighted pari-mutuel** — early cheers get up to 1.5× weight, late cheers as low as 1.0×
- **Dark horse bonus** — if the winner had < 20% of the pool, winners receive a bonus from the upset reserve
- **Hot streak multiplier** — consecutive race winners get +0.2× (2-win streak) or +0.4× (3+ wins)
- **Fee split** — configurable via admin; default 3% total: treasury / burn / upset reserve
- All fee and bonus parameters are editable from the admin panel with no redeployment

---

## Racers

| | Dash | Flash | Turbo |
|--|------|-------|-------|
| Archetype | The People's Champ | The Chaos Agent | The Dark Horse |
| Color | Red `#FF3B3B` | Magenta `#FF00CC` | Cyan `#00D4FF` |
| Speed / Chaos | 78 / 45 | 83 / 91 | 71 / 62 |
| Tagline | "Always ready. Always fast." | "Chaos energy. Anything can happen." | "Fast. Focused. Never the same twice." |

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | Prisma + PostgreSQL (Supabase) |
| Realtime | Supabase Realtime subscriptions |
| Solana | `@solana/wallet-adapter-react` — all Wallet Standard wallets |
| Mobile wallet | `@solana-mobile/wallet-adapter-mobile` (MWA 2.0) — Seeker + Android |
| Auth | Privy — email, Google, Apple + embedded wallets |
| Smart contract | Anchor 0.30 (`hamstar-program`) |
| Solana indexing | Helius webhooks |
| Media | Cloudinary |
| Admin session | JWT (jose, edge-safe) + bcrypt |
| Styling | Inline `React.CSSProperties` — no Tailwind, no CSS modules |
| Fonts | Kanit (headings) + Pretendard (body) |
| PWA | Custom service worker (`public/sw.js`) — installable on Android/iOS |
| Deployment | Vercel |

---

## Pre-launch mode

The app ships in a fully functional **pre-launch mode** until the $HAMSTAR SPL token and Anchor program are deployed to mainnet. In this state:

- All pages (landing, arena, pet profiles, highlights) work normally
- Wallet connection works across all adapters
- Cheers are recorded off-chain; the CheerModal displays a "Pre-launch mode" banner so users know no token transaction is sent
- Admin panel is fully operational for race management, content editing, and settings
- On-chain settlement, reward distribution, and token balance checks are dormant

**To exit pre-launch mode** (no redeployment needed):
1. Deploy the Anchor program to mainnet-beta and set `NEXT_PUBLIC_PROGRAM_ID`
2. Launch the $HAMSTAR SPL token
3. Update the mint address in admin Settings → $HAMSTAR Mint

The mint address update flips the entire app live instantly.

---

## Running locally

**Requirements:** Node 18+

```bash
cd hamstarhub
npm install
cp .env.example .env.local   # fill in values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app loads without a database — content falls back to static defaults. Full functionality (live race data, on-chain ops, wallet balances) requires the env vars below.

---

## Environment variables

### Required

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase pooling connection string |
| `DIRECT_URL` | Supabase direct connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `JWT_SECRET` | `openssl rand -hex 32` — signs admin sessions |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of admin password — `bcrypt.hashSync(password, 10)` |

### Solana / on-chain

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_PROGRAM_ID` | Deployed Anchor program address |
| `ADMIN_KEYPAIR` | Base58 secret key of admin wallet (signs on-chain instructions) |
| `TREASURY_WALLET` | Base58 public key of treasury wallet |
| `SETTLER_2_KEYPAIR` | Base58 secret key of second settler (2-of-3 settlement) |
| `NEXT_PUBLIC_HELIUS_RPC` | Helius RPC URL (falls back to public mainnet-beta) |
| `HELIUS_API_KEY` | [dev.helius.xyz](https://dev.helius.xyz) → API Keys |
| `HELIUS_WEBHOOK_SECRET` | `openssl rand -hex 32` |

### Optional

| Variable | Description |
|---|---|
| `SOLANA_RPC_URL` | Override RPC for all server-side calls |
| `NEXT_PUBLIC_PRIVY_APP_ID` | Privy dashboard app ID (social login + embedded wallets) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary (admin media uploads) |
| `CLOUDINARY_API_KEY` | Cloudinary |
| `CLOUDINARY_API_SECRET` | Cloudinary |
| `GENESIS_TIMESTAMP` | Unix ms of Race #1 start (for race scheduler) |

---

## Database

```bash
npx prisma db push         # sync schema to Supabase (first-time or after schema changes)
npx prisma migrate deploy  # run pending migrations (production)
npx tsx scripts/seed-settings.ts  # seed default SiteSettings row
npx prisma studio          # browse data at localhost:5555
```

---

## Project structure

```
hamstarhub/
  app/
    layout.tsx              Root layout — fonts, metadata, PWA, providers
    page.tsx                Landing page (HomeLanding)
    arena/page.tsx          Live race arena
    pet/page.tsx            Hamster profiles
    highlights/page.tsx     Race highlights + media gallery
    admin/                  Password-protected admin panel
      dashboard/            Stats, quick links, recent cheers
      race/                 Full race lifecycle (create → live → finish → settle → rewards)
      history/              Past races, podium, recap editor
      wallet/               SOL + $HAMSTAR balances for all wallets
      users/                Paginated user table with cheer stats
      pets/                 Edit hamster profiles, stats, images
      sponsors/             Sponsor CRUD
      media/                Video/photo uploads via Cloudinary
      content/              All editable page copy (hero, about, footer, modals)
      settings/             Race config, social links, $HAMSTAR token addresses
      program/              On-chain ProgramConfig editor (fees, bonuses, limits)
    api/                    API routes (admin + public)

  components/
    ui/index.tsx            LimeButton, OutlineButton, Tag, RaceBar,
                            LivePulse, CheckerBar, SolAddress, useIsMobile
    landing/                Landing sections + LegalModal, HowItWorksModal, RaceRulesModal
    arena/                  ArenaClient, HamsterCard, CheerModal, win overlay, sticky CTA
    pet/                    PetPageClient
    wallet/                 WalletProvider.tsx (MWA + Wallet Standard + Privy)
    ServiceWorkerRegistration.tsx   PWA service worker registration

  lib/
    theme.ts                Design tokens (T object)
    hamstar-program.ts      On-chain instruction builders + PDA helpers + config deserializer
    hamstar-token.ts        $HAMSTAR token config, fan tiers, balance fetch
    admin-signer.ts         Server-side keypair loader + sendAdminTx helper
    auth.ts                 JWT session (jose) + bcrypt
    race-scheduler.ts       Deterministic 48h race schedule
    helius.ts               Solana webhook processor
    prisma.ts               PrismaClient singleton
    supabase.ts             Supabase realtime client
    hooks/useRace.ts        Race data + Supabase realtime + 30s polling fallback
    hooks/useCountdown.ts   Countdown timer

  config/
    site.ts                 PETS array, SITE config, RACE_HISTORY
    decorations.ts          Decorative image layer config

  public/
    manifest.json           PWA manifest (icons, start_url: /arena, screenshots)
    sw.js                   Service worker — app shell caching, offline support
    images/                 PNG assets including app-icon-192.png, app-icon-512.png
    screenshots/            Store screenshots (1080×1920) — replace with real device captures
    .well-known/            (create assetlinks.json here for dApp Store TWA)

  prisma/schema.prisma      Full database schema
  SECURITY.md               Security audit + patch notes
  docs/
    PROGRESS.md             Feature checklist + launch blockers
    SEEKER.md               Solana Mobile / dApp Store launch guide
    CONTENT.md              Higgsfield AI content strategy
```

---

## Smart contract

**Framework:** Anchor 0.30 · **Network:** devnet (mainnet pending token launch)

### Instructions

| Instruction | Description |
|---|---|
| `initialize` | Deploy ProgramConfig PDA with initial fee/bonus params |
| `update_config` | Admin-only: update fee splits, bonuses, limits without redeployment |
| `create_race` | Admin opens a race with pick window + PDA escrow |
| `place_cheer` | User stakes $HAMSTAR; time-weighted + streak bonus applied |
| `lock_race` | Permissionless lock after pick window closes |
| `propose_settlement` | Settler 1 submits winner index |
| `confirm_settlement` | Settler 2 confirms → race settled, rewards unlocked |
| `push_reward` | Admin batch-pushes $HAMSTAR to a winning wallet |
| `claim_reward` | User self-claims their reward |
| `cancel_race` | Admin cancel → full refund path |
| `claim_refund` | User claims refund on cancelled race |

### Building

```bash
cd hamstar-program
avm use 0.30.1
anchor build
anchor deploy --provider.cluster devnet    # devnet
anchor deploy --provider.cluster mainnet-beta  # production
```

Requires: Rust, Solana CLI 1.18+, Anchor 0.30.1.

---

## Admin panel

Visit `/admin/login` — password set via `ADMIN_PASSWORD_HASH` env var.

| Page | What it does |
|---|---|
| Dashboard | Stats overview, $HAMSTAR token status, recent cheers |
| Race Control | Full race lifecycle: create → LIVE → finish → settle on-chain → push rewards |
| History | Past race results, podium, recap editor |
| Wallet | Live SOL + $HAMSTAR balances for all tracked wallets |
| Users | Paginated supporter table, win rates, favourite hamster |
| Hamsters | Edit name, bio, stats, color, image per hamster |
| Sponsors | CRUD sponsor entries with tiers |
| Media | Upload videos/photos via Cloudinary (appears on Highlights page) |
| Content | Edit all page copy without redeployment |
| Settings | Race config, social links, $HAMSTAR mint + pool addresses |
| Program | On-chain fee editor — update_config transaction, animated fee bar |

---

## Solana Mobile / Seeker

HamstarHub works on Solana Seeker with zero extra configuration:

- `SolanaMobileWalletAdapter` activates automatically on Android Chrome
- Users connect via the Seed Vault Wallet — hardware TEE-backed key storage
- PWA manifest configured — `display: standalone`, portrait lock, correct icon
- Service worker registered — app is installable from Chrome on Seeker

**To appear in the Solana Mobile dApp Store:**
1. Fix screenshots in `public/screenshots/` with real device captures
2. Generate a signing keystore + create `public/.well-known/assetlinks.json`
3. Run `bubblewrap init --manifest https://hamstarhub.xyz/manifest.json` → `bubblewrap build`
4. Submit via `dapp-store` CLI

See [`docs/SEEKER.md`](./docs/SEEKER.md) for the complete step-by-step guide.

---

## Security

All critical security patches are documented in [`SECURITY.md`](./SECURITY.md).

Key mitigations in place:

- **Middleware auth** — all `/api/admin/*` routes are protected at the edge via `middleware.ts`; unauthenticated requests receive 401 before reaching any handler
- **Admin login rate limiting** — 5 attempts per IP per 15 minutes; returns 429 on breach
- **Deep on-chain TX verification** — `POST /api/user/cheer` parses the `place_cheer` instruction discriminator and verifies `raceId`, `hamsterIndex`, and `amount` all match the submitted values before recording a cheer
- **SameSite=Strict cookies** — prevents CSRF on admin session
- **Input validation** — petId validated against DB; wallet addresses validated via `new PublicKey()` before any DB write
- **Pre-launch mode** — while `HAMSTAR_MINT` is a placeholder, the CheerModal clearly labels cheers as off-chain and skips all token transaction logic

---

## Deploying

1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add all env vars under **Settings → Environment Variables**
4. Deploy — Vercel redeploys automatically on every push to `main`

After deploy:
```bash
npx prisma migrate deploy   # run DB migrations
npx tsx scripts/seed-settings.ts   # seed default settings row
```

Register Helius webhook:
- Endpoint: `https://yourdomain.xyz/api/webhook`
- Account addresses: treasury wallet + all pet wallet addresses
- Auth header: `x-helius-webhook-secret: YOUR_HELIUS_WEBHOOK_SECRET`

---

## Launch checklist

See [`docs/PROGRESS.md`](./docs/PROGRESS.md) for the full checklist. Critical path:

```
[ ] Deploy Anchor program to mainnet-beta
[ ] Run initialize instruction (admin panel → Program → Initialize)
[ ] Launch $HAMSTAR SPL token
[ ] Update hamstarMint in admin Settings (exits pre-launch mode instantly)
[ ] Set NEXT_PUBLIC_PROGRAM_ID, ADMIN_KEYPAIR, TREASURY_WALLET, SETTLER_2_KEYPAIR on host
[ ] Register Helius webhook on production domain
[ ] Replace public/screenshots/ with real device captures
[ ] Submit to Solana Mobile dApp Store
```
