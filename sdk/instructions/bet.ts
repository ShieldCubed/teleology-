import { PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { findBet } from '../pda';
import { PlaceBetParams } from '../types';

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

export async function placeBet(
  program: anchor.Program,
  bettor: PublicKey,
  params: PlaceBetParams
): Promise<{ tx: string; bet: PublicKey }> {
  const [bet] = findBet(params.game, bettor);

  const tx = await program.methods
    .placeBet(params.side, params.amount)
    .accounts({
      bet,
      game: params.game,
      tokenMint: (await (program.account as any).game.fetch(params.game)).tokenMint,
      bettorTokenAccount: params.bettorTokenAccount,
      vault: params.vault,
      bettor,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return { tx, bet };
}

export async function claimWinnings(
  program: anchor.Program,
  winner: PublicKey,
  bettor: PublicKey,
  game: PublicKey,
  vault: PublicKey,
  winnerTokenAccount: PublicKey
): Promise<string> {
  const [bet] = findBet(game, bettor);
  return program.methods
    .claimWinnings()
    .accounts({
      game,
      bet,
      vault,
      winnerTokenAccount,
      winner,
      bettor,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
}

export async function fetchBet(
  program: anchor.Program,
  game: PublicKey,
  bettor: PublicKey
) {
  const [bet] = findBet(game, bettor);
  return (program.account as any).bet.fetch(bet);
}
