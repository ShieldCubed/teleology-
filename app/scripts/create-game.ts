import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as os from "os";
import { IDL } from "../lib/idl";
import { findUniverse, findGame } from "../lib/program";
import { RPC_URL, UNIVERSE_NAME, UNIVERSE_AUTHORITY } from "../lib/constants";

async function main() {
  const keypairPath = os.homedir() + "/.config/solana/id.json";
  const raw = JSON.parse(fs.readFileSync(keypairPath, "utf8"));
  const payer = Keypair.fromSecretKey(Uint8Array.from(raw));
  const conn = new Connection(RPC_URL, "confirmed");
  const wallet = new anchor.Wallet(payer);
  const provider = new anchor.AnchorProvider(conn, wallet, { commitment: "confirmed" });
  const program = new anchor.Program(IDL as anchor.Idl, provider);
  const authority = new PublicKey(UNIVERSE_AUTHORITY);
  const [universePda] = findUniverse(authority, UNIVERSE_NAME);
  const u = await (program.account as any).universe.fetch(universePda);
  const gameIndex = u.gameCount;
  const [gamePda] = findGame(universePda, gameIndex);
  console.log("Creating Game #" + gameIndex);
  const lockTime = Math.floor(Date.now() / 1000) + 60 * 60;
  const eventIdStr = "sol-price-above-200";
  const eventIdBytes = Buffer.alloc(32);
  Buffer.from(eventIdStr).copy(eventIdBytes);
  await program.methods
    .createGame(
      { customEvent: { eventId: Array.from(eventIdBytes) } },
      new anchor.BN(lockTime)
    )
    .accounts({
      universe: universePda,
      game: gamePda,
      authority: payer.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();
  console.log("Done! Game #" + gameIndex + " created, locks at: " + new Date(lockTime * 1000).toLocaleString());
  console.log("PDA: " + gamePda.toBase58());
}

main().catch(e => { console.error("Error:", e.message); process.exit(1); });
