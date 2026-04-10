import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as os from "os";
import { IDL } from "../app/lib/idl";
import { findUniverse } from "../app/lib/program";
import { RPC_URL, UNIVERSE_NAME, UNIVERSE_AUTHORITY, PROGRAM_ID } from "../app/lib/constants";

const KNOWN_GAME0 = "87g4cgFaCopAufWwZ8ucyGsyJZCjLJLXrJ7a6q7j3kgq";

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

  const pid = new PublicKey(PROGRAM_ID);

  for (let i = 0; i <= 2; i++) {
    const b32 = Buffer.alloc(4); b32.writeUInt32LE(i, 0);
    const b64 = Buffer.alloc(8); b64.writeBigUInt64LE(BigInt(i), 0);
    const [p32] = PublicKey.findProgramAddressSync([Buffer.from('game'), universePda.toBuffer(), b32], pid);
    const [p64] = PublicKey.findProgramAddressSync([Buffer.from('game'), universePda.toBuffer(), b64], pid);
    const match32 = i === 0 ? (p32.toBase58() === KNOWN_GAME0 ? " <<< MATCH" : "") : "";
    const match64 = i === 0 ? (p64.toBase58() === KNOWN_GAME0 ? " <<< MATCH" : "") : "";
    console.log("index " + i + " u32: " + p32.toBase58() + match32);
    console.log("index " + i + " u64: " + p64.toBase58() + match64);
  }
  console.log("Known game #0:", KNOWN_GAME0);
}
main().catch(e => { console.error("Error:", e.message); process.exit(1); });
