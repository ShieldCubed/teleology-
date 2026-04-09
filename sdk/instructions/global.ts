import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { findGlobalConfig } from '../pda';

export async function initializeGlobal(
  program: anchor.Program,
  authority: PublicKey,
  treasury: PublicKey,
  protocolFeeBps: number
): Promise<string> {
  const [globalConfig] = findGlobalConfig();
  return program.methods
    .initializeGlobal(protocolFeeBps)
    .accounts({
      globalConfig,
      authority,
      treasury,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

export async function fetchGlobalConfig(program: anchor.Program) {
  const [globalConfig] = findGlobalConfig();
  return (program.account as any).globalConfig.fetch(globalConfig);
}
