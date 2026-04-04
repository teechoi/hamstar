use anchor_lang::prelude::*;
use crate::state::{ProgramConfig, Race, RaceStatus};
use crate::errors::HamstarError;

#[derive(Accounts)]
#[instruction(race_id: u64)]
pub struct ProposeSettlement<'info> {
    #[account(
        seeds = [ProgramConfig::SEED],
        bump = config.bump,
    )]
    pub config: Account<'info, ProgramConfig>,

    #[account(
        mut,
        seeds = [Race::SEED, &race_id.to_le_bytes()],
        bump = race.bump,
        constraint = race.status == RaceStatus::Locked @ HamstarError::RaceNotLocked,
    )]
    pub race: Account<'info, Race>,

    /// Must be one of the three authorized settlers
    pub settler: Signer<'info>,
}

pub fn handler(ctx: Context<ProposeSettlement>, race_id: u64, hamster_index: u8) -> Result<()> {
    let config = &ctx.accounts.config;
    let race = &mut ctx.accounts.race;
    let settler_key = ctx.accounts.settler.key();

    require!(hamster_index < 3, HamstarError::InvalidHamsterIndex);

    // Identify which settler slot this is
    let slot = config.settler_index(&settler_key)
        .ok_or(HamstarError::UnauthorizedSettler)?;

    // Prevent double voting
    require!(race.settlement_votes[slot].is_none(), HamstarError::AlreadyVoted);

    // Record the vote
    let consensus = race.record_vote(slot, hamster_index);

    msg!(
        "Settler slot {} voted: hamster #{} wins race {} ({}/3 votes)",
        slot,
        hamster_index,
        race_id,
        race.settlement_vote_count,
    );

    // If 2 votes agree, auto-settle
    if consensus {
        let winner = race.agreed_winner().unwrap();
        race.winner_index = Some(winner);
        race.status = RaceStatus::Settled;
        msg!("Race {} SETTLED — winner: hamster #{}", race_id, winner);
    }

    Ok(())
}
