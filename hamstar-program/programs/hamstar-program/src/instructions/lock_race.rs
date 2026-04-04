use anchor_lang::prelude::*;
use crate::state::{Race, RaceStatus};
use crate::errors::HamstarError;

#[derive(Accounts)]
#[instruction(race_id: u64)]
pub struct LockRace<'info> {
    #[account(
        mut,
        seeds = [Race::SEED, &race_id.to_le_bytes()],
        bump = race.bump,
        constraint = race.status == RaceStatus::Open @ HamstarError::RaceNotOpen,
    )]
    pub race: Account<'info, Race>,

    /// Anyone can call this once the window has passed
    pub caller: Signer<'info>,
}

pub fn handler(ctx: Context<LockRace>, race_id: u64) -> Result<()> {
    let race = &mut ctx.accounts.race;
    let now = Clock::get()?.unix_timestamp;

    require!(now >= race.pick_window_close, HamstarError::WindowStillOpen);

    race.status = RaceStatus::Locked;

    msg!("Race {} locked. Total pool: {} HAMSTAR", race_id, race.total_pool);
    Ok(())
}
