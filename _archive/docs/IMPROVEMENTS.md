# Hamstar — UX & Growth Improvement Plan

> **North Star:** Turn Hamstar from a cool landing page into the internet's favorite hamster sports franchise. Every feature either deepens character attachment, creates a shareable moment, or lowers the barrier to participation.

---

## The Problem, Honestly

The site looks great. But it's a brochure. There's no reason to come back between races, no visible mechanism showing that donations matter, no moment that makes someone pull out their phone to show a friend, and no path for a non-crypto person to go from "aww, Nugget is cute" to actually sending support. The gap is **loop, personality, and frictionless participation**.

---

## The Engagement Loop We're Building

Every deliberate design decision should serve this cycle:

```
Discover → Pick a side → Get invested → Watch the race live →
Want to donate → Smooth path to donate → See your name on the feed →
Race ends → Shareable moment → Countdown begins again → Come back
```

Currently only the first two steps exist. This plan builds the rest.

---

## The Virality Formula for Hamstar

Three things make something spread in 2025:

1. **Identity expression** — "I'm Team Nugget" is a statement. People post their allegiance.
2. **Shareable moments** — A race result card, an upset, a prediction that came true. Screenshot-worthy by design.
3. **Low barrier + FOMO** — Someone sees the donation ticker moving, feels left out, wants in.

The hamsters are inherently meme-able. Lean into it hard. Hammy is the people's champion. Whiskers is the silent villain. Nugget is pure chaos. These aren't just stats — they're characters. And people on the internet will go to war over characters.

---

## Non-Crypto Onboarding — The Full Funnel

This is the most important section. The site's entire revenue model is SOL donations. A non-crypto person hits the site, loves the hamsters, wants to donate, and there is currently **nothing to help them**. They leave. That's the leak we're plugging.

### The Cardinal Rule
> Never say "crypto," "blockchain," or "wallet" until someone has already decided they want to donate. Lead with the hamsters. The mechanism follows.

### The Full Path for a Non-Crypto First-Timer

**Step 1 — Hook (first 10 seconds)**
They arrive. Big hamster. Character. Chaos. Instantly readable. No jargon. The word "Solana" appears nowhere above the fold.

**Step 2 — Pick Your Hamster**
A "Who's your champion?" prompt is their first interaction. One click. Stored in localStorage. No account, no email, nothing. Now the site feels personalized — "Your hamster is Nugget."

**Step 3 — Feel the Stakes**
The live support bar shows community SOL totals moving in real time. The donation ticker scrolls past. They see "anon sent 0.5 SOL to Nugget 🐿️." FOMO activates.

**Step 4 — "Back Nugget" CTA**
A clear, friendly button in Nugget's color. Not "send SOL to wallet address." Just: **"Back Nugget 🐿️"**

**Step 5 — The Friendly Onboarding Modal**
Clicking "Back Nugget" opens a modal. Two paths:

