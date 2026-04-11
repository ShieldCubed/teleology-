import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as os from "os";
import { IDL } from "../app/lib/idl";
import { RPC_URL, TIMER_MINT, PROGRAM_ID } from "../app/lib/constants";

const UNIVERSE_PDA = "87g4cgFaCopAufWwZ8ucyGsyJZCjLJLXrJ7a6q7j3kgq";
const GAME2_PDA = "DumwYxQjRsJrkGEt42TpeWtK6MZnofaWwu9am9ED6nyS";
const BETTOR = "AF1gUfqNi3o2kA555iuqTToaAkCoMD8pb1auZFLGXnLe";

async function main() {
  const keypairPath = os.homedir() + "/.config/solana/id.json";
  const raw = JSON.parse(fs.readFileSync(keypairPath, "utf8"));
  const payer = Keypair.fromSecretKey(Uint8Array.from(raw));
  const conn = new Connection(RPC_URL, "confirmed");
  const wallet = new anchor.Wallet(payer);
  const provider = new anchor.AnchorProvider(conn, wallet, { commitment: "confirmed" });
  const program = new anchor.Program(IDL as anchor.Idl, provider);

  const gamePubkey = new PublicKey(GAME2_PDA);
  const bettor = new PublicKey(BETTOR);

  const [bet] = PublicKey.findProgramAddressSync(
    [Buffer.from("bet"), gamePubkey.toBuffer(), bettor.toBuffer()],
    new PublicKey(PROGRAM_ID)
  );

  const bettorTokenAccount = await anchor.utils.token.associatedAddress({
    mint: new PublicKey(TIMER_MINT),
    owner: bettor,
  });

  const game = await (program.account as any).game.fetch(gamePubkey);
  console.log("vault:", game.vault.toBase58());
  console.log("bet PDA:", bet.toBase58());
  console.log("bettorTokenAccount:", bettorTokenAccount.toBase58());

  // Simulate only
  try {
    const tx = await program.methods
      .placeBet({ yes: {} }, new anchor.BN(100 * 1e9))
      .accounts({
        bet,
        game: gamePubkey,
        tokenMint: new PublicKey(TIMER_MINT),
        bettorTokenAccount,
        vault: game.vault,
        bettor,
        tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .simulate();
    console.log("Simulation OK:", JSON.stringify(tx.events));
  } catch (e: any) {
    console.error("Simulation error:", e.message);
    if (e.simulationResponse) {
      console.error("Logs:", JSON.stringify(e.simulationResponse.logs, null, 2));
    }
  }
}
main().catch(e => { console.error("Error:", e.message); process.exit(1); });
