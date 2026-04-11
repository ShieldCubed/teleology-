import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as os from "os";
import { RPC_URL, PROGRAM_ID } from "../app/lib/constants";

const idlJson = JSON.parse(fs.readFileSync(`${__dirname}/../target/idl/teleology.json`, "utf8"));

const GAME3_PDA = "8ToGZPFEPw8t9xH4wXdpQJFMg5yDtudDXbjaipuzmXaB";

async function main() {
  const keypairPath = os.homedir() + "/.config/solana/id.json";
  const raw = JSON.parse(fs.readFileSync(keypairPath, "utf8"));
  const oracle = Keypair.fromSecretKey(Uint8Array.from(raw));
  const conn = new Connection(RPC_URL, "confirmed");
  const wallet = new anchor.Wallet(oracle);
  const provider = new anchor.AnchorProvider(conn, wallet, { commitment: "confirmed" });
  const program = new anchor.Program(idlJson, provider);
  const gamePubkey = new PublicKey(GAME3_PDA);
  const game = await (program.account as any).game.fetch(gamePubkey);
  console.log("Game status:", JSON.stringify(game.status));
  console.log("Lock time:", new Date(game.lockTime.toNumber() * 1000).toLocaleString());
  console.log("Oracle:", oracle.publicKey.toBase58());
  console.log("Game oracle:", game.oracle.toBase58());

  await program.methods
    .settleGame(true)
    .accounts({
      game: gamePubkey,
      oracle: oracle.publicKey,
    })
    .rpc();

  console.log("Game #3 settled! YES wins.");
  const updated = await (program.account as any).game.fetch(gamePubkey);
  console.log("New status:", JSON.stringify(updated.status));
  console.log("Outcome:", JSON.stringify(updated.outcome));
}

main().catch(e => { console.error("Error:", e.message); process.exit(1); });
