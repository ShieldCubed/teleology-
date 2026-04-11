use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint};
use crate::error::TeleologyError;
use crate::state::{Game, GameStatus, GameType, Universe};

pub fn handler(
    ctx: Context<CreateGame>,
    game_type: GameType,
    lock_time: i64,
    settle_time: i64,
) -> Result<()> {
    let universe = &mut ctx.accounts.universe;
    require!(!matches!(universe.porosity, 0), TeleologyError::ProgramPaused);

    let clock = Clock::get()?;
    require!(lock_time > clock.unix_timestamp, TeleologyError::InvalidTime);
    require!(settle_time > lock_time, TeleologyError::InvalidTime);

    let game = &mut ctx.accounts.game;
    game.universe = universe.key();
    game.oracle = ctx.accounts.oracle.key();
    game.token_mint = ctx.accounts.token_mint.key();
    game.vault = ctx.accounts.vault.key();
    game.game_type = game_type;
    game.status = GameStatus::Open;
    game.yes_amount = 0;
    game.no_amount = 0;
    game.outcome = None;
    game.lock_time = lock_time;
    game.settle_time = settle_time;
    game.game_index = universe.game_count;
    game.bump = ctx.bumps.game;
    game.vault_bump = ctx.bumps.vault;

    universe.game_count += 1;

    Ok(())
}

#[derive(Accounts)]
#[instruction(game_type: GameType, lock_time: i64, settle_time: i64)]
pub struct CreateGame<'info> {
    #[account(
        init,
        payer = authority,
        space = Game::LEN,
        seeds = [
            b"game",
            universe.key().as_ref(),
            &universe.game_count.to_le_bytes(),
        ],
        bump,
    )]
    pub game: Account<'info, Game>,

    #[account(
        mut,
        has_one = authority @ TeleologyError::Unauthorized,
    )]
    pub universe: Account<'info, Universe>,

    /// CHECK: oracle is just a pubkey, no data needed
    pub oracle: UncheckedAccount<'info>,

    pub token_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = authority,
        token::mint = token_mint,
        token::authority = game,
        seeds = [b"vault", game.key().as_ref()],
        bump,
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
