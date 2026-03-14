# Hamstar — Admin Panel Design Doc

> **Goal:** Every setting, media upload, race action, and content change that currently requires opening an IDE or running a terminal command should be doable from a password-protected page at `hamstar.xyz/admin`. No code editor. No terminal. Just a clean dashboard.

---

## The Problem Right Now

Everything that runs the site requires direct file or terminal access:

| Task | Current Method | Should Be |
|------|---------------|-----------|
| Flip race to LIVE | Edit `config/site.ts` → redeploy | Toggle switch in admin |
| Finish a race + declare winner | `npx tsx scripts/finish-race.ts` in terminal | One button click |
| Upload a photo or video | Put file in `/public/`, edit `config/site.ts`, redeploy | Drag-and-drop uploader |
| Change stream URL | Edit `config/site.ts` → redeploy | Editable field in admin |
| Change button labels/CTAs | Edit component file → redeploy | Text field in admin |
| Add a sponsor | Edit `config/site.ts` → redeploy | Form in admin |
| Update pet bio or tagline | Edit `config/site.ts` → redeploy | Edit inline in admin |
| Update social links | Edit `config/site.ts` → redeploy | Settings form in admin |
| Check donation health | Query Supabase directly | Admin dashboard |

The admin panel collapses all of this into a single gated interface.

---

## Access & Authentication

### How It's Gated
The admin panel lives at `/admin`. On any request to this route, the server checks for a valid admin session.

**Recommended approach — Supabase Auth with a single admin email:**
- Admin logs in at `/admin/login` with their email
- Supabase sends a magic link (no password to store or forget)
- Session token stored in a cookie, validated on every `/admin/*` route via Next.js middleware
- One email address is designated as the admin in `.env.local`: `ADMIN_EMAIL=you@example.com`

**Alternative (simpler, for v1) — Static admin password:**
- `ADMIN_PASSWORD` env var
- Login form at `/admin/login` hashes the input and compares
- On match, sets a signed HTTP-only cookie valid for 7 days

The magic link approach is cleaner and more secure. The password approach is faster to ship. Start with password, upgrade to magic link later.

### What Unauthorized Users See
- `/admin` → redirected to `/admin/login`
- `/admin/login` with wrong credentials → "Incorrect password" error, no detail
- All admin API routes (`/api/admin/*`) → 401 if no valid session cookie

---

## Admin Panel Layout

### Navigation
Persistent left sidebar (desktop) or bottom tab bar (mobile) with six sections:

```
🏁 Race Control
🐹 Pet Manager
🖼️  Media Library
📢 Site Settings
🏎️  Sponsors
📊 Dashboard
```

Each section is a separate page within `/admin/*`.

---

## Section 1 — Race Control (`/admin/race`)

This replaces `finish-race.ts` and the `isLive` toggle in `config/site.ts`.

### Live Race Status Panel
The first thing visible when entering Race Control:

```
┌─────────────────────────────────────────────────────┐
│  RACE #4 STATUS                                     │
│                                                     │
│  Status:    ● UPCOMING                              │
│  Starts:    Apr 12, 2025 at 6:00 PM UTC             │
│  Ends:      Apr 14, 2025 at 6:00 PM UTC             │
│  Countdown: 14h 22m 09s                             │
│                                                     │
│  [ Mark as LIVE ]      [ Finish Race #4 → ]         │
└─────────────────────────────────────────────────────┘
```

**"Mark as LIVE" button:**
- Sets `isLive: true` in the DB site settings table (see Site Settings section)
- The frontend reads this value via API instead of `config/site.ts`
- Shows a confirmation dialog: "This will mark Race #4 as live and trigger the LIVE state on the site. Continue?"

**"Finish Race #4 →" button:**
- Runs the same logic as `finish-race.ts` but as an API call
- Shows a preview before committing:

```
┌─────────────────────────────────────────┐
│  FINISH RACE #4 — CONFIRM               │
│                                         │
│  🥇 Nugget     2.4 SOL                  │
│  🥈 Hammy      1.8 SOL                  │
│  🥉 Whiskers   0.9 SOL                  │
│                                         │
│  Total raised: 5.1 SOL                  │
│  Winner: 🐿️ Nugget                       │
│                                         │
│  [ Cancel ]      [ Confirm & Finish ✓ ] │
└─────────────────────────────────────────┘
```

