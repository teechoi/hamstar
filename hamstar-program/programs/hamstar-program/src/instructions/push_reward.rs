use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::{ProgramConfig, Race, CheerPosition, RaceStatus};
use crate::errors::HamstarError;

#[derive(Accounts)]
#[instruction(race_id: u64)]
pub struct PushReward<'info> {
    #[account(
        seeds = [ProgramConfig::SEED],
        bump = config.bump,
        has_one = admin,
    )]
    pub config: Box<Account<'info, ProgramConfig>>,

    #[account(
        mut,
        seeds = [Race::SEED, &race_id.to_le_bytes()],
        bump = race.bump,
        constraint = race.status == RaceStatus::Settled @ HamstarError::RaceNotSettled,
    )]
    pub race: Box<Account<'info, Race>>,

    #[account(
        mut,
        seeds = [CheerPosition::SEED, race.key().as_ref(), winner.key().as_ref()],
        bump = cheer_position.bump,
        constraint = !cheer_position.claimed @ HamstarError::AlreadyClaimed,
        constraint = cheer_position.hamster_index == race.winner_index.unwrap() @ HamstarError::NotAWinner,
    )]
    pub cheer_position: Box<Account<'info, CheerPosition>>,

    /// Escrow token account (source)
    #[account(
        mut,
        address = race.escrow,
    )]
    pub escrow: Box<Account<'info, TokenAccount>>,

    /// CHECK: PDA used as escrow authority
    #[account(
        seeds = [Race::ESCROW_SEED, &race_id.to_le_bytes()],
        bump = race.escrow_bump,
    )]
    pub race_escrow_authority: UncheckedAccount<'info>,

    /// Winner's HAMSTAR token account (destination)
    #[account(
        mut,
        constraint = winner_token_account.owner == winner.key(),
        constraint = winner_token_account.mint == config.hamstar_mint @ HamstarError::InvalidMint,
    )]
    pub winner_token_account: Box<Account<'info, TokenAccount>>,

    /// Treasury token account (receives 2.5% fee)
    #[account(
        mut,
        constraint = treasury_token_account.owner == config.treasury,
        constraint = treasury_token_account.mint == config.hamstar_mint @ HamstarError::InvalidMint,
    )]
    pub treasury_token_account: Box<Account<'info, TokenAccount>>,

    /// CHECK: winner wallet (used for PDA derivation and ATA validation)
    pub winner: UncheckedAccount<'info>,

    pub admin: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<PushReward>, race_id: u64) -> Result<()> {
    let config = &ctx.accounts.config;
    let race = &ctx.accounts.race;
    let cheer = &mut ctx.accounts.cheer_position;

    let winner_index = race.winner_index.unwrap() as usize;
    let total_winning_weight = race.weight_per_hamster[winner_index];

    require!(total_winning_weight > 0, HamstarError::Overflow);

    // Distributable pool after fee
    let total_pool = race.total_pool as u128;
    let fee_amount = total_pool
        .checked_mul(config.fee_bps as u128)
        .ok_or(HamstarError::Overflow)?
        .checked_div(10_000)
        .ok_or(HamstarError::Overflow)?;
    let distributable = total_pool.checked_sub(fee_amount).ok_or(HamstarError::Overflow)?;

    // This winner's reward
    let reward = distributable
        .checked_mul(cheer.weight)
        .ok_or(HamstarError::Overflow)?
        .checked_div(total_winning_weight)
        .ok_or(HamstarError::Overflow)? as u64;

    // Treasury fee (2.5% of this winner's proportional share of total fees)
    let treasury_cut = (total_pool
        .checked_mul(config.treasury_bps() as u128)
        .ok_or(HamstarError::Overflow)?
        .checked_div(10_000)
        .ok_or(HamstarError::Overflow)?)
        .checked_mul(cheer.weight)
        .ok_or(HamstarError::Overflow)?
        .checked_div(total_winning_weight)
        .ok_or(HamstarError::Overflow)? as u64;

    let escrow_seeds: &[&[&[u8]]] = &[&[
        Race::ESCROW_SEED,
        &race_id.to_le_bytes(),
        &[race.escrow_bump],
    ]];

    // Transfer reward to winner
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow.to_account_info(),
                to: ctx.accounts.winner_token_account.to_account_info(),
                authority: ctx.accounts.race_escrow_authority.to_account_info(),
            },
            escrow_seeds,
        ),
        reward,
    )?;

    // Transfer treasury fee
    if treasury_cut > 0 {
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow.to_account_info(),
                    to: ctx.accounts.treasury_token_account.to_account_info(),
                    authority: ctx.accounts.race_escrow_authority.to_account_info(),
                },
                escrow_seeds,
            ),
            treasury_cut,
        )?;
    }

    cheer.claimed = true;

    msg!(
        "Reward pushed: {} HAMSTAR to winner (race {})",
        reward,
        race_id
    );
    Ok(())
}
