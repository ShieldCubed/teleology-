use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, Token, TokenAccount};
use crate::constants::*;
use crate::error::TeleologyError;
use crate::state::{Grandfather, Universe, UniverseType};

pub fn handler(
    ctx: Context<SpawnUniverse>,
    universe_type: UniverseType,
    name: String,
    initial_porosity: u8,
) -> Result<()> {
    require!(name.len() <= MAX_NAME_LEN, TeleologyError::NameTooLong);
    require!(initial_porosity <= MAX_POROSITY, TeleologyError::PorosityTooHigh);

    let grandfather = &mut ctx.accounts.grandfather;

    // Burn spawn_fee TIMER tokens from spawner
    let burn_amount = grandfather.spawn_fee;
    let cpi_accounts = Burn {
        mint: ctx.accounts.timer_mint.to_account_info(),
        from: ctx.accounts.spawner_token_account.to_account_info(),
        authority: ctx.accounts.spawner.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(ctx.accounts.token_program.key(), cpi_accounts);
    token::burn(cpi_ctx, burn_amount)?;

    // Initialize child universe
    let universe = &mut ctx.accounts.universe;
    universe.authority = ctx.accounts.spawner.key();
    universe.universe_type = universe_type;
    universe.porosity = initial_porosity;
    universe.porosity_locked_until = 0;
    universe.game_count = 0;
    universe.bump = ctx.bumps.universe;

    // Pack name into fixed [u8; 32]
    let mut name_bytes = [0u8; 32];
    let bytes = name.as_bytes();
    name_bytes[..bytes.len()].copy_from_slice(bytes);
    universe.name = name_bytes;

    // Increment grandfather universe count
    grandfather.universe_count = grandfather.universe_count.checked_add(1).unwrap();

    msg!(
        "Child universe spawned: {} (type={:?}, porosity={}, count={})",
        name,
        universe.universe_type,
        initial_porosity,
        grandfather.universe_count
    );

    Ok(())
}

#[derive(Accounts)]
#[instruction(universe_type: UniverseType, name: String)]
pub struct SpawnUniverse<'info> {
    #[account(
        init,
        payer = spawner,
        space = Universe::LEN,
        seeds = [b"universe", spawner.key().as_ref(), name.as_bytes()],
        bump,
    )]
    pub universe: Account<'info, Universe>,

    #[account(
        mut,
        seeds = [b"grandfather"],
        bump = grandfather.bump,
    )]
    pub grandfather: Account<'info, Grandfather>,

    #[account(mut)]
    pub timer_mint: Account<'info, anchor_spl::token::Mint>,

    #[account(
        mut,
        token::mint = timer_mint,
        token::authority = spawner,
    )]
    pub spawner_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub spawner: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
