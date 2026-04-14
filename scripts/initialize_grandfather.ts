import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

const PROGRAM_ID = new PublicKey("HpUrEiEnyqKHmhF5daMWygXKjZPPWgtnLMEvi13ZqBPu");
const TIMER_MINT = new PublicKey("5vzSVRH5qMbwnP8TKNFKQ6ajN1AWh14Zbvu5ffbbtrXp");
const RPC_URL = "https://api.devnet.solana.com";

async function main() {
  const keypairPath = path.resolve(process.env.HOME!, ".config/solana/id.json");
  const raw = JSON.parse(fs.readFileSync(keypairPath, "utf8"));
  const authority = Keypair.fromSecretKey(Uint8Array.from(raw));
  console.log("Authority:", authority.publicKey.toBase58());

  const connection = new Connection(RPC_URL, "confirmed");
  const wallet = new anchor.Wallet(authority);
  const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
  anchor.setProvider(provider);

  const idlPath = path.resolve(__dirname, "../target/idl/teleology.json");
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf8"));
  const program = new anchor.Program(idl, provider);

  const [grandfatherPda, grandfatherBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("grandfather")],
    PROGRAM_ID
  );
  console.log("Grandfather PDA:", grandfatherPda.toBase58());
  console.log("Bump:", grandfatherBump);

  const existing = await connection.getAccountInfo(grandfatherPda);
  if (existing) {
    console.log("Already initialized! Data length:", existing.data.length);
    try {
      const gf = await (program.account as any).grandfather.fetch(grandfatherPda);
      console.log("Grandfather data:", JSON.stringify(gf, null, 2));
    } catch (e) {
      console.log("Could not decode:", e);
    }
    return;
  }

  const spawnFee = new anchor.BN(1_000 * 1e9);
  const stakeDuration = new anchor.BN(7 * 24 * 3600);

  console.log("Initializing grandfather...");
  console.log("  spawn_fee:", spawnFee.toString());
  console.log("  stake_duration:", stakeDuration.toString(), "seconds");

  const tx = await (program.methods as any)
    .initializeGrandfather(spawnFee, stakeDuration)
    .accounts({
      grandfather: grandfatherPda,
      treasury: authority.publicKey,
      timerMint: TIMER_MINT,
      authority: authority.publicKey,
      tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  console.log("\n Grandfather initialized!");
  console.log("Tx:", tx);
  console.log("Explorer: https://explorer.solana.com/tx/" + tx + "?cluster=devnet");

  const gf = await (program.account as any).grandfather.fetch(grandfatherPda);
  console.log("\nGrandfather account:", JSON.stringify(gf, null, 2));
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