On confirm: marks race FINISHED, sets positions, creates Race #5, resets support totals.

### Race History Panel
Below the current race panel, a list of all past races with their results. Each row has an "Edit Recap" button that opens an inline text editor for the race's title and recap narrative (feeds into the race result cards and history section — see IMPROVEMENTS.md §P3.1 and §P3.5).

### Stream Settings (Quick Access)
Two fields always visible on this page:

- **Stream URL** — the pump.fun link all the "Watch Live" buttons point to
- **Replay URL** — optional last-race replay link

Both are editable inline. Save button appears when a field is changed. No redeploy needed.

---

## Section 2 — Pet Manager (`/admin/pets`)

This replaces all pet-related entries in `config/site.ts`.

### Pet List
Three cards, one per pet, showing their current photo/emoji, name, and live stats. Clicking a card opens the full pet editor.

### Pet Editor (per pet)

**Identity fields:**
- Name
- Number (e.g., `#01`)
- Tagline — single line
- Team name
- Emoji (for when no photo is set)
- Accent color — color picker
- Wallet address (Solana) — used for donation routing

**Photo Upload:**
- Drag-and-drop or click-to-browse
- Uploads directly to Cloudinary (or Supabase Storage) via a pre-signed URL from `/api/admin/upload`
- Preview shown immediately after upload
- Stored as a URL in the DB Pet record (`image` field)
- No file size limit beyond what Cloudinary accepts; auto-resized to max 800×800 on upload

**Stats:**
- Speed slider (0–100)
- Chaos slider (0–100)
- Wins counter (+ / − buttons)

**Lifestyle (overridden manually if needed):**
- Snack Level slider (0–100) — note: this auto-updates from donation upgrades, but can be manually set
- Cage Level slider (0–100) — same

**Bio:**
- Full textarea, multi-paragraph
- Character count shown

**Diary Entries:**
- A list of weekly journal entries (see IMPROVEMENTS.md §P2.5)
- Add entry: week number + text field
- Delete or reorder entries
- Displayed in order on the pet's public profile

**Sponsors (linked from Sponsors section):**
- Read-only display of which sponsors are linked to this pet
- "Manage Sponsors →" link takes to Sponsors section

All changes save on click of "Save Pet" — single API call to `/api/admin/pets/[id]`, updates DB directly.

---

## Section 3 — Media Library (`/admin/media`)

This replaces the `MEDIA` array in `config/site.ts` and eliminates the need to put files in `/public/`.

### Upload Panel
At the top: a large drag-and-drop zone.

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   📁 Drag photos or videos here, or click to browse │
│                                                     │
│   Supports: JPG, PNG, WEBP, GIF, MP4, MOV          │
│   Max size: 200MB per file                          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Upload flow:**
1. File selected → client calls `/api/admin/upload` to get a Cloudinary pre-signed upload URL
2. File uploads directly to Cloudinary from the browser (no bandwidth through Vercel)
3. On success, Cloudinary returns the hosted URL and thumbnail URL
4. Admin is shown a "New Media Item" form pre-filled with those URLs
5. Admin fills in: Title, Description (optional), Type (auto-detected from file), Featured toggle, Published date
6. Save → creates a row in the `Media` DB table

**For videos hosted externally (YouTube, TikTok):**
- A separate "Add External Video" form: paste the URL
- Admin pastes YouTube URL → system auto-extracts the video ID and pre-fills the thumbnail field (`https://img.youtube.com/vi/{ID}/maxresdefault.jpg`)
- Admin fills title, description, duration, featured flag
- Save → creates Media row with external URL

### Media Grid
All existing media items shown as cards. Each card has:
- Thumbnail preview
- Title
- Type badge (VIDEO / PHOTO)
- Featured toggle (click to toggle, saves instantly)
- Edit button → opens the same form used during upload, pre-filled
- Delete button → confirmation dialog → removes from DB (does not delete from Cloudinary automatically, but adds a note about manual cleanup)

### Reorder / Featured
A "Featured" toggle promotes an item to appear first in the Community grid. Multiple items can be featured. Drag-to-reorder available within the featured set.

---

## Section 4 — Site Settings (`/admin/settings`)

