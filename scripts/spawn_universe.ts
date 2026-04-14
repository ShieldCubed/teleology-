import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";

const PROGRAM_ID = new PublicKey("HpUrEiEnyqKHmhF5daMWygXKjZPPWgtnLMEvi13ZqBPu");
const TIMER_MINT = new PublicKey("5vzSVRH5qMbwnP8TKNFKQ6ajN1AWh14Zbvu5ffbbtrXp");
const RPC_URL = "https://api.devnet.solana.com";

async function main() {
  const keypairPath = path.resolve(process.env.HOME!, ".config/solana/id.json");
  const raw = JSON.parse(fs.readFileSync(keypairPath, "utf8"));
  const spawner = Keypair.fromSecretKey(Uint8Array.from(raw));
  console.log("Spawner:", spawner.publicKey.toBase58());

  const connection = new Connection(RPC_URL, "confirmed");
  const wallet = new anchor.Wallet(spawner);
  const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
  anchor.setProvider(provider);

  const idlPath = path.resolve(__dirname, "../target/idl/teleology.json");
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf8"));
  const program = new anchor.Program(idl, provider);

  const [grandfatherPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("grandfather")],
    PROGRAM_ID
  );

  const universeName = "alpha-1";
  const [universePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("universe"), spawner.publicKey.toBuffer(), Buffer.from(universeName)],
    PROGRAM_ID
  );
  console.log("Grandfather PDA:", grandfatherPda.toBase58());
  console.log("Child Universe PDA:", universePda.toBase58());

  // Check if already exists
  const existing = await connection.getAccountInfo(universePda);
  if (existing) {
    console.log("Universe already exists!");
    const u = await (program.account as any).universe.fetch(universePda);
    console.log(JSON.stringify(u, null, 2));
    return;
  }

  // Get spawner TIMER token account
  const spawnerTokenAccount = await getAssociatedTokenAddress(TIMER_MINT, spawner.publicKey);
  const bal = await connection.getTokenAccountBalance(spawnerTokenAccount);
  console.log("TIMER balance:", bal.value.uiAmount);

  // Fetch grandfather to check spawn_fee
  const gf = await (program.account as any).grandfather.fetch(grandfatherPda);
  console.log("Spawn fee:", Number(gf.spawnFee) / 1e9, "TIMER");

  console.log("\nSpawning child universe...");
  const tx = await (program.methods as any)
    .spawnUniverse({ financial: {} }, universeName, 50)
    .accounts({
      universe: universePda,
      grandfather: grandfatherPda,
      timerMint: TIMER_MINT,
      spawnerTokenAccount,
      spawner: spawner.publicKey,
      tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  console.log("\nChild universe spawned!");
  console.log("Tx:", tx);
  console.log("Explorer: https://explorer.solana.com/tx/" + tx + "?cluster=devnet");

  const u = await (program.account as any).universe.fetch(universePda);
  console.log("\nUniverse:", JSON.stringify(u, null, 2));
}

main().catch((e) => { console.error("Error:", e); process.exit(1); });
