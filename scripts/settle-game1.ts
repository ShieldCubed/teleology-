import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as os from "os";

const RPC_URL = "https://api.devnet.solana.com";
const GAME_PDA = "8WsnQU7fC7HmbkoKDwMmxAgQL3zPiNdF3UhkrCbXpkbw";
const VAULT_PDA = "Ct3XcEsXRoNvaWbPBdGUfL58E2n97VSGnhcGw4tRNXeD";
const UNIVERSE_PDA = "2g57URHMNJYu46e7qQxNY4TDgJNxgwbJQA1xcYWzQPQv";

async function main() {
  const raw = JSON.parse(fs.readFileSync(os.homedir() + "/.config/solana/id.json", "utf8"));
  const payer = Keypair.fromSecretKey(Uint8Array.from(raw));
  const conn = new Connection(RPC_URL, "confirmed");
  const provider = new anchor.AnchorProvider(conn, new anchor.Wallet(payer), { commitment: "confirmed" });
  const idlJson = JSON.parse(fs.readFileSync(`${__dirname}/../target/idl/teleology.json`, "utf8"));
  const program = new anchor.Program(idlJson, provider);

  const tx = await program.methods
    .settleGame(true) // true = YES wins
    .accounts({
      game: new PublicKey(GAME_PDA),
      universe: new PublicKey(UNIVERSE_PDA),
      oracle: payer.publicKey,
    })
    .rpc();

  console.log("✅ Game settled! YES wins. Tx:", tx);
}

main().catch(e => { console.error("Error:", e.message); process.exit(1); });
