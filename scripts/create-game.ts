import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as os from "os";
import { IDL } from "../app/lib/idl";
import { RPC_URL, UNIVERSE_NAME, TIMER_MINT, VAULT_ADDRESS, PROGRAM_ID } from "../app/lib/constants";

const UNIVERSE_PDA = "87g4cgFaCopAufWwZ8ucyGsyJZCjLJLXrJ7a6q7j3kgq";
const ORACLE = "BqK3dgmbWx7itxhm84kcSbcRymSeMTBEc25FeKZV2zAK";

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

  // Derive game PDA with u32
  const buf = Buffer.alloc(4);
  buf.writeUInt32LE(gameIndex, 0);
  const [gamePda] = PublicKey.findProgramAddressSync(
    [Buffer.from('game'), universePda.toBuffer(), buf],
    new PublicKey(PROGRAM_ID)
  );

  // Lock time = 10 minutes AGO, settle = 5 minutes ago
  const now = Math.floor(Date.now() / 1000);
  const lockTime = now - 10 * 60;
  const settleTime = now - 5 * 60;

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

  console.log("Game #" + gameIndex + " created with lock time IN THE PAST");
  console.log("PDA:", gamePda.toBase58());
  console.log("Can be settled immediately!");
}
main().catch(e => { console.error("Error:", e.message); process.exit(1); });
