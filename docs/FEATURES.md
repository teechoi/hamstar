# HamstarHub — Feature Roadmap

*Priority order based on effort-to-impact ratio. Frontend-only features ship first.*

---

## 1. Live Implied Odds Display ← build first

**What:** As cheers come in, show each hamster's live expected payout multiplier and pool share. Updates every few seconds.

**Complexity:** Frontend only. No contract changes. Data already exists (pool totals per hamster in Supabase).

**UI — in `ArenaClient` / `HamsterCard`:**
- Below each hamster's support bar, add an odds row:
  ```
  DASH    2.3x  ████████████░░░  54% of pool
  FLASH   4.8x  ██████░░░░░░░░░  26% of pool
  TURBO   6.1x  ████░░░░░░░░░░░  20% of pool
  ```
- Multiplier = total pool ÷ hamster's pool share. Animate on change (number ticks up/down).
- Use existing `RaceBar` component from `/components/ui/index.tsx` for the fill bar, add a multiplier label alongside it.

**Data:** Derive from existing `support` values already fetched in `useRace`. No new API needed.

**Files to touch:**
- `components/arena/HamsterCard.tsx` — add odds row below support bar
- `lib/hooks/useRace.ts` — expose per-hamster pool share percentage

---

## 2. Live Cheer Feed ← build alongside #1, same PR

**What:** Real-time ticker showing cheers as they happen during the pick window.

```
wallet 7xK...f3 → 50,000 🐹 on TURBO
wallet 2mP...a1 → 12,000 🐹 on DASH
wallet 9rL...b8 → 200,000 🐹 on FLASH  ← big move
```

Large cheers (above a threshold, e.g. 100K $HAMSTAR) get a "big move" badge.

**Complexity:** Frontend + Supabase realtime. No contract changes.

**UI — new component `CheerFeed.tsx` in `components/arena/`:**
- Fixed-height scrolling list, newest at top, max ~8 visible rows
- Entries fade in with a slide-down animation (CSS keyframe)
- Big move threshold shows a highlighted row (purple background, `T.purple`)
- Use `SolAddress` component for wallet display

**Data:** Subscribe to Supabase `cheers` table inserts on the current race. Wire into `useRace` hook or a dedicated `useCheerFeed` hook.

**Files to touch:**
- `components/arena/CheerFeed.tsx` — new file
- `components/arena/ArenaClient.tsx` — render CheerFeed below the pool bar during pick window
- `lib/hooks/useRace.ts` — add cheer feed subscription

---

## 3. Last-Minute Frenzy Mode ← pure UI, zero backend

**What:** Final 60 seconds before pick lock triggers a visible mode shift — countdown goes red and pulses, multiplier bar drains visually, copy changes to "FINAL SECONDS — LOCK IN YOUR PICK".

**Complexity:** Frontend only. Uses existing countdown timer.

