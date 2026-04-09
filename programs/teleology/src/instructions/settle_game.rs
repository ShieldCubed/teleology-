use anchor_lang::prelude::*;
use crate::error::TeleologyError;
use crate::state::{Game, GameStatus};

pub fn handler(ctx: Context<SettleGame>, outcome: bool) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let clock = Clock::get()?;

    require!(
        game.status == GameStatus::Open || game.status == GameStatus::Locked,
        TeleologyError::GameAlreadySettled
    );
    require!(
        clock.unix_timestamp >= game.lock_time,
        TeleologyError::GameNotLocked
    );
    require!(
        ctx.accounts.oracle.key() == game.oracle,
        TeleologyError::Unauthorized
    );

    game.status = GameStatus::Settled;
    game.outcome = Some(outcome);

    Ok(())
}

#[derive(Accounts)]
pub struct SettleGame<'info> {
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

    pub oracle: Signer<'info>,
}
