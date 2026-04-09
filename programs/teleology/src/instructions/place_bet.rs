use anchor_lang::prelude::*;
use anchor_spl::token;
use crate::error::TeleologyError;
use crate::state::{Bet, BetSide, Game, GameStatus};

pub fn handler(ctx: Context<PlaceBet>, side: BetSide, amount: u64) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let clock = Clock::get()?;

    require!(game.status == GameStatus::Open, TeleologyError::GameNotOpen);
    require!(clock.unix_timestamp < game.lock_time, TeleologyError::GameLocked);
    require!(amount > 0, TeleologyError::ZeroAmount);

    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.key(),
            token::Transfer {
                from: ctx.accounts.bettor_token_account.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
                authority: ctx.accounts.bettor.to_account_info(),
            },
        ),
        amount,
    )?;

    match side {
        BetSide::Yes => game.yes_amount += amount,
        BetSide::No  => game.no_amount  += amount,
    }

    let bet = &mut ctx.accounts.bet;
    bet.game    = game.key();
    bet.bettor  = ctx.accounts.bettor.key();
    bet.side    = side;
    bet.amount  = amount;
    bet.claimed = false;
    bet.bump    = ctx.bumps.bet;

    Ok(())
}

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(
        init,
        payer = bettor,
        space = Bet::LEN,
        seeds = [b"bet", game.key().as_ref(), bettor.key().as_ref()],
        bump,
    )]
    pub bet: Account<'info, Bet>,

    #[account(
        mut,
        seeds = [
            b"game",
            game.universe.as_ref(),
            &game.game_index.to_le_bytes(),
        ],
        bump = game.bump,
    )]
    pub game: Account<'info, Game>,

    /// CHECK: validated via constraint against game.token_mint
    #[account(constraint = token_mint.key() == game.token_mint @ TeleologyError::WrongMint)]
    pub token_mint: UncheckedAccount<'info>,

    /// CHECK: validated via constraint — mint and owner checked
    #[account(mut, constraint = bettor_token_account.key() != vault.key())]
    pub bettor_token_account: UncheckedAccount<'info>,

    /// CHECK: validated via constraint against game.vault
    #[account(mut, constraint = vault.key() == game.vault @ TeleologyError::WrongVault)]
    pub vault: UncheckedAccount<'info>,

    #[account(mut)]
    pub bettor: Signer<'info>,

    /// CHECK: SPL token program
    pub token_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}
