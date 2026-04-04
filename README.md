# HamstarHub

Live hamster racing on Solana. Three hamsters race, the community cheers with HAMSTAR tokens, and the winning cheerers share the reward pool. Races are live-streamed. Results are settled on-chain via 2-of-3 multisig.

---

## Repo Structure

```
hamstarhub/          ← Next.js web app
hamstar-program/     ← Solana smart contract (Anchor)
```

---

## Smart Contract

**Framework:** Anchor 0.30.1 (Rust) · **Network:** Solana devnet → mainnet

The race pool contract handles the full lifecycle — token escrow, time-weighted reward distribution, 2-of-3 multisig settlement, and refunds. See [`hamstar-program/smartcontract.md`](./hamstar-program/smartcontract.md) for the full spec.

### How it works

```
Admin creates race → pick window opens
Users cheer (stake HAMSTAR tokens on a hamster)
Pick window closes (PICK LOCK)
Race goes live on stream
2 of 3 settler keys submit the winner on-chain
Rewards auto-distributed to winning cheerers
```

### Reward mechanic — time-weighted pari-mutuel

Cheering early gives you a higher weight multiplier (1.5x at open → 1.0x at lock). Winners split the pool proportionally by weight. 3% platform fee: 2.5% treasury + 0.5% burn.

### Building the contract

```bash
cd hamstar-program
cargo build-sbf
```

Requires: Rust, Solana CLI, Anchor 0.30.1 (`avm use 0.30.1`).

---

## Web App Stack

- **Framework:** Next.js 14 (App Router)
- **Wallet:** Solana Wallet Adapter (Phantom, Backpack, Solflare, all Wallet Standard wallets)
- **Database:** PostgreSQL via Prisma + Supabase
- **Realtime:** Supabase Realtime (live arena updates)
- **Solana indexing:** Helius webhooks
- **Styling:** Inline React.CSSProperties — no Tailwind, no CSS modules
- **Fonts:** Kanit (headings) + Pretendard (body)
- **Deployment:** Vercel

---

## Running locally

**Requirements:** Node 18+

```bash
cd hamstarhub
npm install
cp .env.example .env.local   # fill in values (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The site loads without a database — content falls back to defaults. For full functionality (live race data, wallet balances, donation tracking) you need the env vars below.

---

## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase → Settings → Database → Pooling connection string |
| `DIRECT_URL` | Supabase → Settings → Database → Direct connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `NEXT_PUBLIC_HELIUS_RPC` | Helius RPC URL (falls back to public mainnet if unset) |
| `HELIUS_API_KEY` | [dev.helius.xyz](https://dev.helius.xyz) → API Keys |
| `HELIUS_WEBHOOK_SECRET` | `openssl rand -hex 32` |
| `GENESIS_TIMESTAMP` | Unix ms of Race #1 start |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary (admin media uploads) |
| `CLOUDINARY_API_KEY` | Cloudinary |
| `CLOUDINARY_API_SECRET` | Cloudinary |
| `ADMIN_PASSWORD` | Password for `/admin` panel |
| `JWT_SECRET` | `openssl rand -hex 32` — signs admin sessions |

---

## Database setup

```bash
cd hamstarhub
npx prisma db push    # sync schema to Supabase
npx prisma db seed    # seed pets, upgrade catalog, Race #1
npx prisma studio     # browse data at localhost:5555
```

---

## Project structure

```
hamstarhub/
  app/
    layout.tsx              Root layout — fonts, metadata, providers
    page.tsx                Landing page
    arena/page.tsx          Live race arena
    pet/page.tsx            Hamster profiles
    sponsors/page.tsx       Sponsors page
    highlights/page.tsx     Race highlights
    admin/                  Password-protected admin panel
    api/                    API routes

  components/
    ui/index.tsx            Core UI: LimeButton, OutlineButton, Tag, RaceBar,
                            LivePulse, CheckerBar, SolAddress, useIsMobile
    landing/                Landing page sections + all modals
    arena/                  Arena, HamsterCard, HighlightSection
    pet/                    Pet profile page
    sponsors/               Sponsors page
    wallet/                 Providers.tsx, WalletProvider.tsx

  lib/
    theme.ts                Design tokens (T object)
    fonts.ts                Kanit font loader
    race-scheduler.ts       Deterministic 48h race schedule
    helius.ts               Solana webhook processor
    auth.ts                 JWT admin session (jose, edge-safe)
    prisma.ts               PrismaClient singleton
    supabase.ts             Supabase realtime client
    hooks/useRace.ts        Race data + Supabase realtime + 30s polling
    hooks/useCountdown.ts   Countdown timer

  config/
    site.ts                 PETS array, SITE config, RACE_HISTORY
    decorations.ts          Decorative image layer config

  prisma/schema.prisma      Full database schema
  public/images/            PNG assets

hamstar-program/
  programs/hamstar-program/src/
    lib.rs                  Program entry + instruction routing
    errors.rs               HamstarError enum
    state/                  ProgramConfig, Race, CheerPosition accounts
    instructions/           All 10 instructions
  tests/hamstar-program.ts  Integration test suite (in progress)
  smartcontract.md          Full contract spec + build status
```

---

## Status

### Working
- Wallet connect (Phantom, Backpack, Solflare, all Wallet Standard wallets)
- Landing page, arena, pet profiles, sponsors, highlights
- Admin panel (site content, stream URL, race management, media)
- Race schedule (deterministic 48h slots)
- Supabase realtime subscriptions for live arena updates
- Helius webhook processor

### Smart contract — in progress
- ✅ All 10 instructions written and compiling
- ⬜ TypeScript test suite
- ⬜ Devnet deploy
- ⬜ Admin panel integration (create race, settle, push rewards)
- ⬜ Arena UI integration (cheer button, live odds, reward display)
- ⬜ External audit (OtterSec / Sec3) before mainnet

### Still needed for full launch
1. **HAMSTAR token** — pump.fun launch, then update mint address in `ProgramConfig`
2. **Treasury multisig** — Squads Protocol 2-of-3 before mainnet
3. **Settler keypairs** — designate 3 settlement authority wallets
4. **Helius webhook** — configure for HAMSTAR token transfers

---

## Admin panel

Visit `/admin` — password set via `ADMIN_PASSWORD` env var.

Manage: site content, stream URL, live toggle, race number, social links, hamster profiles, sponsors, media gallery.

---

## Deploying

1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Add all env vars under **Settings → Environment Variables**
4. Deploy — Vercel redeploys automatically on every push to `main`
