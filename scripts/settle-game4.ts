import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as os from "os";
import { RPC_URL } from "../app/lib/constants";

const idlJson = JSON.parse(fs.readFileSync(`${__dirname}/../target/idl/teleology.json`, "utf8"));
const GAME4_PDA = "9xm22exVqF5fVFmQsJ8BFVJHv2iVG11QzEChECd5c4Yk";

async function main() {
  const keypairPath = os.homedir() + "/.config/solana/id.json";
  const raw = JSON.parse(fs.readFileSync(keypairPath, "utf8"));
  const oracle = Keypair.fromSecretKey(Uint8Array.from(raw));
  const conn = new Connection(RPC_URL, "confirmed");
  const wallet = new anchor.Wallet(oracle);
  const provider = new anchor.AnchorProvider(conn, wallet, { commitment: "confirmed" });
  const program = new anchor.Program(idlJson, provider);
  const gamePubkey = new PublicKey(GAME4_PDA);

  const game = await (program.account as any).game.fetch(gamePubkey);
  console.log("Game status:", JSON.stringify(game.status));
  console.log("Oracle:", oracle.publicKey.toBase58());
  console.log("Game oracle:", game.oracle.toBase58());

  await program.methods
    .settleGame(true)
    .accounts({ game: gamePubkey, oracle: oracle.publicKey })
    .rpc();

  console.log("Game #4 settled! YES wins.");
  const updated = await (program.account as any).game.fetch(gamePubkey);
  console.log("New status:", JSON.stringify(updated.status));
}

main().catch(e => { console.error("Error:", e.message); process.exit(1); });
