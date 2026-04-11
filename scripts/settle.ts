import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as os from "os";
import { RPC_URL } from "../app/lib/constants";

const idlJson = JSON.parse(fs.readFileSync(`${__dirname}/../target/idl/teleology.json`, "utf8"));

async function main() {
  const gamePda = process.argv[2];
  const outcomeArg = process.argv[3];

  if (!gamePda || !outcomeArg) {
    console.error("Usage: npx ts-node scripts/settle.ts <GAME_PDA> <yes|no>");
    process.exit(1);
  }
  if (!["yes", "no"].includes(outcomeArg.toLowerCase())) {
    console.error("Outcome must be 'yes' or 'no'");
    process.exit(1);
  }

  const outcome = outcomeArg.toLowerCase() === "yes";
  const keypairPath = os.homedir() + "/.config/solana/id.json";
  const oracle = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(keypairPath, "utf8"))));
  const conn = new Connection(RPC_URL, "confirmed");
  const provider = new anchor.AnchorProvider(conn, new anchor.Wallet(oracle), { commitment: "confirmed" });
  const program = new anchor.Program(idlJson, provider);
  const gamePubkey = new PublicKey(gamePda);

  const game = await (program.account as any).game.fetch(gamePubkey);
  console.log("Game PDA:  ", gamePda);
  console.log("Status:    ", JSON.stringify(game.status));
  console.log("Lock time: ", new Date(game.lockTime.toNumber() * 1000).toLocaleString());
  console.log("Settling:  ", outcome ? "YES wins" : "NO wins");

  if (game.status.settled !== undefined) {
    console.error("Error: Game is already settled.");
    process.exit(1);
  }
  if (game.status.open !== undefined) {
    console.error("Error: Game has not reached lock time yet.");
    process.exit(1);
  }

  await program.methods
    .settleGame(outcome)
    .accounts({ game: gamePubkey, oracle: oracle.publicKey })
    .rpc();

  const updated = await (program.account as any).game.fetch(gamePubkey);
  console.log("\n✅ Settled!");
  console.log("New status:", JSON.stringify(updated.status));
  console.log("Outcome:   ", JSON.stringify(updated.outcome));
}

main().catch(e => { console.error("Error:", e.message); process.exit(1); });
