import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as os from "os";

const RPC_URL = "https://api.devnet.solana.com";
const PROGRAM_ID = "HpUrEiEnyqKHmhF5daMWygXKjZPPWgtnLMEvi13ZqBPu";
const UNIVERSE_PDA = "2g57URHMNJYu46e7qQxNY4TDgJNxgwbJQA1xcYWzQPQv";
const TIMER_MINT = "5vzSVRH5qMbwnP8TKNFKQ6ajN1AWh14Zbvu5ffbbtrXp";
const ORACLE = "BqK3dgmbWx7itxhm84kcSbcRymSeMTBEc25FeKZV2zAK";

async function main() {
  const raw = JSON.parse(fs.readFileSync(os.homedir() + "/.config/solana/id.json", "utf8"));
  const payer = Keypair.fromSecretKey(Uint8Array.from(raw));
  const conn = new Connection(RPC_URL, "confirmed");
  const wallet = new anchor.Wallet(payer);
  const provider = new anchor.AnchorProvider(conn, wallet, { commitment: "confirmed" });
  const idlJson = JSON.parse(fs.readFileSync(`${__dirname}/../target/idl/teleology.json`, "utf8"));
  const program = new anchor.Program(idlJson, provider);
  const programId = new PublicKey(PROGRAM_ID);

  const universePda = new PublicKey(UNIVERSE_PDA);
  const u = await (program.account as any).universe.fetch(universePda);
  const gameIndex = u.gameCount;

  const buf = Buffer.alloc(4);
  buf.writeUInt32LE(gameIndex, 0);
  const [gamePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("game"), universePda.toBuffer(), buf], programId
  );

  // Vault is derived from game PDA
  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), gamePda.toBuffer()], programId
  );

  const now = Math.floor(Date.now() / 1000);
  const lockTime = now + 300;
  const settleTime = now + 600;

  const symbol = Buffer.alloc(8);
  Buffer.from("SOL").copy(symbol);

  const gameType = {
    assetPrice: {
      assetSymbol: Array.from(symbol),
      targetPrice: new anchor.BN(200),
      direction: { above: {} },
    }
  };

  const tx = await program.methods
    .createGame(gameType, new anchor.BN(lockTime), new anchor.BN(settleTime))
    .accounts({
      game: gamePda,
      universe: universePda,
      oracle: new PublicKey(ORACLE),
      tokenMint: new PublicKey(TIMER_MINT),
      vault: vaultPda,
      authority: payer.publicKey,
      tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .rpc();

  console.log("✅ Game #" + gameIndex + " created! Tx:", tx);
  console.log("Game PDA:", gamePda.toBase58());
  console.log("Vault PDA:", vaultPda.toBase58());
  console.log("Lock time:", new Date(lockTime * 1000).toLocaleString());
}

main().catch(e => { console.error("Error:", e.message); process.exit(1); });
