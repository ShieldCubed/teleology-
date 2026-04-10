"use client";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500" />
        <span className="text-white font-bold text-xl tracking-tight">Teleology</span>
        <span className="text-gray-500 text-sm ml-2">MekongDelta</span>
      </div>
      <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
    </nav>
  );
}
