import { PublicKey } from '@solana/web3.js';
import { PROGRAM_ID } from './constants';

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
