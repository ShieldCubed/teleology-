import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import * as fs from "fs";

const idlJson = JSON.parse(fs.readFileSync(`${__dirname}/../target/idl/teleology.json`, "utf8"));
const conn = new Connection('https://api.devnet.solana.com', 'confirmed');
const PHANTOM = new PublicKey('AF1gUfqNi3o2kA555iuqTToaAkCoMD8pb1auZFLGXnLe');
const GAME3 = new PublicKey('3KgX7awdbT6mqy4cXtcSRMGQBCeJnyGCV24tyfwYWbZu');
const VAULT = new PublicKey('2Kasabzr99M6v9bSaqmf7znH5KKfs5uT5XacTzbvu23b');
const TIMER_MINT = new PublicKey('5vzSVRH5qMbwnP8TKNFKQ6ajN1AWh14Zbvu5ffbbtrXp');
const TOKEN_PROGRAM = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

const dummyWallet = new anchor.Wallet(anchor.web3.Keypair.generate());
const provider = new anchor.AnchorProvider(conn, dummyWallet, {});
const program = new anchor.Program(idlJson, provider);

async function main() {
  const [betPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('bet'), GAME3.toBuffer(), PHANTOM.toBuffer()],
    program.programId
  );
  const winnerAta = await anchor.utils.token.associatedAddress({ mint: TIMER_MINT, owner: PHANTOM });
  console.log('betPda:', betPda.toBase58());
  console.log('winnerAta:', winnerAta.toBase58());

  try {
    const tx = await program.methods.claimWinnings()
      .accounts({
        game: GAME3,
        bet: betPda,
        vault: VAULT,
        winnerTokenAccount: winnerAta,
        winner: PHANTOM,
        bettor: PHANTOM,
        tokenProgram: TOKEN_PROGRAM,
      })
      .transaction();
    tx.feePayer = PHANTOM;
    tx.recentBlockhash = (await conn.getLatestBlockhash()).blockhash;
    const sim = await conn.simulateTransaction(tx);
    console.log('Sim logs:', JSON.stringify(sim.value.logs, null, 2));
    console.log('Sim err:', JSON.stringify(sim.value.err));
  } catch(e: any) {
    console.error('Error:', e.message);
  }
}

main().catch(e => console.error(e.message));
