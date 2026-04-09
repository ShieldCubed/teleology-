import { PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { findGlobalConfig, findUniverse } from '../pda';
import { CreateUniverseParams, UniverseType } from '../types';

export async function createUniverse(
  program: anchor.Program,
  authority: PublicKey,
  params: CreateUniverseParams
): Promise<{ tx: string; universe: PublicKey }> {
  const [globalConfig] = findGlobalConfig();
  const [universe] = findUniverse(authority, params.name);

  const tx = await program.methods
    .createUniverse(params.universeType, params.name, params.initialPorosity)
    .accounts({
      universe,
      globalConfig,
      authority,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return { tx, universe };
}

export async function setPorosity(
  program: anchor.Program,
  authority: PublicKey,
  universeName: string,
  newPorosity: number
): Promise<string> {
  const [universe] = findUniverse(authority, universeName);
  return program.methods
    .setPorosity(newPorosity)
    .accounts({ universe, authority })
    .rpc();
}

export async function fetchUniverse(
  program: anchor.Program,
  authority: PublicKey,
  name: string
) {
  const [universe] = findUniverse(authority, name);
  return (program.account as any).universe.fetch(universe);
}
