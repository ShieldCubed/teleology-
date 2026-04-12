import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as os from "os";

const RPC_URL = "https://api.devnet.solana.com";
const PROGRAM_ID = "HpUrEiEnyqKHmhF5daMWygXKjZPPWgtnLMEvi13ZqBPu";

async function main() {
  const raw = JSON.parse(fs.readFileSync(os.homedir() + "/.config/solana/id.json", "utf8"));
  const payer = Keypair.fromSecretKey(Uint8Array.from(raw));
  const conn = new Connection(RPC_URL, "confirmed");
  const wallet = new anchor.Wallet(payer);
  const provider = new anchor.AnchorProvider(conn, wallet, { commitment: "confirmed" });
  const idlJson = JSON.parse(fs.readFileSync(`${__dirname}/../target/idl/teleology.json`, "utf8"));
  const program = new anchor.Program(idlJson, provider);
  const programId = new PublicKey(PROGRAM_ID);

  // Global config PDA
  const [globalConfigPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("global-config-v2"), payer.publicKey.toBuffer()], programId
  );
  console.log("GlobalConfig PDA:", globalConfigPda.toBase58());

  try {
    await program.methods.initializeGlobal(100).accounts({
      globalConfig: globalConfigPda,
      authority: payer.publicKey,
      treasury: payer.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();
    console.log("✅ Global initialized");
  } catch (e: any) { console.log("Global:", e.message?.slice(0, 80)); }

  // Universe PDA — seeds: ["universe", authority, nameBuf32]
  const nameBuf = Buffer.alloc(32);
  Buffer.from("Teleology").copy(nameBuf);

  const [universePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("universe"), payer.publicKey.toBuffer(), nameBuf], programId
  );
  console.log("Universe PDA:", universePda.toBase58());

  try {
    await program.methods.createUniverse({ financial: {} }, Array.from(nameBuf), 50).accounts({
      universe: universePda,
      globalConfig: globalConfigPda,
      authority: payer.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();
    console.log("✅ Universe created");
  } catch (e: any) { console.log("Universe:", e.message?.slice(0, 120)); }

  console.log("\n=== Save these values ===");
  console.log("GLOBAL_CONFIG_PDA =", globalConfigPda.toBase58());
  console.log("UNIVERSE_PDA =", universePda.toBase58());
}

main().catch(e => { console.error("Error:", e.message); process.exit(1); });
