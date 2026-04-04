use anchor_lang::prelude::*;

pub mod errors;
pub mod state;
pub mod instructions;

use instructions::*;

declare_id!("7VumdroGjCGoY8skLuATZY6U7uMJeiE6fRaewdXLSVwQ");

#[program]
pub mod hamstar_program {
    use super::*;

    /// Deploy the program with global config.
    /// Called once by the admin after deployment.
    pub fn initialize(ctx: Context<Initialize>, params: InitializeParams) -> Result<()> {
        instructions::initialize::handler(ctx, params)
    }

    /// Admin opens a new race with a pick window.
    pub fn create_race(
        ctx: Context<CreateRace>,
        race_id: u64,
        pick_window_open: i64,
        pick_window_close: i64,
    ) -> Result<()> {
        instructions::create_race::handler(ctx, race_id, pick_window_open, pick_window_close)
    }

    /// User stakes HAMSTAR tokens on a hamster during the pick window.
    pub fn place_cheer(
        ctx: Context<PlaceCheer>,
        race_id: u64,
        hamster_index: u8,
        amount: u64,
    ) -> Result<()> {
        instructions::place_cheer::handler(ctx, race_id, hamster_index, amount)
    }

    /// Close the pick window. Callable by anyone once the timestamp has passed.
    pub fn lock_race(ctx: Context<LockRace>, race_id: u64) -> Result<()> {
        instructions::lock_race::handler(ctx, race_id)
    }

    /// First settler votes for the winning hamster.
    /// If this creates a 2-of-3 consensus, the race settles immediately.
    pub fn propose_settlement(
        ctx: Context<ProposeSettlement>,
        race_id: u64,
        hamster_index: u8,
    ) -> Result<()> {
        instructions::propose_settlement::handler(ctx, race_id, hamster_index)
    }

    /// Second (or third) settler votes. Settles the race if consensus is reached.
    pub fn confirm_settlement(
        ctx: Context<ConfirmSettlement>,
        race_id: u64,
        hamster_index: u8,
    ) -> Result<()> {
        instructions::confirm_settlement::handler(ctx, race_id, hamster_index)
    }

    /// Admin server pushes reward to a winning cheer account (primary path).
    pub fn push_reward(ctx: Context<PushReward>, race_id: u64) -> Result<()> {
        instructions::push_reward::handler(ctx, race_id)
    }

    /// User pulls their own reward (fallback if push failed).
    pub fn claim_reward(ctx: Context<ClaimReward>, race_id: u64) -> Result<()> {
        instructions::claim_reward::handler(ctx, race_id)
    }

    /// Admin cancels a race. Enables full refunds for all cheerers.
    pub fn cancel_race(ctx: Context<CancelRace>, race_id: u64) -> Result<()> {
        instructions::cancel_race::handler(ctx, race_id)
    }

    /// User claims a full refund from a cancelled race.
    pub fn claim_refund(ctx: Context<ClaimRefund>, race_id: u64) -> Result<()> {
        instructions::claim_refund::handler(ctx, race_id)
    }
}
