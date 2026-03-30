# Hamstar

Live hamster racing on Solana. Three hamsters race, community cheers with SOL, the champion's supporters share the reward pool. Races are streamed live on Pump.fun.

---

## Stack

- **Framework:** Next.js 14 (App Router)
- **Wallet:** Solana Wallet Adapter (Phantom, Backpack, Solflare, all Wallet Standard wallets)
- **Database:** PostgreSQL via Prisma + Supabase
- **Realtime:** Supabase Realtime (live arena bar updates)
- **Solana indexing:** Helius webhooks (donation tracking)
- **Styling:** Inline React.CSSProperties — no Tailwind, no CSS modules
- **Fonts:** Kanit (headings) + Pretendard (body)
- **Deployment:** Vercel

---

## Running locally

**Requirements:** Node 18+

```bash
npm install
cp .env.example .env.local   # fill in values (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The site loads without a database — content falls back to defaults. For full functionality (live race data, wallet balances, donation tracking) you need the env vars below.

---

## Environment variables

Create `.env.local` from the example and fill in:

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
| `HAMMY_WALLET` | Solana public address for Hammy's donation wallet |
| `WHISKERS_WALLET` | Solana public address for Whiskers' donation wallet |
| `NUGGET_WALLET` | Solana public address for Nugget's donation wallet |
| `GENESIS_TIMESTAMP` | Unix ms of Race #1 start — e.g. `new Date('2025-04-01T18:00:00Z').getTime()` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary (admin media uploads) |
| `CLOUDINARY_API_KEY` | Cloudinary |
| `CLOUDINARY_API_SECRET` | Cloudinary |
| `ADMIN_PASSWORD` | Password for `/admin` panel |
| `JWT_SECRET` | `openssl rand -hex 32` — signs admin sessions |

---

## Database setup

```bash
npx prisma db push    # sync schema to Supabase
npx prisma db seed    # seed pets, upgrade catalog, Race #1
npx prisma studio     # browse data at localhost:5555
```

---

## Project structure

```
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
  hamstar-token.ts        $HAMSTAR token config + fan tier system
  race-scheduler.ts       Deterministic 48h race schedule
  helius.ts               Solana webhook processor
  cheer-history.ts        Client-side cheer history (localStorage)
  auth.ts                 JWT admin session (jose, edge-safe)
  prisma.ts               PrismaClient singleton
  supabase.ts             Supabase realtime client
  hooks/useRace.ts        Race data + Supabase realtime + 30s polling
  hooks/useCountdown.ts   Countdown timer

config/
  site.ts                 PETS array, SITE config, RACE_HISTORY
  decorations.ts          Decorative image layer config

prisma/schema.prisma      Full database schema
public/images/            29 PNG assets
```

---

## What's live vs. still needed

### Working
- Wallet connect (all Wallet Standard wallets — Phantom, Backpack, Solflare, etc.)
- Landing page, arena, pet profiles, sponsors, highlights
- Admin panel (site content, stream URL, race management, media)
- User records created on wallet connect
- Helius webhook processor — indexes SOL donations into DB
- Race schedule (deterministic 48h slots)
- Fan tier system (SOL balance thresholds)
- Supabase realtime subscriptions for live bar updates

### Still needed to go fully live
1. **Hamster wallet addresses** — set `HAMMY_WALLET`, `WHISKERS_WALLET`, `NUGGET_WALLET` in env
2. **Helius webhook** — configure Helius to POST to `https://hamstar.io/api/webhooks/helius` for each pet wallet
3. **$HAMSTAR token launch** — update mint address + Jupiter URL in `lib/hamstar-token.ts`
4. **Wire real donation data into arena UI** — replace mocked `MOCK_SUPPORT`/`MOCK_TOTAL_SOL` in `ArenaClient.tsx` with live DB data
5. **Actual cheer transaction flow** — clicking Cheer should trigger a SOL transfer to the hamster's wallet; Helius detects it and updates the arena in real time
6. **Supabase realtime env vars** — set `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` for live arena updates
7. **Race winner + payout logic** — admin declares winner, prize pool distributes to supporters

---

## Admin panel

Visit `/admin` — password set via `ADMIN_PASSWORD` env var.

Manage: site content, stream URL, live toggle, race number, social links, how-it-works steps, hamster profiles, sponsors, media gallery.

---

## Deploying

1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Add all env vars under **Settings → Environment Variables**
4. Deploy — Vercel redeploys automatically on every push to `main`
