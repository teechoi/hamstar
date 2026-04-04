use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::{ProgramConfig, Race, CheerPosition, RaceStatus};
use crate::errors::HamstarError;

/// Fallback — user pulls their own reward if the admin push failed.
/// Uses the same distribution math as push_reward.
#[derive(Accounts)]
#[instruction(race_id: u64)]
pub struct ClaimReward<'info> {
    #[account(
        seeds = [ProgramConfig::SEED],
        bump = config.bump,
    )]
    pub config: Box<Account<'info, ProgramConfig>>,

    #[account(
        seeds = [Race::SEED, &race_id.to_le_bytes()],
        bump = race.bump,
        constraint = race.status == RaceStatus::Settled @ HamstarError::RaceNotSettled,
    )]
    pub race: Box<Account<'info, Race>>,

    #[account(
        mut,
        seeds = [CheerPosition::SEED, race.key().as_ref(), user.key().as_ref()],
        bump = cheer_position.bump,
        has_one = user,
        constraint = !cheer_position.claimed @ HamstarError::AlreadyClaimed,
        constraint = cheer_position.hamster_index == race.winner_index.unwrap() @ HamstarError::NotAWinner,
    )]
    pub cheer_position: Box<Account<'info, CheerPosition>>,

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

    #[account(
        mut,
        constraint = user_token_account.owner == user.key(),
        constraint = user_token_account.mint == config.hamstar_mint @ HamstarError::InvalidMint,
    )]
    pub user_token_account: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        constraint = treasury_token_account.owner == config.treasury,
        constraint = treasury_token_account.mint == config.hamstar_mint @ HamstarError::InvalidMint,
    )]
    pub treasury_token_account: Box<Account<'info, TokenAccount>>,

    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<ClaimReward>, race_id: u64) -> Result<()> {
    let config = &ctx.accounts.config;
    let race = &ctx.accounts.race;
    let cheer = &mut ctx.accounts.cheer_position;

    let winner_index = race.winner_index.unwrap() as usize;
    let total_winning_weight = race.weight_per_hamster[winner_index];
    require!(total_winning_weight > 0, HamstarError::Overflow);

    let total_pool = race.total_pool as u128;
    let fee_amount = total_pool
        .checked_mul(config.fee_bps as u128)
        .ok_or(HamstarError::Overflow)?
        .checked_div(10_000)
        .ok_or(HamstarError::Overflow)?;
    let distributable = total_pool.checked_sub(fee_amount).ok_or(HamstarError::Overflow)?;

    let reward = distributable
        .checked_mul(cheer.weight)
        .ok_or(HamstarError::Overflow)?
        .checked_div(total_winning_weight)
        .ok_or(HamstarError::Overflow)? as u64;

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

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.race_escrow_authority.to_account_info(),
            },
            escrow_seeds,
        ),
        reward,
    )?;

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

    msg!("Reward claimed: {} HAMSTAR (race {})", reward, race_id);
    Ok(())
}
