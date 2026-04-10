import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as os from "os";
import { IDL } from "../app/lib/idl";
import { findUniverse } from "../app/lib/program";
import { RPC_URL, UNIVERSE_NAME, UNIVERSE_AUTHORITY } from "../app/lib/constants";

async function main() {
  const conn = new Connection(RPC_URL, "confirmed");
  const authority = new PublicKey(UNIVERSE_AUTHORITY);
  const keypairPath = os.homedir() + "/.config/solana/id.json";
  const raw = JSON.parse(fs.readFileSync(keypairPath, "utf8"));
  const payer = require("@solana/web3.js").Keypair.fromSecretKey(Uint8Array.from(raw));
  const wallet = new anchor.Wallet(payer);
  const provider = new anchor.AnchorProvider(conn, wallet, {});
  const program = new anchor.Program(IDL as anchor.Idl, provider);
  const [universePda] = findUniverse(authority, UNIVERSE_NAME);
  const u = await (program.account as any).universe.fetch(universePda);
  console.log("Keys:", Object.keys(u));
  for (const [k, v] of Object.entries(u)) {
    const val = (v as any)?.toBase58 ? (v as any).toBase58() : JSON.stringify(v);
    console.log(k + ":", val);
  }
}
main().catch(e => { console.error("Error:", e.message); process.exit(1); });
