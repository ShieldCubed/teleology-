use anchor_lang::prelude::*;

#[error_code]
pub enum TeleologyError {
    #[msg("Unauthorized: signer is not the authority")]
    Unauthorized,
    #[msg("Program is currently paused")]
    ProgramPaused,
    #[msg("Porosity value exceeds maximum of 100")]
    PorosityTooHigh,
    #[msg("Cannot loosen porosity: time lock has not expired")]
    PorosityTimeLocked,
    #[msg("Name exceeds maximum length of 32 bytes")]
    NameTooLong,
    #[msg("Invalid protocol fee: exceeds maximum basis points")]
    FeeTooHigh,
    #[msg("Invalid time: lock_time must be future, settle_time must be after lock_time")]
    InvalidTime,
    #[msg("Game is not open for betting")]
    GameNotOpen,
    #[msg("Game betting period has ended")]
    GameLocked,
    #[msg("Bet amount must be greater than zero")]
    ZeroAmount,
    #[msg("Token mint does not match game mint")]
    WrongMint,
    #[msg("Vault account does not match game vault")]
    WrongVault,
    #[msg("Game has already been settled")]
    GameAlreadySettled,
    #[msg("Game has not reached lock time yet")]
    GameNotLocked,
    #[msg("Game has not been settled yet")]
    GameNotSettled,
    #[msg("This bet did not win")]
    DidNotWin,
    #[msg("Winnings have already been claimed")]
    AlreadyClaimed,
    #[msg("Spawn fee mint does not match grandfather timer_mint")]
    WrongSpawnMint,
    #[msg("Insufficient TIMER balance to cover spawn fee")]
    InsufficientSpawnFee,
    #[msg("Oracle price is stale: timestamp too old")]
    OracleStale,
    #[msg("Oracle price is invalid: must be greater than zero")]
    OracleInvalidPrice,
}
