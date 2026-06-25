'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Search, X } from 'lucide-react';
import SearchBar from './SearchBar';
import AuthButton from '../auth/AuthButton';

export default function Navbar() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full bg-[var(--surface-base)]/80 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_1px_40px_-20px_rgba(124,58,237,0.3)]">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8 lg:w-64 ml-12 lg:ml-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-gradient-to-r from-purple-600 to-cyan-500 p-1.5 rounded-lg shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              AIDex
            </span>
          </Link>
        </div>

        {/* Desktop search — hidden on mobile */}
        <div className="flex-1 flex justify-center max-w-2xl px-8 hidden md:flex">
           <SearchBar />
        </div>

        {/* Mobile search — icon button + expandable bar */}
        <div className="flex md:hidden items-center">
          {mobileSearchOpen ? (
            <div className="flex items-center gap-2 absolute left-0 right-0 top-0 h-16 px-4 bg-[var(--surface-base)] z-10">
              <SearchBar />
              <button
                onClick={() => setMobileSearchOpen(false)}
                className="p-2 text-slate-400 hover:text-white shrink-0"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Open search"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 lg:w-64 justify-end">
          <AuthButton />
        </div>
      </div>
    </nav>
  );
}
