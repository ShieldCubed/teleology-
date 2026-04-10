import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { IDL } from './idl';
import { PROGRAM_ID, RPC_URL } from './constants';

export function getProgram(wallet: anchor.Wallet) {
  const connection = new Connection(RPC_URL, 'confirmed');
  const provider = new anchor.AnchorProvider(connection, wallet, { commitment: 'confirmed' });
  anchor.setProvider(provider);
  return new anchor.Program(IDL as anchor.Idl, provider);
}

export function findGlobalConfig() {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('global-config')],
    new PublicKey(PROGRAM_ID)
  );
}

export function findUniverse(authority: PublicKey, name: string) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('universe'), authority.toBuffer(), Buffer.from(name)],
    new PublicKey(PROGRAM_ID)
  );
}

export function findGame(universe: PublicKey, gameIndex: number) {
  const buf = Buffer.alloc(4);
  buf.writeUInt32LE(gameIndex, 0);
  return PublicKey.findProgramAddressSync(
    [Buffer.from('game'), universe.toBuffer(), buf],
    new PublicKey(PROGRAM_ID)
  );
}

export function findBet(game: PublicKey, bettor: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('bet'), game.toBuffer(), bettor.toBuffer()],
    new PublicKey(PROGRAM_ID)
  );
}
