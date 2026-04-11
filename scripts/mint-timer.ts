import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import * as fs from "fs";
import * as os from "os";
import { RPC_URL, TIMER_MINT } from "../app/lib/constants";

const RECIPIENT = "AF1gUfqNi3o2kA555iuqTToaAkCoMD8pb1auZFLGXnLe";

async function main() {
  const keypairPath = os.homedir() + "/.config/solana/id.json";
  const raw = JSON.parse(fs.readFileSync(keypairPath, "utf8"));
  const payer = Keypair.fromSecretKey(Uint8Array.from(raw));
  const conn = new Connection(RPC_URL, "confirmed");
  const mint = new PublicKey(TIMER_MINT);
  const recipient = new PublicKey(RECIPIENT);

  console.log("Minting TIMER to:", recipient.toBase58());
  const ata = await getOrCreateAssociatedTokenAccount(conn, payer, mint, recipient);
  console.log("Token account:", ata.address.toBase58());
  await mintTo(conn, payer, mint, ata.address, payer, 10_000 * 1e9);
  console.log("Done! Minted 10,000 TIMER to your wallet");
}
main().catch(e => { console.error("Error:", e.message); process.exit(1); });
