# Hamstar

Hamster racing platform. Three racers, live stream on pump.fun, community-driven.

> **This is v1** — a fully deployable static site driven by `config/site.ts`. No database or blockchain required.
> For the full live platform (real-time donations, Solana wallet integration, automated race tracking), see **[INTEGRATION.md](./INTEGRATION.md)**.

---

## Running locally

**Requirements:** Node 18+

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No database, no API keys, no environment variables needed for v1.

---

## How to update content

Everything is controlled from one file: **`config/site.ts`**

Make a change, save — the site updates instantly via hot reload.

### Toggle live / upcoming

```ts
stream: {
  isLive: true,   // true = LIVE badge + "Watch Live" CTA
  url: 'https://pump.fun/your-token',
  raceNumber: 1,
},
```

### Update social links

```ts
socials: {
  twitter:   'https://twitter.com/hamstar',
  tiktok:    'https://tiktok.com/@hamstar',
  instagram: 'https://instagram.com/hamstar',
  youtube:   'https://youtube.com/@hamstar',
},
```

Leave a field as `''` to hide that button.

### Edit a pet profile

```ts
{
  id:       'hammy',
  name:     'Hammy',
  emoji:    '🐹',
  tagline:  "Hammy doesn't lose. Until he does.",
  bio:      'Your bio here...',
  speed:    78,
  chaos:    45,
  wins:     3,
  snackLevel: 65,  // 0–100, lifestyle display
  cageLevel:  70,
  image:    '',    // see "Adding images" below
},
```

### Record a race result

After each race, add an entry to `RACE_HISTORY`:

```ts
export const RACE_HISTORY: RaceResult[] = [
  { number: 1, date: '2025-04-01', positions: ['hammy', 'nugget', 'whiskers'] },
  //                                            ^ 1st     ^ 2nd     ^ 3rd
]
```

Pet IDs: `'hammy'` `'whiskers'` `'nugget'`

### Add a sponsor

```ts
export const SPONSORS: Sponsor[] = [
  {
    id:    's1',
    name:  'AcmeCorp',
    emoji: '🚀',
    tier:  'GOLD',       // 'TITLE' | 'GOLD' | 'SILVER'
    petId: 'hammy',      // optional — which racer they back
    url:   'https://acme.com',  // optional — makes their card clickable
  },
]
```

---

## Adding images and videos

### Pet photos

1. Drop the image into `/public/pets/` (e.g. `hammy.jpg`)
2. Set `image: '/pets/hammy.jpg'` on the pet in `config/site.ts`
3. Leave `image: ''` to show the emoji instead

### Media gallery (Community tab)

Add entries to the `MEDIA` array in `config/site.ts`:

**Photo:**
```ts
{
  id:          'photo-1',
  type:        'PHOTO',
  title:       'Nugget post-race',
  url:         '/media/nugget-photo.jpg',  // put file in /public/media/
  featured:    false,
  publishedAt: '2025-04-01',
},
```

**YouTube video:**
```ts
{
  id:          'race1-highlight',
  type:        'VIDEO',
  title:       'Race #1 Highlights',
  description: 'Optional description',
  url:         'https://youtube.com/watch?v=VIDEO_ID',
  thumbnail:   'https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg',
  duration:    '2:14',
  featured:    true,
  publishedAt: '2025-04-01',
},
```

Clicking a video card opens the link in a new tab.

### External image hosting

To keep images out of the repo, use any public URL directly:
- **Cloudinary** — free tier, great CDN. Upload at [cloudinary.com](https://cloudinary.com), paste the URL.
- YouTube thumbnails, TikTok links, or any direct image URL all work.

---

## Project structure

```
hamstar/
├── config/
│   └── site.ts           ← Edit this to update all site content
├── app/
│   ├── page.tsx           Main SPA
│   └── layout.tsx         HTML head / metadata
├── components/
│   ├── Nav.tsx
│   ├── ui/index.tsx       Theme colors + shared UI components
│   └── views/
│       ├── RaceView.tsx
│       ├── PetsView.tsx
│       ├── CommunityView.tsx
│       ├── SponsorsView.tsx
│       └── ArenasView.tsx
├── public/
│   ├── pets/              ← Drop pet photos here
│   └── media/             ← Drop gallery images here
│
│ ── v2 service layer (wired up, needs credentials) ──
├── lib/
│   ├── prisma.ts          Prisma client singleton
│   ├── supabase.ts        Supabase client + realtime helpers
│   ├── helius.ts          Solana webhook processor
│   ├── race-scheduler.ts  Deterministic 48h race timing
│   └── hooks/
│       ├── useRace.ts     Race data + realtime subscription
│       └── useCountdown.ts
├── app/api/
│   ├── races/route.ts
│   ├── pets/route.ts
│   ├── sponsors/route.ts
│   ├── media/route.ts
│   └── webhook/route.ts   Helius donation webhook
├── prisma/
│   └── schema.prisma      Full database schema
└── scripts/
    ├── seed.ts            Initialize the database
    ├── finish-race.ts     Close a race + create the next one
    └── setup-helius.ts    Register Solana webhook
```

---

## Deploying to Vercel (v1 — no database)

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. No environment variables needed — deploy as-is

To update content after deploy: edit `config/site.ts`, push to GitHub — Vercel redeploys automatically (~30 seconds).

---

## Setting up v2 (database + blockchain)

All v2 code is already written and in the repo. You just need credentials.

### 1. Create a `.env.local` file

Copy the example and fill in each value:

```bash
cp .env.example .env.local
```

Open `.env.local` — every field has an empty string. Fill these in:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Supabase → Settings → Database → **Pooling** connection string |
| `DIRECT_URL` | Supabase → Settings → Database → **Direct** connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `HELIUS_API_KEY` | [dev.helius.xyz](https://dev.helius.xyz) → API Keys |
| `HELIUS_WEBHOOK_SECRET` | Run `openssl rand -hex 32` and paste the output |
| `HAMMY_WALLET` | Create a Solana wallet in Phantom → copy the **public** address |
| `WHISKERS_WALLET` | Same |
| `NUGGET_WALLET` | Same |
| `GENESIS_TIMESTAMP` | `new Date('2025-04-01T18:00:00Z').getTime()` — your Race #1 start time |
| `NEXT_PUBLIC_SITE_URL` | Your Vercel domain (fill in after deploying) |

### 2. Push the schema and seed the database

```bash
npm run db:push   # creates all tables in Supabase
npm run seed      # creates pets, upgrade catalog, and Race #1
```

The seed script reads pet profiles from `config/site.ts` and wallet addresses from `.env.local` — so your config stays as the single source of truth.

### 3. Deploy to Vercel

Add all `.env.local` values to **Vercel → Project → Settings → Environment Variables**, then redeploy.

### 4. Register the Helius webhook

After your site is live at its domain:

```bash
npm run setup-helius
```

This tells Helius to ping `/api/webhook` every time SOL is sent to any pet wallet. Donations are then indexed automatically in real time.

### 5. Operational commands

**After each race ends:**
```bash
npm run finish-race       # closes current race, sets positions, creates next race
npm run finish-race 3     # or specify a race number explicitly
```

**Browse the database:**
```bash
npm run db:studio         # opens Prisma Studio at localhost:5555
```

For full technical details on wiring the view components to the API (swapping from config-driven to live data), see **[INTEGRATION.md](./INTEGRATION.md)**.