This replaces almost all of `config/site.ts`. Settings are stored in a `SiteSettings` table in the DB (single-row table, key-value or structured). The frontend fetches these via `/api/settings` instead of reading the static config file.

### Settings are organized into four groups:

**Group A — Race Settings**
| Field | Description |
|-------|-------------|
| Race number | Current race number (shown in hero) |
| Stream URL | The pump.fun or external URL all Watch/Follow buttons point to |
| Replay URL | Last race replay link (YouTube etc.) — leave blank to hide |
| Stream is Live | Toggle — this is the master switch that flips the site to LIVE state |
| Genesis timestamp | The UNIX timestamp the 48h race cycle started from |

**Group B — Social Links**
| Field | Description |
|-------|-------------|
| Twitter/X URL | Shown in footer and Community follow bar |
| TikTok URL | Same |
| Instagram URL | Same |
| YouTube URL | Same |

Leave any field blank to hide that platform's button across the whole site.

**Group C — Button Labels & CTAs**
Every user-facing button whose label or URL might change between races:

| Button | Label Field | URL/Action Field |
|--------|-------------|-----------------|
| Main CTA (live) | e.g. "▶ Watch Live Now" | Stream URL (auto-linked to Group A) |
| Main CTA (upcoming) | e.g. "🔔 View on pump.fun" | Stream URL |
| Race History button | e.g. "📋 Race History" | Internal scroll / tab |
| Footer links | Per-platform labels | Per-platform URLs |
| Arenas email CTA | e.g. "Notify Me →" | No URL (form action) |
| Sponsors contact | e.g. "Get in Touch →" | mailto: auto-built from sponsor email |

Changing any label here updates the button across the entire site instantly — no redeploy.

**Group D — General**
| Field | Description |
|-------|-------------|
| Site name | "Hamstar" — shown in nav and meta |
| Tagline | "Who will be the Hamstar?" — shown in hero and meta |
| Sponsor contact email | All sponsor inquiry CTAs mailto: this address |
| OG image URL | The social share preview image |

### How Settings Reach the Frontend
- A `SiteSettings` DB table stores all the above as a single structured JSON row
- `/api/settings` returns this as JSON (public, cached for 30s)
- The frontend replaces its current static `SITE` config import with a `useSiteSettings()` hook that fetches from this endpoint
- On first load: fetches settings, shows page. Settings are also available server-side via `fetch` in server components for SEO/meta

---

## Section 5 — Sponsors (`/admin/sponsors`)

This replaces the `SPONSORS` array in `config/site.ts`.

### Sponsor List
All current sponsors shown as cards. Each card shows: name, emoji, tier badge, linked pet, website URL, active status.

### Add Sponsor Form
```
Name:         [ AcmeCorp           ]
Emoji:        [ 🚀                 ]
Tier:         [ ○ Silver  ● Gold  ○ Title ]
Linked Pet:   [ ○ Hammy  ● Nugget  ○ Whiskers  ○ None ]
Website URL:  [ https://acme.com   ]
Active:       [✓]

[ Save Sponsor ]
```

### Edit / Deactivate
Each sponsor card has Edit and Deactivate (soft delete — sets `active: false`, hides from public site but preserves the record).

---

## Section 6 — Dashboard (`/admin/dashboard`)

An at-a-glance health and activity view. No actions here — just visibility.

### Cards shown:

**Current Race**
- Race number, status, time remaining
- SOL totals per pet (live from DB)
- Total donations this race

**Recent Donations**
- Last 10 donations, newest first
- Columns: time, pet, amount, wallet (shortened), tx signature (linked to Solscan)

**All-Time Stats**
- Total SOL raised across all races
- Total donations count
- Most supported pet (all time)
- Most active race (most donations)

**System Health**
- Helius webhook: last event received timestamp + "✓ Active" / "⚠️ No events in 24h"
- Supabase connection: "✓ Connected"
- Last DB write: timestamp

---

## Technical Implementation Plan

### New DB table: `SiteSettings`
```prisma
model SiteSettings {
  id            String   @id @default("singleton")
  raceNumber    Int      @default(1)
  isLive        Boolean  @default(false)
  streamUrl     String   @default("")
  replayUrl     String?
  genesisTs     BigInt
  twitterUrl    String?
  tiktokUrl     String?
  instagramUrl  String?
  youtubeUrl    String?
  sponsorEmail  String   @default("")
  siteName      String   @default("Hamstar")
  tagline       String   @default("Who will be the Hamstar?")
  ogImageUrl    String?
  buttonLabels  Json     @default("{}")  // flexible key-value for CTA labels
  updatedAt     DateTime @updatedAt

  @@map("site_settings")
}
```

