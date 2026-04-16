"use client";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950 relative">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500" />
        <Link href="/" className="flex items-center gap-2">
          <span className="text-white font-bold text-xl tracking-tight">Teleology</span>
          <span className="text-gray-500 text-sm ml-2">MekongDelta</span>
        </Link>
      </div>

      <div className="hidden sm:flex items-center gap-6">
        <Link href="/faq" className="text-gray-400 hover:text-white text-sm transition-colors">FAQ</Link>
        <Link href="/whitepaper" className="text-gray-400 hover:text-white text-sm transition-colors">Whitepaper</Link>
        {mounted && <WalletMultiButton />}
      </div>

      <div className="flex sm:hidden items-center gap-3">
        {mounted && <WalletMultiButton />}
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-400 hover:text-white p-1" aria-label="Toggle menu">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (<><line x1="4" y1="4" x2="18" y2="18" /><line x1="18" y1="4" x2="4" y2="18" /></>) : (<><line x1="3" y1="7" x2="19" y2="7" /><line x1="3" y1="12" x2="19" y2="12" /><line x1="3" y1="17" x2="19" y2="17" /></>)}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-gray-950 border-b border-gray-800 px-6 py-4 flex flex-col gap-4 sm:hidden z-50">
          <Link href="/faq" onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-white text-sm transition-colors">FAQ</Link>
          <Link href="/whitepaper" onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-white text-sm transition-colors">Whitepaper</Link>
        </div>
      )}
    </nav>
  );
}
