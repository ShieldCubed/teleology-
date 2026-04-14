"use client";
import { useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { IDL } from "../lib/idl";
import { PROGRAM_ID, RPC_URL } from "../lib/constants";
import PorositySlider from "./PorositySlider";

interface UniverseEntry {
  pda: string;
  name: string;
  universeType: string;
  porosity: number;
  gameCount: number;
  authority: string;
}

interface Props {
  selectedPda: string | null;
  onSelect: (pda: string, name: string) => void;
}

function decodeUniverseType(ut: any): string {
  if (ut == null) return "Unknown";
  if (ut.financial !== undefined) return "Financial";
  if (ut.machineTwin !== undefined) return "MachineTwin";
  if (ut.fsp !== undefined) return "FSP";
  return "Unknown";
}

function decodeName(nameBytes: number[]): string {
  return Buffer.from(nameBytes).toString("utf8").replace(/\x00/g, "").trim();
}

const typeColor: Record<string, string> = {
  Financial: "text-cyan-400",
  MachineTwin: "text-orange-400",
  FSP: "text-cyan-400",
  Unknown: "text-gray-500",
};

export function UniverseBrowser({ selectedPda, onSelect }: Props) {
  const [universes, setUniverses] = useState<UniverseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePda, setActivePda] = useState<string>('');
  const { publicKey } = useWallet();

  useEffect(() => { fetchUniverses(); }, []);

  async function fetchUniverses() {
    setLoading(true);
    try {
      const conn = new Connection(RPC_URL, "confirmed");
      const programId = new PublicKey(PROGRAM_ID);
      const dummyWallet = {
        publicKey: programId,
        signTransaction: async (t: any) => t,
        signAllTransactions: async (t: any) => t,
      };
      const provider = new anchor.AnchorProvider(conn, dummyWallet as any, {});
      const program = new anchor.Program(IDL as anchor.Idl, provider);
      const accounts = await (program.account as any).universe.all();
      const entries: UniverseEntry[] = accounts.map((a: any) => ({
        pda: a.publicKey.toBase58(),
        name: decodeName(a.account.name),
        universeType: decodeUniverseType(a.account.universeType),
        porosity: a.account.porosity,
        gameCount: a.account.gameCount,
        authority: a.account.authority.toBase58(),
      }));
      entries.sort((a, b) => {
        if (a.name === "fsp-alpha") return -1;
        if (b.name === "fsp-alpha") return 1;
        return a.name.localeCompare(b.name);
      });
      setUniverses(entries);
      const pdaExists = entries.some(e => e.pda === selectedPda);
      if (!pdaExists && entries.length > 0) { setActivePda(entries[0].pda); onSelect(entries[0].pda, entries[0].name); }
    } catch (e: any) {
      console.error("UniverseBrowser fetch error:", e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Universes</h2>
        <button onClick={fetchUniverses} className="text-gray-600 hover:text-gray-400 text-xs">↻</button>
      </div>
      {loading && <div className="text-gray-600 text-xs py-2">Scanning chain...</div>}
      {(loading === false) && universes.length === 0 && (
        <div className="text-gray-600 text-xs py-2">No universes found</div>
      )}
      {universes.map((u) => {
        const sel = u.pda === activePda || (activePda === '' && u.pda === selectedPda);
        console.log("sel check", u.name, u.pda.slice(0,8), "activePda", activePda.slice(0,8), "sel", sel);
        const btnCls = sel
          ? "w-full text-left px-3 py-2.5 rounded-xl border transition-all bg-gray-800 border-gray-600"
          : "w-full text-left px-3 py-2.5 rounded-xl border transition-all bg-transparent border-transparent hover:bg-gray-900 hover:border-gray-700";
        const nameCls = sel ? "font-semibold text-sm text-white" : "font-semibold text-sm text-gray-300";
        const typeCls = "text-xs font-medium " + (typeColor[u.universeType] || "text-gray-500");
        return (
          <div key={u.pda}>
            <button onClick={() => { setActivePda(u.pda); onSelect(u.pda, u.name); }} className={btnCls}>
              <div className="flex items-center justify-between">
                <span className={nameCls}>{u.name || u.pda.slice(0, 8) + "..."}</span>
                <span className={typeCls}>{u.universeType}</span>
              </div>
              <div className="flex gap-3 mt-0.5 text-xs text-gray-500">
                <span>Porosity {u.porosity}%</span>
                <span>{u.gameCount} games</span>
              </div>
            </button>
            {sel && (
              <PorositySlider
                universePda={u.pda}
                currentPorosity={u.porosity}
                isAuthority={publicKey?.toBase58() === u.authority}
                lockedUntil={0}
                onSuccess={fetchUniverses}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
