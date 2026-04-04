use anchor_lang::prelude::*;
use crate::state::{ProgramConfig, Race, RaceStatus};
use crate::errors::HamstarError;

/// This instruction is an alias — any subsequent settler vote after the first
/// that creates consensus also settles the race. The propose_settlement handler
/// handles consensus detection automatically.
///
/// This instruction exists as a named entry point so the admin UI can call it
/// semantically (first vote = propose, second vote = confirm).
/// Internally it delegates to the same logic.
#[derive(Accounts)]
#[instruction(race_id: u64)]
pub struct ConfirmSettlement<'info> {
    #[account(
        seeds = [ProgramConfig::SEED],
        bump = config.bump,
    )]
    pub config: Account<'info, ProgramConfig>,

    #[account(
        mut,
        seeds = [Race::SEED, &race_id.to_le_bytes()],
        bump = race.bump,
    )]
    pub race: Account<'info, Race>,

    pub settler: Signer<'info>,
}

pub fn handler(ctx: Context<ConfirmSettlement>, race_id: u64, hamster_index: u8) -> Result<()> {
    let config = &ctx.accounts.config;
    let race = &mut ctx.accounts.race;
    let settler_key = ctx.accounts.settler.key();

    // Still allow votes if not yet settled (handles 3rd voter breaking a tie)
    require!(
        race.status == RaceStatus::Locked || race.status == RaceStatus::Settled,
        HamstarError::RaceNotLocked
    );
    require!(hamster_index < 3, HamstarError::InvalidHamsterIndex);

    let slot = config.settler_index(&settler_key)
        .ok_or(HamstarError::UnauthorizedSettler)?;

    require!(race.settlement_votes[slot].is_none(), HamstarError::AlreadyVoted);

    let consensus = race.record_vote(slot, hamster_index);

    msg!(
        "Settler slot {} confirmed: hamster #{} wins race {} ({}/3 votes)",
        slot,
        hamster_index,
        race_id,
        race.settlement_vote_count,
    );

    if consensus && race.status != RaceStatus::Settled {
        let winner = race.agreed_winner().unwrap();
        race.winner_index = Some(winner);
        race.status = RaceStatus::Settled;
        msg!("Race {} SETTLED — winner: hamster #{}", race_id, winner);
    }

    Ok(())
}
