'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Search, X } from 'lucide-react';
import SearchBar from './SearchBar';
import AuthButton from '../auth/AuthButton';

export default function Navbar() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileSearchOpen(false);
  }, [pathname]);

  return (
    <nav className="fixed top-0 z-50 w-full bg-[var(--surface-base)]/80 backdrop-blur-lg border-b border-[var(--border-default)] shadow-[0_1px_0_var(--border-subtle)]">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8 lg:w-64 ml-12 lg:ml-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-gradient-to-r from-purple-600 to-cyan-500 p-1.5 rounded-xl shadow-sm transition-all duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              AIDex
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6 justify-center flex-1">
          <Link href="/" className={`text-sm font-semibold transition-colors ${pathname === '/' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>Home</Link>
          <Link href="/discover" className={`text-sm font-semibold transition-colors ${pathname === '/discover' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>Discover</Link>
          <Link href="/categories" className={`text-sm font-semibold transition-colors ${pathname === '/categories' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>Categories</Link>
          <Link href="/collections" className={`text-sm font-semibold transition-colors ${pathname === '/collections' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>Collections</Link>
          <Link href="/leaderboard" className={`text-sm font-semibold transition-colors ${pathname === '/leaderboard' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>Leaderboard</Link>
          <Link href="/submit" className={`text-sm font-semibold transition-colors ${pathname === '/submit' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>Submit Tool</Link>
        </div>

        {/* Mobile search — icon button + expandable bar */}
        <div className="flex md:hidden items-center">
          {mobileSearchOpen ? (
            <div className="flex items-center gap-2 absolute left-0 right-0 top-0 h-16 px-4 bg-[var(--surface-base)] z-[70]">
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
          <div className="hidden lg:block">
            <SearchBar />
          </div>
          <AuthButton />
        </div>
      </div>
    </nav>
  );
}