**UI changes to `ArenaClient`:**
- When `timeToLock < 60s`: apply "frenzy" state via `useState(isFrenzy)`
- Countdown timer: color shifts from default → `T.coral` (#FF3B5C), scale pulses (existing `pulse` keyframe)
- Race status card background: subtle red tint overlay
- CTA button: text changes, border animates

**Files to touch:**
- `components/arena/ArenaClient.tsx` — frenzy state derived from countdown
- `lib/hooks/useCountdown.ts` — expose `secondsRemaining` (may already exist)

---

## 4. Hamstar Form Cards ← frontend, needs real DB data

**What:** Each hamster's last 5 race results, win rate, and current streak displayed on the pick UI.

```
DASH    W W L W W    60% win rate    2-race streak
```

**Complexity:** Frontend + DB query. Needs `RACE_HISTORY` or a real `races` table query.

**UI — in `HamsterCard` or a collapsible panel below it:**
- 5 result pills: green `W` / red `L` circles
- Win rate % and current streak text below
- Expandable on mobile (tap to reveal)

**Data:** Query `races` table for last 5 completed races, filter by hamster. Add `/api/pets/[id]/form` route or extend `/api/settings` response.

**Files to touch:**
- `components/arena/HamsterCard.tsx` — add form row
- `app/api/pets/[id]/form/route.ts` — new API route
- `config/site.ts` — `RACE_HISTORY` already exists, can bootstrap from here

---

## 5. Dark Horse Bonus ← small contract addition

**What:** If a hamster with < 20% of the pool wins, all its backers get a 1.5x upset bonus on top of normal payout. Funded by a slice of the platform fee reserve.

**Complexity:** On-chain. Requires contract change + payout calculation logic.

**Contract:**
- Track per-race pool share % at lock time
- On result settlement: if `winner_pool_share < 20%`, apply 1.5x to all winner payouts
- Reserve funded by directing 1% of the 3% platform fee to an `upset_reserve` account

**UI:**
- Pre-race: show "DARK HORSE" badge on any hamster below 20% pool share
- Post-race: winning dark horse displays "UPSET BONUS 1.5x" in the result card

**Files to touch:**
- Solana program (contract) — payout logic
- `components/arena/ArenaClient.tsx` — dark horse badge + upset result display
- `components/arena/HamsterCard.tsx` — dark horse indicator during pick window

---

## 6. Hot Streak Multiplier ← on-chain, depth feature

**What:** Correct picks in consecutive races add a bonus to the time multiplier. 2-in-a-row → +0.2x, 3-in-a-row → +0.4x. Streak resets on a miss. Stored on-chain per wallet.

**Complexity:** On-chain. Requires a `streak_account` PDA per wallet.

**Contract:**
- PDA: `[wallet_pubkey, "streak"]` → stores `{ current_streak: u8, last_race_id: u64 }`
- On cheer settlement: if wallet picked winner, increment streak; else reset to 0
- Bonus multiplier applied at payout time

**UI:**
- AccountModal / HamsterCard: show current streak badge (`🔥 3-race streak`)
- Pick confirmation: show "Your streak bonus: +0.4x" if applicable

**Files to touch:**
- Solana program (contract) — streak PDA logic
- `components/arena/ArenaClient.tsx` — streak display during pick
- `components/wallet/AccountModal.tsx` — streak badge in user profile

---

## 7. Multi-Race Parlay ← on-chain, highest retention mechanic

**What:** Correctly pick winners of 2 or 3 consecutive races for a massive bonus multiplier. Stored on-chain as a separate parlay account. Parlay reserve funded by 1% of each race fee.

```
Single race win:    normal payout
2-race parlay win:  normal payout × 3x bonus
3-race parlay win:  normal payout × 8x bonus
```

**Complexity:** On-chain + significant UI surface. Biggest build, biggest retention impact.

**Contract:**
- PDA: `[wallet_pubkey, "parlay"]` → stores `{ legs_completed: u8, race_ids: [u64; 3], picks: [u8; 3] }`
- On each race settlement: check parlay account, advance or reset
- Bonus paid from `parlay_reserve` account on 2 or 3-leg completion

**UI — new `ParlayCard` component:**
- During pick window: show "Start a Parlay" CTA if no active parlay, or "Parlay Leg 2/3" if mid-streak
- Shows projected bonus multiplier
- Post-race: "Parlay alive! 1/3 complete — 3x if you go 3-for-3"
- Separate parlay history tab in AccountModal

**Files to touch:**
- Solana program (contract) — parlay PDA + reserve logic
- `components/arena/ParlayCard.tsx` — new file
- `components/arena/ArenaClient.tsx` — render ParlayCard during pick window
- `components/wallet/AccountModal.tsx` — parlay history tab

---

## Build Order Summary

| # | Feature | Effort | Requires Contract? |
|---|---------|--------|--------------------|
| 1 | Live implied odds display | Low | No |
| 2 | Live cheer feed | Low | No |
| 3 | Last-minute frenzy mode | Low | No |
| 4 | Hamstar form cards | Medium | No (DB only) |
| 5 | Dark horse bonus | High | Yes |
| 6 | Hot streak multiplier | High | Yes |
| 7 | Multi-race parlay | Very High | Yes |

**Phase 1 (ship together):** Features 1 + 2 + 3 — all frontend, immediate arena energy lift  
**Phase 2:** Feature 4 — needs real race history data in DB  
**Phase 3:** Features 5 + 6 — contract additions, can be batched  
**Phase 4:** Feature 7 — parlay system, own milestone  
