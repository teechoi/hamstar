use anchor_lang::prelude::*;
use crate::state::ProgramConfig;
use crate::errors::HamstarError;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = admin,
        space = ProgramConfig::SIZE,
        seeds = [ProgramConfig::SEED],
        bump,
    )]
    pub config: Account<'info, ProgramConfig>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitializeParams {
    pub settlers: [Pubkey; 3],
    pub treasury: Pubkey,
    pub hamstar_mint: Pubkey,
    pub fee_bps: u16,
    pub burn_bps: u16,
    pub min_cheer_amount: u64,
    pub time_weight_max_bps: u16,
    pub time_weight_min_bps: u16,
    pub max_pool_share_bps: u16,
}

pub fn handler(ctx: Context<Initialize>, params: InitializeParams) -> Result<()> {
    require!(params.burn_bps <= params.fee_bps, HamstarError::Overflow);
    require!(params.time_weight_max_bps >= params.time_weight_min_bps, HamstarError::Overflow);
    require!(params.max_pool_share_bps <= 10_000, HamstarError::Overflow);

    let config = &mut ctx.accounts.config;
    config.admin = ctx.accounts.admin.key();
    config.settlers = params.settlers;
    config.treasury = params.treasury;
    config.hamstar_mint = params.hamstar_mint;
    config.fee_bps = params.fee_bps;
    config.burn_bps = params.burn_bps;
    config.min_cheer_amount = params.min_cheer_amount;
    config.time_weight_max_bps = params.time_weight_max_bps;
    config.time_weight_min_bps = params.time_weight_min_bps;
    config.max_pool_share_bps = params.max_pool_share_bps;
    config.bump = ctx.bumps.config;

    msg!("HamstarHub program initialized");
    Ok(())
}
