# HamstarHub — Feature Status

*Last updated: April 12, 2026*

---

## Implemented (shipped)

### Live Implied Odds Display ✅
Each `HamsterCard` shows a live payout multiplier (`totalPool / hamster pool`), pool share %, and a fill bar. Updates in real time via Supabase realtime + 30s polling fallback. Dark horse qualifier (`< 20%` of pool) shows a DARK HORSE badge.

**Files:** `components/arena/HamsterCard.tsx`, `components/arena/ArenaClient.tsx`, `lib/hooks/useRace.ts`

---

### Frenzy Mode ✅
Final 60 seconds before pick lock: `isFrenzy` state derived from countdown. Red border pulse animation (`frenzyGlow`), MobileStickyCheerBar copy flips to "Last Chance — Cheer Now", countdown digits turn red.

**Files:** `components/arena/ArenaClient.tsx`

---

### Live Cheer Feed ✅ (UI built — **mock data, needs real subscription**)
Scrolling ticker showing wallet → amount → hamster during the pick window. Large entries (above `BIG_CHEER_HAMSTAR` threshold) highlighted in purple with a "← BIG" label. Slide-in animation on new entries.

**Current state:** Runs on random fake data with a TODO comment at line 577 of `ArenaClient.tsx`:
```
// TODO: replace with supabase.subscribeToDonations(raceId, ...) when real raceId is available
```

**To wire up:** Subscribe to `cheers` table inserts filtered by `raceId` via Supabase realtime. One hook change, ~1 hour of work. Only becomes meaningful once real cheers are flowing (post-launch).

**Files:** `components/arena/ArenaClient.tsx` (inline `CheerFeed` component, line 557)

---

### Dark Horse Bonus ✅
Fully implemented on-chain and in UI.

- **On-chain:** `dark_horse_threshold_bps` (default 2000 = 20%), `upset_reserve` PDA funded by `upset_reserve_bps` (1%) of pool, `dark_horse_bonus_bps` (default 5000 = +50% → 1.5x total reward)
- **UI:** DARK HORSE badge during pick window on any hamster below threshold. UPSET BONUS 1.5x badge on the winning card in the result view.

**Files:** `hamstar-program/…/push_reward.rs`, `components/arena/ArenaClient.tsx`, `components/arena/HamsterCard.tsx`

---

### Hot Streak Multiplier ✅
Fully implemented on-chain and in UI.

- **On-chain:** `StreakAccount` PDA per wallet (`["streak", wallet_pubkey]`). 2-win streak → `streak_two_bonus_bps` (+0.2x weight), 3+ wins → `streak_three_bonus_bps` (+0.4x weight). Streak resets on loss.
- **UI:** `ArenaClient` fetches on-chain streak for connected wallet. CheerModal shows 🔥 N-race streak and "+0.2x / +0.4x weight bonus" label when applicable.

**Files:** `hamstar-program/…/place_cheer.rs`, `hamstar-program/…/push_reward.rs`, `components/arena/ArenaClient.tsx`, `components/arena/CheerModal.tsx`

---

### Hamster Form Cards ✅
Each `HamsterCard` displays last 5 race W/L pills, win rate %, and current streak from live DB data.

**Data source:** `/api/pets/[id]/form` — queries `races` table for last 5 finished races, returns W/L per hamster.

**Files:** `components/arena/HamsterCard.tsx`, `app/api/pets/[id]/form/route.ts`

---

## Not Yet Built

### Multi-Race Parlay (Accumulator) ❌

**What it is:** User commits tokens to a streak of consecutive race picks. If all picks are correct, payout multiplies: 2-race parlay → 3×, 3-race parlay → 8×. Managed via a separate on-chain `ParlayAccount` PDA. Single race picks use the existing base reward path — nothing changes for casual users.

**Why it matters:** The only feature in this list that doesn't exist yet. Also the highest-retention mechanism — it converts one-time participants into repeat users ("I'm on a parlay, I have to come back"). Creates natural season-like structure around individual races.

**How it differs from the Hot Streak Multiplier:**

| | Hot Streak Multiplier | Parlay |
|---|---|---|
| What you do | Cheer normally — bonus applies if you've won recently | Commit tokens to a multi-race sequence upfront |
| Reward | Slightly better weight on your cheer | Multiplied total reward on the whole sequence |
| Risk | None — you just get a smaller bonus if streak breaks | Forfeited parlay stake if you miss any race |
| On-chain state | `StreakAccount` (already exists) | New `ParlayAccount` PDA (not yet built) |

---

**On-chain spec:**

New PDA: `["parlay", wallet_pubkey, parlay_id]`

```rust
pub struct ParlayAccount {
    pub user: Pubkey,
    pub parlay_id: u64,        // monotonic per wallet
    pub races: [u64; 3],       // race IDs committed to (0 = not yet set)
    pub picks: [u8; 3],        // hamster index per race
    pub amount: u64,           // total HAMSTAR staked into parlay
    pub races_won: u8,         // incremented as each race settles
    pub races_total: u8,       // 2 or 3
    pub claimed: bool,
    pub bump: u8,
}
```

New instructions:
- `open_parlay` — user commits amount + picks for 2–3 consecutive races; tokens escrowed
- `settle_parlay_race` — called by admin after each race settles; increments `races_won` or marks as bust
- `claim_parlay` — user claims multiplied reward if all picks correct; refund if busted

Multipliers: 2-race → 3×, 3-race → 8×. Funded by a dedicated parlay pool (e.g., 1% of fee_bps redirected from treasury). Parlay pool needs a reserve similar to `upset_reserve`.

**Frontend spec:**

- New UI mode in `CheerModal` or a separate `ParlayModal`: toggle between "single cheer" and "start parlay"
- During parlay pick: user selects hamster for race N, then prompted to pick race N+1 (or commit as 2-race)
- Arena: "You have an active parlay" status card showing progress (1/2 or 2/3 correct)
- Result view: "Parlay still alive!" or "Parlay busted" state depending on result

**Effort estimate:** High. Requires new Anchor instructions, a new modal/flow, and admin tooling to call `settle_parlay_race` after each settlement. Can be shipped after mainnet launch as a v2 feature.

---

## Build Priority

| Feature | Status | Next action |
|---|---|---|
| Live implied odds | ✅ Done | — |
| Frenzy mode | ✅ Done | — |
| Dark horse bonus | ✅ Done | — |
| Hot streak multiplier | ✅ Done | — |
| Hamstar form cards | ✅ Done | — |
| Live cheer feed | ⚠️ Mock data | Wire Supabase realtime subscription post-launch |
| Multi-race parlay | ❌ Not built | Design ParlayAccount PDA + modal UX, ship as v2 |
