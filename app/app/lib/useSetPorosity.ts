"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import idl from "./teleology.json";
import { PROGRAM_ID } from "./constants";

export function useSetPorosity() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const setPorosity = async (universePda: PublicKey, newPorosity: number) => {
    if (!wallet.publicKey || !wallet.signTransaction) throw new Error("Wallet not connected");
    if (newPorosity < 0 || newPorosity > 100) throw new Error("Porosity must be 0-100");

    const provider = new AnchorProvider(connection, wallet as any, {});
    const program = new Program(idl as any, provider);

    const tx = await program.methods
      .setPorosity(newPorosity)
      .accounts({
        universe: universePda,
        authority: wallet.publicKey,
      })
      .transaction();

    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = wallet.publicKey;
    const signed = await wallet.signTransaction(tx);
    const sig = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(sig, "confirmed");
    return sig;
  };

  return { setPorosity };
}
