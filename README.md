# HamstarHub

Hamster racing platform. Three racers, live stream on pump.fun, community-driven.

---

## Running locally

**Requirements:** Node 18+

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

That's it — no database, no API keys, no environment variables needed for v1.

---

## How to update content

Everything is controlled from a single file: **`config/site.ts`**

Open it, make changes, save — the site updates instantly in dev (hot reload).

### Toggle live / upcoming

```ts
stream: {
  isLive: true,          // true = show LIVE badge + "Watch Live" CTA
  url: 'https://pump.fun/your-token',
  raceNumber: 1,
},
```

### Add a social link

```ts
socials: {
  twitter: 'https://twitter.com/hamstarhub',
  tiktok: 'https://tiktok.com/@hamstarhub',
  instagram: '',   // leave empty to hide the button
  youtube: '',
},
```

### Edit a pet profile

Find the pet in the `PETS` array and edit any field:

```ts
{
  id: 'hammy',
  name: 'Hammy',
  emoji: '🐹',
  tagline: "The people's champ",
  bio: 'Your bio text here...',
  speed: 78,
  chaos: 45,
  wins: 3,
  snackLevel: 65,   // 0–100, lifestyle display
  cageLevel: 70,
  image: '',        // see "Adding images" below
  sponsors: [],
},
```

### Record a race result

After a race, add an entry to `RACE_HISTORY`:

```ts
export const RACE_HISTORY: RaceResult[] = [
  { number: 1, date: '2025-03-15', positions: ['hammy', 'nugget', 'whiskers'] },
  //                                            ^ 1st     ^ 2nd     ^ 3rd
]
```

Use pet IDs: `'hammy'`, `'whiskers'`, `'nugget'`.

### Add a sponsor

```ts
export const SPONSORS: Sponsor[] = [
  {
    id: 's1',
    name: 'AcmeCorp',
    emoji: '🚀',
    tier: 'GOLD',          // 'TITLE' | 'GOLD' | 'SILVER'
    petId: 'hammy',        // optional — which racer they back
    url: 'https://acme.com',  // optional — makes their card clickable
  },
]
```

---

## Adding images and videos

### Pet photos

1. Drop your image file into `/public/pets/` (e.g. `hammy.jpg`)
2. Set `image: '/pets/hammy.jpg'` on the pet in `config/site.ts`
3. Leave `image: ''` to show the emoji instead

### Media gallery (Community tab)

Add entries to the `MEDIA` array in `config/site.ts`:

**Photo:**
```ts
{
  id: 'photo-1',
  type: 'PHOTO',
  title: 'Nugget post-race',
  url: '/media/nugget-photo.jpg',   // put file in /public/media/
  featured: false,
  publishedAt: '2025-03-15',
},
```

**YouTube video:**
```ts
{
  id: 'race1-highlight',
  type: 'VIDEO',
  title: 'Race #1 Highlights',
  description: 'Optional description',
  url: 'https://youtube.com/watch?v=VIDEO_ID',
  thumbnail: 'https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg',
  duration: '2:14',
  featured: true,
  publishedAt: '2025-03-15',
},
```

Clicking a video card opens the link in a new tab. No embedding — just links.

### External image hosting (optional)

If you don't want to put images in the repo, you can use any public URL:
- **Cloudinary** — free tier, great CDN. Upload at [cloudinary.com](https://cloudinary.com), paste the URL directly.
- Any direct image URL (Google Drive public links, Dropbox, etc.) works too.

---

## Project structure

```
hamstarhub/
├── config/
│   └── site.ts          ← Edit this to update all site content
├── app/
│   ├── page.tsx          Main SPA
│   └── layout.tsx        HTML head / metadata
├── components/
│   ├── Nav.tsx
│   ├── ui/index.tsx      Theme colors + shared UI components
│   └── views/
│       ├── RaceView.tsx
│       ├── PetsView.tsx
│       ├── CommunityView.tsx
│       ├── SponsorsView.tsx
│       └── ArenasView.tsx
└── public/
    ├── pets/             ← Drop pet photos here
    └── media/            ← Drop gallery images here
```

---

## Deploying to Vercel

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. No environment variables needed — deploy as-is

To update content after deploy: edit `config/site.ts`, push to GitHub, Vercel redeploys automatically (takes ~30 seconds).
