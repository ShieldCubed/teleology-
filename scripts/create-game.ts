import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as os from "os";
import { IDL } from "../app/lib/idl";
import { RPC_URL, UNIVERSE_AUTHORITY, TIMER_MINT, VAULT_ADDRESS, PROGRAM_ID } from "../app/lib/constants";

const ORACLE = "BqK3dgmbWx7itxhm84kcSbcRymSeMTBEc25FeKZV2zAK";
// Hardcode known-good addresses from state summary
const UNIVERSE_PDA = "87g4cgFaCopAufWwZ8ucyGsyJZCjLJLXrJ7a6q7j3kgq";

async function main() {
  const keypairPath = os.homedir() + "/.config/solana/id.json";
  const raw = JSON.parse(fs.readFileSync(keypairPath, "utf8"));
  const payer = Keypair.fromSecretKey(Uint8Array.from(raw));
  const conn = new Connection(RPC_URL, "confirmed");
  const wallet = new anchor.Wallet(payer);
  const provider = new anchor.AnchorProvider(conn, wallet, { commitment: "confirmed" });
  const program = new anchor.Program(IDL as anchor.Idl, provider);

  const universePda = new PublicKey(UNIVERSE_PDA);
  const u = await (program.account as any).universe.fetch(universePda);
  const gameIndex = u.gameCount;
  console.log("gameCount:", gameIndex);

  // Try u64
  const buf64 = Buffer.alloc(8);
  buf64.writeBigUInt64LE(BigInt(gameIndex), 0);
  const [gamePda64] = PublicKey.findProgramAddressSync(
    [Buffer.from('game'), universePda.toBuffer(), buf64],
    new PublicKey(PROGRAM_ID)
  );

  // Try u32
  const buf32 = Buffer.alloc(4);
  buf32.writeUInt32LE(Number(gameIndex), 0);
  const [gamePda32] = PublicKey.findProgramAddressSync(
    [Buffer.from('game'), universePda.toBuffer(), buf32],
    new PublicKey(PROGRAM_ID)
  );

  console.log("Game PDA u64:", gamePda64.toBase58());
  console.log("Game PDA u32:", gamePda32.toBase58());
  console.log("Program expects: DumwYxQjRsJrkGEt42TpeWtK6MZnofaWwu9am9ED6nyS");

  // Use whichever matches
  const gamePda = gamePda64.toBase58() === "DumwYxQjRsJrkGEt42TpeWtK6MZnofaWwu9am9ED6nyS" ? gamePda64 : gamePda32;
  console.log("Using:", gamePda.toBase58());

  const lockTime = Math.floor(Date.now() / 1000) + 60 * 60;
  const settleTime = Math.floor(Date.now() / 1000) + 2 * 60 * 60;
  const eventIdBytes = Buffer.alloc(32);
  Buffer.from("sol-price-above-200").copy(eventIdBytes);

  await program.methods
    .createGame(
      { customEvent: { eventId: Array.from(eventIdBytes) } },
      new anchor.BN(lockTime),
      new anchor.BN(settleTime)
    )
    .accounts({
      game: gamePda,
      universe: universePda,
      oracle: new PublicKey(ORACLE),
      tokenMint: new PublicKey(TIMER_MINT),
      vault: new PublicKey(VAULT_ADDRESS),
      authority: payer.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  console.log("Done! Game #" + gameIndex + " created");
  console.log("Locks at:   " + new Date(lockTime * 1000).toLocaleString());
}
main().catch(e => { console.error("Error:", e.message); process.exit(1); });
