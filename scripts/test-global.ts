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
  const provider = new anchor.AnchorProvider(conn, new anchor.Wallet(payer), { commitment: "confirmed" });
  const idlJson = JSON.parse(fs.readFileSync(`${__dirname}/../target/idl/teleology.json`, "utf8"));
  const program = new anchor.Program(idlJson, provider);
  const programId = new PublicKey(PROGRAM_ID);

  const [globalConfigPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("global-config-v2"), payer.publicKey.toBuffer()], programId
  );
  console.log("GlobalConfig PDA:", globalConfigPda.toBase58());

  // Check if account already exists
  const info = await conn.getAccountInfo(globalConfigPda);
  console.log("Account exists:", !!info, "lamports:", info?.lamports, "dataLen:", info?.data.length);

  const tx = await program.methods
    .initializeGlobal(100)
    .accounts({
      globalConfig: globalConfigPda,
      authority: payer.publicKey,
      treasury: payer.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();
  console.log("✅ Done! Tx:", tx);
}

main().catch(e => { console.error("Full error:", e); process.exit(1); });
