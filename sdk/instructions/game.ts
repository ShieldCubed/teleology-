import { PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { findGame, findUniverse } from '../pda';
import { CreateGameParams } from '../types';

export async function createGame(
  program: anchor.Program,
  authority: PublicKey,
  universeName: string,
  params: CreateGameParams
): Promise<{ tx: string; game: PublicKey }> {
  const [universe] = findUniverse(authority, universeName);
  const universeAccount = await (program.account as any).universe.fetch(universe);
  const [game] = findGame(universe, universeAccount.gameCount);

  const eventId = Buffer.alloc(32);
  Buffer.from(params.eventId).copy(eventId);
  const gameType = { customEvent: { eventId: Array.from(eventId) } };

  const tx = await program.methods
    .createGame(
      gameType,
      new anchor.BN(params.lockTime),
      new anchor.BN(params.settleTime)
    )
    .accounts({
      game,
      universe,
      oracle: params.oracle,
      tokenMint: params.tokenMint,
      vault: params.vault,
      authority,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return { tx, game };
}

export async function settleGame(
  program: anchor.Program,
  oracle: PublicKey,
  game: PublicKey,
  outcome: boolean
): Promise<string> {
  return program.methods
    .settleGame(outcome)
    .accounts({ game, oracle })
    .rpc();
}

export async function fetchGame(program: anchor.Program, game: PublicKey) {
  return (program.account as any).game.fetch(game);
}
