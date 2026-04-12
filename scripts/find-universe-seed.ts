import { PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as os from "os";
import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("HpUrEiEnyqKHmhF5daMWygXKjZPPWgtnLMEvi13ZqBPu");
const TARGET = "2g57URHMNJYu46e7qQxNY4TDgJNxgwbJQA1xcYWzQPQv";

const raw = JSON.parse(fs.readFileSync(os.homedir() + "/.config/solana/id.json", "utf8"));
const payer = Keypair.fromSecretKey(Uint8Array.from(raw));

const name = "Teleology";
const nameBuf32 = Buffer.alloc(32);
Buffer.from(name).copy(nameBuf32);

const seeds = [
  { desc: "universe + authority + name_utf8", seeds: [Buffer.from("universe"), payer.publicKey.toBuffer(), Buffer.from(name)] },
  { desc: "universe + authority + nameBuf32", seeds: [Buffer.from("universe"), payer.publicKey.toBuffer(), nameBuf32] },
  { desc: "universe + name_utf8", seeds: [Buffer.from("universe"), Buffer.from(name)] },
  { desc: "universe + nameBuf32", seeds: [Buffer.from("universe"), nameBuf32] },
  { desc: "universe + authority", seeds: [Buffer.from("universe"), payer.publicKey.toBuffer()] },
];

for (const { desc, seeds: s } of seeds) {
  const [pda] = PublicKey.findProgramAddressSync(s, PROGRAM_ID);
  const match = pda.toBase58() === TARGET ? " ✅ MATCH!" : "";
  console.log(desc + ":", pda.toBase58() + match);
}
