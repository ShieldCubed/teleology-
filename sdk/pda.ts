import { PublicKey } from '@solana/web3.js';

export const PROGRAM_ID = new PublicKey('YbHTUaJk2tQfX5VUY4iMv2bqd2oDHoS3MaerF6VKvgk');

export function findGlobalConfig(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('global-config')],
    PROGRAM_ID
  );
}

export function findUniverse(authority: PublicKey, name: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('universe'), authority.toBuffer(), Buffer.from(name)],
    PROGRAM_ID
  );
}

export function findGame(universe: PublicKey, gameIndex: number): [PublicKey, number] {
  const indexBuf = Buffer.alloc(4);
  indexBuf.writeUInt32LE(gameIndex, 0);
  return PublicKey.findProgramAddressSync(
    [Buffer.from('game'), universe.toBuffer(), indexBuf],
    PROGRAM_ID
  );
}

export function findBet(game: PublicKey, bettor: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('bet'), game.toBuffer(), bettor.toBuffer()],
    PROGRAM_ID
  );
}