### New API routes needed

| Route | Method | Description |
|-------|--------|-------------|
| `/api/admin/login` | POST | Validate password, set session cookie |
| `/api/admin/logout` | POST | Clear session cookie |
| `/api/admin/settings` | GET / PATCH | Read or update SiteSettings |
| `/api/admin/race/finish` | POST | Run finish-race logic server-side |
| `/api/admin/race/[id]` | PATCH | Update race status, recap text |
| `/api/admin/pets/[id]` | PATCH | Update pet fields |
| `/api/admin/media` | GET / POST | List or create media items |
| `/api/admin/media/[id]` | PATCH / DELETE | Update or delete a media item |
| `/api/admin/upload` | POST | Return a Cloudinary pre-signed upload URL |
| `/api/admin/sponsors` | GET / POST | List or create sponsors |
| `/api/admin/sponsors/[id]` | PATCH / DELETE | Update or deactivate a sponsor |
| `/api/settings` | GET | Public endpoint — returns SiteSettings for frontend |

### Auth middleware
`middleware.ts` at the project root intercepts all `/admin/*` and `/api/admin/*` requests. Checks for the session cookie. Redirects to `/admin/login` if missing or invalid.

### Media uploads via Cloudinary
1. Admin selects file in the browser
2. Browser calls `/api/admin/upload` with the filename and content type
3. Server generates a Cloudinary pre-signed upload URL (using `CLOUDINARY_API_SECRET` env var) and returns it
4. Browser uploads directly to Cloudinary using that URL — no bandwidth through Vercel
5. Cloudinary returns the final hosted URL
6. Browser sends the URL to `/api/admin/media` to create the DB record

This keeps Vercel's function memory and bandwidth limits from being a concern for large video uploads.

### Migrating off `config/site.ts`
The migration is incremental — the static config file stays as fallback values during the transition:

1. Deploy `SiteSettings` table with values copied from current `config/site.ts`
2. Create `/api/settings` endpoint
3. Frontend switches `SITE` config references to use the API response
4. After validation: the `config/site.ts` fields become unused (keep as documentation/reference, or remove)
5. `PETS`, `MEDIA`, `SPONSORS` similarly move to DB reads via existing `/api/pets`, `/api/media`, `/api/sponsors` routes

---

## Environment Variables Required

```bash
# Existing
DATABASE_URL=
DIRECT_URL=
GENESIS_TIMESTAMP=

# New for Admin Panel
ADMIN_PASSWORD=           # Hashed password for admin login (v1)
ADMIN_EMAIL=              # For magic link auth (v2)
ADMIN_SESSION_SECRET=     # Used to sign the session cookie

# New for Media
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## Build Order

| Step | What | Why First |
|------|------|-----------|
| 1 | Auth middleware + login page | Everything else is gated behind this |
| 2 | Site Settings page (stream URL, isLive toggle, socials) | Highest day-to-day use; eliminates redeployment for common changes |
| 3 | Race Control (finish race button, live toggle) | Replaces terminal script; needed every 48h |
| 4 | Media Library (upload + manage) | Eliminates the biggest current friction point |
| 5 | Pet Manager (edit bio, stats, photo) | Less frequent but important for character updates |
| 6 | Sponsors page | Self-contained, low urgency |
| 7 | Dashboard | Read-only; useful but not blocking anything |
| 8 | Button label editor | Polish; useful once the site has more traffic |

---

## What This Unlocks

Once the admin panel is live, running a race looks like this:

1. Race starts → open `/admin/race` → toggle "Mark as LIVE" → done
2. Race ends → click "Finish Race #4" → review standings → confirm → done
3. Want to upload a post-race highlight? → `/admin/media` → drag file in → title it → save → it's on the site
4. Sponsor reaches out? → `/admin/sponsors` → fill form → save → their logo appears immediately
5. Stream URL changes? → `/admin/settings` → update one field → every button on the site updates instantly

No IDE. No terminal. No redeploy.
