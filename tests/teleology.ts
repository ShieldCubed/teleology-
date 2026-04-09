import * as anchor from '@coral-xyz/anchor';
import { PublicKey, SystemProgram, Keypair } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token';

const PROGRAM_ID = new PublicKey('YbHTUaJk2tQfX5VUY4iMv2bqd2oDHoS3MaerF6VKvgk');
const TIMER_MINT = new PublicKey('5vzSVRH5qMbwnP8TKNFKQ6ajN1AWh14Zbvu5ffbbtrXp');

async function main() {
  const connection = new anchor.web3.Connection('https://api.devnet.solana.com', 'confirmed');
  const wallet = anchor.AnchorProvider.env().wallet;
  const provider = new anchor.AnchorProvider(connection, wallet, { commitment: 'confirmed' });
  anchor.setProvider(provider);

  const idl = require('../target/idl/teleology.json');
  const program = new anchor.Program(idl as anchor.Idl, provider);
  const payer = (wallet as any).payer as Keypair;

  console.log('Wallet:', provider.wallet.publicKey.toBase58());

  const universeName = 'fsp-alpha';
  const [universe] = PublicKey.findProgramAddressSync(
    [Buffer.from('universe'), provider.wallet.publicKey.toBuffer(), Buffer.from(universeName)],
    PROGRAM_ID
  );
  console.log('Universe PDA:', universe.toBase58());

  const u = await (program.account as any).universe.fetch(universe);
  console.log('Game count:', u.gameCount);

  const gameIndexBuf = Buffer.alloc(4);
  gameIndexBuf.writeUInt32LE(u.gameCount, 0);
  const [game] = PublicKey.findProgramAddressSync(
    [Buffer.from('game'), universe.toBuffer(), gameIndexBuf],
    PROGRAM_ID
  );
  console.log('Game PDA:', game.toBase58());

  const vault = await getOrCreateAssociatedTokenAccount(
    connection, payer, TIMER_MINT, game, true
  );
  console.log('Vault:', vault.address.toBase58());

  const now = Math.floor(Date.now() / 1000);
  const lockTime = new anchor.BN(now + 3600);
  const settleTime = new anchor.BN(now + 7200);
  const eventId = Buffer.alloc(32);
  Buffer.from('sol-price-above-200').copy(eventId);
  const gameType = { customEvent: { eventId: Array.from(eventId) } };

  try {
    const tx = await program.methods
      .createGame(gameType, lockTime, settleTime)
      .accounts({
        game,
        universe,
        oracle: provider.wallet.publicKey,
        tokenMint: TIMER_MINT,
        vault: vault.address,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log('create_game tx:', tx);
  } catch (e: any) {
    console.log('create_game error:', e.message);
  }

  const g = await (program.account as any).game.fetch(game);
  console.log('Game status:', JSON.stringify(g.status));
  console.log('Game lock_time:', new Date(g.lockTime.toNumber() * 1000).toISOString());

  const [bet] = PublicKey.findProgramAddressSync(
    [Buffer.from('bet'), game.toBuffer(), provider.wallet.publicKey.toBuffer()],
    PROGRAM_ID
  );
  console.log('Bet PDA:', bet.toBase58());

  const bettorTokenAccount = new PublicKey('AHzCHw892FXWUkA2JWkqQPAC4BCiwTrztpKfkaSo5SkV');
  const betAmount = new anchor.BN(1000 * 1e9);

  try {
    const tx = await program.methods
      .placeBet({ yes: {} }, betAmount)
      .accounts({
        bet,
        game,
        tokenMint: TIMER_MINT,
        bettorTokenAccount,
        vault: vault.address,
        bettor: provider.wallet.publicKey,
        tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log('place_bet tx:', tx);
  } catch (e: any) {
    console.log('place_bet error:', e.message);
  }

  try {
    const b = await (program.account as any).bet.fetch(bet);
    console.log('Bet amount:', b.amount.toString());
    console.log('Bet side:', JSON.stringify(b.side));
    console.log('Bet claimed:', b.claimed);
  } catch (e: any) {
    console.log('Bet fetch error:', e.message);
  }

  console.log('All done!');
}

main().catch(console.error);
