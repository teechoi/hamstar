use anchor_lang::prelude::*;
use crate::state::{ProgramConfig, Race, RaceStatus};
use crate::errors::HamstarError;

#[derive(Accounts)]
#[instruction(race_id: u64)]
pub struct CancelRace<'info> {
    #[account(
        seeds = [ProgramConfig::SEED],
        bump = config.bump,
        has_one = admin,
    )]
    pub config: Account<'info, ProgramConfig>,

    #[account(
        mut,
        seeds = [Race::SEED, &race_id.to_le_bytes()],
        bump = race.bump,
    )]
    pub race: Account<'info, Race>,

    pub admin: Signer<'info>,
}

pub fn handler(ctx: Context<CancelRace>, race_id: u64) -> Result<()> {
    let race = &mut ctx.accounts.race;

    require!(
        race.status == RaceStatus::Open || race.status == RaceStatus::Locked,
        HamstarError::RaceAlreadyFinal
    );

    race.status = RaceStatus::Cancelled;

    msg!("Race {} cancelled. {} HAMSTAR eligible for refund.", race_id, race.total_pool);
    Ok(())
}
