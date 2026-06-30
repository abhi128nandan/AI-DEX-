'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/') {
      const params = new URLSearchParams(window.location.search);
      const urlSearch = params.get('search') || '';
      setQuery(urlSearch);
    }
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Try to focus the main explorer search first, fall back to navbar search
        const explorerInput = document.getElementById('tool-search-input');
        if (explorerInput) {
          explorerInput.focus();
          explorerInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          // Fallback: focus the navbar search input
          const navInput = document.querySelector('input[type="text"]') as HTMLInputElement;
          navInput?.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    if (pathname === '/') {
      // On homepage: update the ToolsExplorer filter via URL param
      router.push(`/?search=${encodeURIComponent(trimmed)}`, { scroll: false });
    } else {
      // On any other page: use the full server-side search
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-xl group">
      
      <div className="relative flex items-center">
        <SearchIcon className={`absolute left-4 w-4 h-4 transition-colors duration-300 ${focused ? 'text-purple-400' : 'text-slate-400'}`} />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search for AI tools, categories, or keywords..." 
          className="w-full bg-[var(--surface-overlay)] border border-[var(--border-default)] hover:border-[var(--border-hover)] focus:border-[var(--border-active)] rounded-xl pl-11 pr-16 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--border-active)] transition-all text-white placeholder:text-slate-500 shadow-sm"
        />
        <div className="absolute right-3 hidden sm:flex items-center gap-1">
           <kbd className="px-2.5 py-1 text-[10px] uppercase font-semibold bg-white/[0.04] border border-[var(--border-default)] rounded-md flex items-center text-slate-400">⌘K</kbd>
        </div>
      </div>
    </form>
  );
}