> **Already have a Solana wallet?**
> Copy Nugget's address → paste in Phantom/Backpack → done.
>
> **New to this? Here's how in 3 steps:**
> 1. **Get a wallet** — Download [Phantom](https://phantom.app) (free, 2 min). Think of it like Venmo for the internet.
> 2. **Add funds** — Buy SOL on Coinbase or Kraken, then send it to your Phantom address. Or ask a crypto friend to send you some.
> 3. **Back Nugget** — Copy Nugget's address below and paste it in Phantom as the recipient. Send whatever feels right.
>
> 💡 *Even 0.1 SOL (~$15) upgrades Nugget's snack quality and shows up on the live leaderboard.*

**Step 6 — Confirmation**
The Helius webhook already detects incoming donations. When one arrives, show a toast notification on the site: "🐿️ Nugget just got backed! Someone sent X SOL." If the donor is the current visitor (matched by amount + timing, or a shareable link), show a full celebration moment: confetti, "Nugget thanks you," their name on the live ticker.

### Why This Works
- Zero friction until the moment of intent
- Plain English throughout
- Concrete cost framing ($15, not 0.1 SOL)
- The "already have a wallet" path is one tap
- The new user path feels like setting up Venmo, not trading crypto

---

## Phase 0 — The Heartbeat (Build First, ~3 days)

These three changes make the site feel alive immediately. Nothing else matters until these are in.

### P0.1 — Live Countdown Clock
The `race-scheduler.ts` already exports `getCurrentRaceWindow()` and `formatCountdown()`. Use them client-side with a `useEffect` interval to render a ticking clock in the Race tab hero.

**Display during UPCOMING:**
```
Next race starts in
  23  :  14  :  09
   h      m      s
```
Large, centered, bold. Below the h1. When it hits zero, animate to "🔴 RACE IS LIVE" and fire confetti.

**Display during LIVE:**
```
⚡ Race ends in  01 : 47 : 22
```
Smaller, shown in the stream section header.

**Why it's #1:** Without a countdown, every visit feels the same. With one, every visit has a specific time context. People bookmark it, set reminders, come back.

---

### P0.2 — Live Community Support Bars
The Supabase Realtime subscription is already wired. Connect it to a visible leaderboard on the Race tab.

Below the stream box, replace the static 3-column pet cards with a **"Race Support"** section:

```
🐹 Hammy      ████████████░░░░  4.2 SOL  ↑ trending
🐭 Whiskers   ████████░░░░░░░░  2.8 SOL
🐿️ Nugget     ██████░░░░░░░░░░  2.1 SOL
```

- Bars animate smoothly on donation events via Supabase `postgres_changes`
- Leading pet's bar pulses with a glow in their color
- "↑ trending" badge appears when a pet received a donation in the last 5 minutes
- Total SOL raised this race shown in a small summary below

This is the site's core mechanic made visible. Donations are no longer abstract — you can watch your SOL move the bar.

---

### P0.3 — "Back Your Hamster" CTA + Onboarding Modal
The full funnel described above. Implement as:

- A row of three colored buttons in the Race tab hero: `[Back Hammy 🐹]  [Back Whiskers 🐭]  [Back Nugget 🐿️]`
- Each opens a modal with the two-path onboarding (existing wallet / new to crypto)
- Modal includes: copy-to-clipboard wallet address, step-by-step new user guide, cost framing in USD, and a friendly illustration or large pet emoji
- On copy: toast notification "✓ Nugget's address copied! Open your wallet and paste it as the recipient."

**Language rules for this feature:**
- ❌ "Send SOL to the following wallet address"
- ✅ "Copy Nugget's support address and paste it in Phantom"
- ❌ "0.5 SOL minimum"
- ✅ "Any amount helps — even 0.1 SOL upgrades his snack quality"

---

## Phase 1 — The Live Race Experience (~1 week)

### P1.1 — Live Donation Ticker
A slim auto-scrolling ticker below the support bars during live races:

```
🐹 abc...xyz backed Hammy with 0.2 SOL  ·  🐿️ NuggetGang sent 1.0 SOL  ·  🐭 anon joined Team Whiskers
```

- Pulls from Supabase Realtime on the Donations table
- New donations animate in from the right, old ones fade out after ~10s
- Wallet addresses always shortened to `abc...xyz` for privacy
- When no live race: shows "last race highlights" from final donation data

**Effect:** The ticker makes participation visible. People see others donating and feel the pull to join. It's the slot machine scroll of the site — once it starts moving, you don't look away.

---

### P1.2 — Momentum Meter
During live races, each pet gets a **momentum indicator** calculated from donation velocity in the last 15 minutes.

```
🔥 Hot  — Nugget got 3 donations in the last 10 min
😴 Quiet — Hammy's last donation was 32 min ago
```

Shown as a small badge on each support bar. Purely derived from Donation timestamps — no extra DB work. Creates urgency: "Hammy is falling behind, I should back him NOW."

---

### P1.3 — Confetti + Race Start Celebration
When `isLive` first becomes `true` (detected via a state transition on the countdown reaching zero, or a Supabase real-time flag):

- Fire `canvas-confetti` in the three pet colors (3kb package, no bundle impact)
- Play a brief "🚨 THE WHEEL IS LIVE" announcement banner that slides down and auto-dismisses
- The hero h1 transitions from the countdown to the live race state with animation

---

### P1.4 — "My Hamster Won!" Celebration Page
When a race ends (`RACE_HISTORY` gets a new entry) and the winner matches the user's localStorage team:

- Show a full-screen celebration overlay for 5 seconds: big emoji, confetti, "YOUR HAMSTER WON RACE #4 🏆"
- Below: a shareable result card (see P3.1) with a one-click share button
- For users on the losing team: a consolation message in character. Hammy: "He'll be back." Nugget: "Chaos always returns."

---

## Phase 2 — Personality & Character (~1 week)

This phase makes the hamsters feel real. Real characters create fans. Fans donate.

### P2.1 — Team Allegiance System
On first visit, show a full-width "Pick your champion" prompt above the race content — three large pet cards, one tap to choose. Stored in localStorage.

After picking:
- The nav shows a small colored dot: "🐿️ Team Nugget"
- The Race tab hero shifts tone: "Your hamster Nugget starts in X hours"
- Support bars highlight the user's pet with a "YOUR TEAM" label
- The "Back" CTA defaults to their pet

**Why it works:** Picking a side is effortless and irreversible-feeling. Once you're Team Nugget, you're rooting for Nugget. You feel personally implicated when he wins or loses. That's the emotional hook that drives repeat visits and donations.

---

### P2.2 — Pet Mood System
Each pet has `snackLevel` and `cageLevel`. Derive a visible "pre-race condition" that updates every race:

| State | Condition | Badge |
|-------|-----------|-------|
| 🔥 Peak Form | snack ≥ 70 + cage ≥ 70 | "Rested. Fed. Dangerous." |
| 😤 Hungry | snack < 50 + cage ≥ 70 | "Running on spite." |
| 😴 Cramped | snack ≥ 70 + cage < 50 | "Well-fed but restless." |
| 💀 Underdog | snack < 50 + cage < 50 | "Has nothing to lose." |
| 👑 On a Streak | wins ≥ 3 | "You don't stop a champion." |

Shown on the pet card and in the race hero. The mood changes based on whether the community donated enough to trigger upgrades. This is the feedback loop that makes donations feel meaningful: "We upgraded Nugget's cage and now he's in Peak Form."

---

### P2.3 — Pre-Race Hamstar Horoscope
24 hours before each race, update a short "pre-race analysis" text in the race hero. Written in the voice of a dramatic sports commentator, in character for each pet:

> *"Nugget has been spotted doing zoomies at 3am. His cage is pristine. His snack reserves are stocked. He's either about to win by a mile or knock everything off the shelf. With Nugget, there is no in between."*

Purely a static config field: `preRaceReport: string` added to each race entry. Takes 10 minutes to write per race. Makes every race feel like a unique event with its own narrative.

---

### P2.4 — Achievement Badges
Auto-generated from existing data, displayed on pet cards:

- `🏆 3× Champion` — 3+ wins
- `⚡ Speed Demon` — speed > 75
- `🌀 Chaos Agent` — chaos > 80
- `🍿 Well Fed` — snackLevel ≥ 80
- `🏠 Penthouse Living` — cageLevel ≥ 80
- `❤️ People's Champ` — most total wins
- `📈 Defending Champ` — winner of most recent race
- `💸 Community Favorite` — most SOL received this season

Small colored pills below each pet's stats. Instantly communicates personality. Changes as stats and wins update — dynamic, not static.

---

### P2.5 — Pet Diary (In-Character Journal)
A "Journal" tab within the Pets view, showing 3–5 short diary entries per pet. Written from their perspective, race week by race week. Static content in `config/site.ts` as `diary: { week: number; entry: string }[]`.

```
Hammy — Week 3
"People keep saying Nugget is unstoppable. I keep winning.
Make it make sense."

Nugget — Week 3
"I don't remember the race. I remember the wheel. I remember winning.
Everything else is a blur."
```

This is the highest ROI content investment. Fans quote character lore. Fans argue about characters. Fans share character content. Spend 30 minutes writing 5 diary entries per pet and it changes how people feel about the site.

---

### P2.6 — All-Time Standings
Automatically calculated from `RACE_HISTORY`. Add a standings table to the bottom of the Race tab:

| Pet | W | L | Win % | SOL Raised |
|-----|---|---|-------|------------|
| 🐹 Hammy | 3 | 2 | 60% | 14.2 ◎ |
| 🐿️ Nugget | 2 | 3 | 40% | 11.8 ◎ |
| 🐭 Whiskers | 1 | 4 | 20% | 8.4 ◎ |

No backend needed — computed from `RACE_HISTORY` and the donation totals already in the DB. Adds sports-franchise permanence. Season narratives emerge from this table ("Hammy is dominating Season 1").

---

## Phase 3 — Virality & Community (~1 week)

### P3.1 — Shareable Race Result Cards
The most important virality mechanic. After each race ends, auto-generate a styled result card that looks like a sports graphic:

```
┌─────────────────────────────┐
│  HAMSTAR — RACE #4          │
│  ─────────────────────────  │
│  🏆 NUGGET WINS              │
│  The Chaos Agent delivers   │
│  ─────────────────────────  │
│  🥇 Nugget   — 2.1 SOL      │
│  🥈 Hammy    — 1.8 SOL      │
│  🥉 Whiskers — 0.9 SOL      │
│  ─────────────────────────  │
│  hamstar.xyz  |  Season 1   │
└─────────────────────────────┘
```

- Rendered as a styled div using existing design tokens
- "Share Result" button: copies the site URL with `?race=4&winner=nugget` query params
- On mobile: native share sheet via `navigator.share()`
- The URL shows the race result card prominently when shared, with a "Watch Race #5 →" CTA

**Why this matters:** This is the moment people screenshot and post. A clean, dramatic race result card looks good on Twitter, Discord, and TikTok. The site URL is embedded. Every share is an ad.

---

### P3.2 — Pre-Race Community Predictions
During the UPCOMING window, show a live poll in the Race tab:

```
WHO WINS RACE #5?
[🐹 Hammy 48%] [🐿️ Nugget 33%] [🐭 Whiskers 19%]
                    2,847 predictions
```

- Vote stored in Supabase (one per device via fingerprint or just localStorage)
- Results shown as live bars — watching them shift is engaging on its own
- After the race: reveal accuracy. "The community got it right — 48% picked Hammy 🎯"
- The "I predicted X" shareable moment: a small sharable badge "I called it: Team Nugget 🐿️ — Race #5"

---

### P3.3 — Fan Wall
A section in the Community tab showing recent donors with optional messages. Pulled from the Donations table (add a nullable `message` and `alias` field):

```
💛 NuggetNation • 1.0 SOL • "Chaos is the only strategy 🐿️"  2h ago
🟠 HammyRider   • 0.5 SOL • "People's champ forever"          5h ago
🔵 anon         • 0.2 SOL                                      8h ago
```

- Shown as a live-scrolling card grid, newest at top
- Clicking a pet emoji filters to that team's supporters
- No message = show as "anon backed [pet name]"
- The public visibility of the wall creates a mild social incentive: "my name will be on there"

---

### P3.4 — "Submit a Clip" Pipeline
Top of Community tab, a callout card:

> **🎬 Caught a great moment?**
> Tag us @Hamstar on TikTok, Twitter, or Instagram. Best clips get featured here.

This is a zero-engineering UGC pipeline. The content fills itself as the community grows. Featured clips should show prominently (the `featured: true` field already exists in `MediaItem`).

---

### P3.5 — Race History with Narrative
Each entry in `RACE_HISTORY` gets an optional `title` and `recap` field:

```ts
{
  number: 3,
  date: '2025-04-05',
  positions: ['nugget', 'hammy', 'whiskers'],
  title: 'The Great Upset',
  recap: 'Nugget trailed for 46 of 48 hours then surged in the final stretch. Nobody saw it coming.',
  totalSol: 9.2
}
```

Race history cards display the title large and the recap below. Makes each race feel like an episode with a name, not just a data point. The history becomes a sports archive. New visitors read through it.

---

## Phase 4 — Arena & Collective Goals (~3 days)

### P4.1 — Arena Unlock Progress Bar
At the top of the Arenas tab, a collective progress bar toward Arena 2:

```
🏗️ Building Crumble Cove
Community has run 4 of 10 races  ████░░░░░░  40%
Every race gets us closer.
```

Calculated from `RACE_HISTORY.length` vs a target set in `ROADMAP`. This is a shared goal. People feel like they're building something together. Arena unlocks become community celebrations.

---

### P4.2 — Community Arena Vote
For "Arena 4 — Community Choice," add a live voting widget with 3–4 options:

- `🏜️ Desert Dunes` — Sand, heat, mirages. Expect hallucinations.
- `🌊 Flood Zone` — Water hazards. High chaos. High stakes.
- `🌌 Zero Gravity` — We're not sure how. We'll figure it out.
- `🏙️ City Circuit` — Street racing through tiny cardboard Tokyo.

Votes stored in Supabase. Results displayed as live bars. Winner announced at a milestone race count. This is the kind of vote people share: "Go vote for Zero Gravity, it would be insane" — every share brings someone back to the site.

---

## Phase 5 — Polish & Delight (ongoing)

### P5.1 — Dark Mode
The existing color tokens (`T.text = '#0A0F1F'`, `T.lime = '#A6FF00'`) already form a perfect dark theme when inverted. A toggle in the nav switches the body background. Neon lime on dark navy looks incredible. This will be the screenshot that circulates.

### P5.2 — Dynamic Page Titles
Update `document.title` as tabs change:
- Race tab (live): `🔴 LIVE — Hamstar Race #4`
- Race tab (upcoming): `⏱ 14h until Race #5 — Hamstar`
- Pets tab: `🐹 Meet the Racers — Hamstar`
- Community: `🎬 Hamstar TV`

The countdown in the browser tab is a persistent nudge every time someone sees their tab bar.

### P5.3 — Rotating Hamster Facts
Below the prediction poll or in the footer, a small card that rotates every 15 seconds:

- *"Hamsters can run up to 5 miles per night on their wheel."*
- *"A hamster's heart beats 250–500 times per minute at full sprint."*
- *"Hamsters are crepuscular — most active at dawn and dusk."*
- *"Hammy has run the equivalent of 847 miles this season."*

The last one (synthetic, pet-specific facts) is especially good. Mix real facts with in-universe lore.

### P5.4 — Konami Code Easter Egg
↑ ↑ ↓ ↓ ← → ← → B A triggers a 5-second full-screen hamster disco animation. Every great internet thing needs one secret. The people who find it will post about it.

### P5.5 — Head-to-Head Compare Mode
Within the Pets tab, a "Compare" toggle that shows two pets side by side with mirrored stat bars. Simple, fun, great for the "actually Whiskers is better than Hammy" discourse that drives engagement.

---

## Implementation Plan — Phased Roadmap

| Phase | Features | Est. Time | Priority |
|-------|----------|-----------|----------|
| **Phase 0** | Countdown clock, Live support bars, Back Your Hamster CTA + onboarding modal | 3 days | 🔴 Now |
| **Phase 1** | Donation ticker, Momentum meter, Confetti/race start, "My hamster won" celebration | 1 week | 🔴 High |
| **Phase 2** | Team allegiance, Pet moods, Pre-race horoscope, Achievement badges, Pet diary, All-time standings | 1 week | 🟠 High |
| **Phase 3** | Shareable result cards, Predictions poll, Fan wall, Race history narratives, Submit a clip | 1 week | 🟠 High |
| **Phase 4** | Arena progress bar, Community arena vote | 3 days | 🟡 Medium |
| **Phase 5** | Dark mode, Dynamic titles, Fun facts, Head-to-head, Easter egg | Ongoing | 🟢 Polish |

---

## Priority Stack Rank (Revised)

| # | Feature | Why It's This High |
|---|---------|-------------------|
| 1 | Countdown clock | Zero cost, maximum urgency. No reason not to build it today. |
| 2 | Back Your Hamster CTA + onboarding modal | The site has no donation conversion path. This is the whole point. |
| 3 | Live support bars | Makes the core mechanic (donations → upgrades) visible for the first time. |
| 4 | Team allegiance system | Personalizes the entire experience with one tap. Creates emotional investment. |
| 5 | Donation ticker | Social proof loop. Seeing others donate is the strongest trigger for donating. |
| 6 | Shareable race result cards | The primary virality vector. Every race creates a shareable moment. |
| 7 | Pet moods + achievement badges | Low effort, high personality. Makes characters feel real. |
| 8 | Pre-race community predictions | Engagement between races. Gives people a stake before they donate. |
| 9 | "My hamster won" celebration | The emotional payoff moment. Makes winning feel like an event. |
| 10 | Pet diary entries | Highest ROI content investment. Fan attachment drives everything. |
| 11 | Momentum meter | Urgency during live races. Gets casual watchers to donate now. |
| 12 | Fan wall | Public social proof. Names on a wall = motivation to add your name. |
| 13 | All-time standings | Sports legitimacy. Season narrative. Permanence. |
| 14 | Race history with narrative | Turns the archive into a story worth reading. |
| 15 | Arena progress bar | Collective goal. Community-building without engineering effort. |
| 16 | Pre-race horoscope | Pure content. High share potential if written well. |
| 17 | Arena community vote | Creates conversation. Drives return visits to check results. |
| 18 | Dark mode | Aesthetic. Will circulate as a screenshot. |
| 19 | Dynamic page titles | Small. Surprisingly effective as a persistent reminder. |
| 20 | Submit a clip CTA | Passive UGC pipeline that grows with the community. |
| 21 | Head-to-head compare | Fan engagement. Good for discourse. |
| 22 | Rotating fun facts | Pure delight. Low stakes, low effort. |
| 23 | Confetti on race start | Dopamine. Worth it. |
| 24 | Konami code easter egg | For the fans. Always for the fans. |

---

## Content Strategy Note

The three hamsters have distinct personalities. The writing across the site should reflect this — not just in diary entries, but in the pre-race reports, the mood badges, the "my hamster lost" consolation messages, the fan wall sorting. Each one should feel like following a specific athlete you have a relationship with.

**Hammy** — Earnest. Hardworking. The people's champion. Writes in short confident sentences. Never complains. Occasionally a little too confident.

**Whiskers** — Calculated. Slightly menacing. Says little. When he speaks it's surgical. The dark horse archetype. Fans love a mysterious winner.

**Nugget** — Pure chaos energy. Stream of consciousness. Contradicts himself. Doesn't know why he's winning, doesn't care. The most meme-able hamster on the internet.

Every piece of copy that gets written for this site should pass one test: **does it make me feel something about one of these three hamsters?** If yes, ship it. If not, cut it.

---

## The Three Things That Change Everything

If bandwidth is limited, build exactly these three in order:

1. **The countdown clock** — makes the site time-aware. Every visit has urgency.
2. **"Back Your Hamster" with the onboarding modal** — closes the gap between wanting to donate and doing it. Includes the friendly guide for non-crypto users.
3. **Live support bars** — makes the donation mechanic visible and real-time. Watching the bars move is what turns a visitor into a donor.

Everything else multiplies these three. But without them, nothing else matters.
