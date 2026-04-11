import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import * as fs from "fs";

const idlJson = JSON.parse(fs.readFileSync(`${__dirname}/../target/idl/teleology.json`, "utf8"));
const conn = new Connection('https://api.devnet.solana.com', 'confirmed');
const dummyWallet = new anchor.Wallet(anchor.web3.Keypair.generate());
const provider = new anchor.AnchorProvider(conn, dummyWallet, {});
const program = new anchor.Program(idlJson, provider);

const GAME3 = new PublicKey('3KgX7awdbT6mqy4cXtcSRMGQBCeJnyGCV24tyfwYWbZu');
const PHANTOM = new PublicKey('AF1gUfqNi3o2kA555iuqTToaAkCoMD8pb1auZFLGXnLe');

const [betPda] = PublicKey.findProgramAddressSync(
  [Buffer.from('bet'), GAME3.toBuffer(), PHANTOM.toBuffer()],
  program.programId
);

async function main() {
  console.log('Bet PDA:', betPda.toBase58());
  const bet = await (program.account as any).bet.fetch(betPda);
  console.log('Bet:', JSON.stringify(bet, null, 2));
}

main().catch(e => console.log('Error:', e.message));
