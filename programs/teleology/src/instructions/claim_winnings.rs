use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::error::TeleologyError;
use crate::state::{Bet, BetSide, Game, GameStatus};

pub fn handler(ctx: Context<ClaimWinnings>) -> Result<()> {
    let game = &ctx.accounts.game;
    let bet = &mut ctx.accounts.bet;

    require!(game.status == GameStatus::Settled, TeleologyError::GameNotSettled);
    require!(!bet.claimed, TeleologyError::AlreadyClaimed);

    let outcome = game.outcome.ok_or(TeleologyError::GameNotSettled)?;
    let won = match bet.side {
        BetSide::Yes => outcome,
        BetSide::No  => !outcome,
    };
    require!(won, TeleologyError::DidNotWin);

    let winning_pool = if outcome { game.yes_amount } else { game.no_amount };
    let total_pool = game.yes_amount + game.no_amount;
    let payout = (bet.amount as u128)
        .checked_mul(total_pool as u128)
        .unwrap()
        .checked_div(winning_pool as u128)
        .unwrap() as u64;

    bet.claimed = true;

    let _game_key = ctx.accounts.game.key();
    let game_bump = ctx.accounts.game.bump;
    let universe_key = ctx.accounts.game.universe;
    let game_index = ctx.accounts.game.game_index;
    let seeds: &[&[&[u8]]] = &[&[b"game", universe_key.as_ref(), &game_index.to_le_bytes(), &[game_bump]]];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.key(),
            Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.winner_token_account.to_account_info(),
                authority: ctx.accounts.game.to_account_info(),
            },
            seeds,
        ),
        payout,
    )?;

    Ok(())
}

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    #[account(
        mut,
        seeds = [b"game", game.universe.as_ref(), &game.game_index.to_le_bytes()],
        bump = game.bump,
    )]
    pub game: Account<'info, Game>,

    #[account(
        mut,
        seeds = [b"bet", game.key().as_ref(), winner.key().as_ref()],
        bump = bet.bump,
        has_one = bettor @ TeleologyError::Unauthorized,
    )]
    pub bet: Account<'info, Bet>,

    #[account(
        mut,
        seeds = [b"vault", game.key().as_ref()],
        bump = game.vault_bump,
        constraint = vault.key() == game.vault @ TeleologyError::WrongVault,
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub winner_token_account: Account<'info, TokenAccount>,

    pub winner: Signer<'info>,

    /// CHECK: bettor pubkey for PDA validation
    pub bettor: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
}
