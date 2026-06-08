"use client";


import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Flame, Clock, Trophy,
  PanelLeftClose, PanelRightClose, Menu, X,
  History, Bookmark
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAnalytics } from '@/hooks/use-analytics';



const NAV_ITEMS = [
  { path: '/', label: 'Home', Icon: Home, color: 'from-purple-500 to-violet-500' },
  { path: '/trending', label: 'Trending', Icon: Flame, color: 'from-orange-500 to-amber-500' },
  { path: '/new', label: 'Newly Added', Icon: Clock, color: 'from-emerald-500 to-teal-500' },
  { path: '/top', label: 'Top Rated', Icon: Trophy, color: 'from-yellow-500 to-orange-500' },
];

const FOR_YOU_ITEMS = [
  { path: '/history', label: 'Recently Viewed', Icon: History, color: 'from-blue-500 to-cyan-500' },
  { path: '/saved', label: 'Saved Tools', Icon: Bookmark, color: 'from-pink-500 to-rose-500' }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { track } = useAnalytics();
  const [isHovered, setIsHovered] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('sidebar-locked');
    if (saved === 'true') setIsLocked(true);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [mobileOpen]);

  const toggleLock = () => {
    const newState = !isLocked;
    setIsLocked(newState);
    localStorage.setItem('sidebar-locked', newState.toString());
  };

  const isExpanded = isHovered || isLocked;

  const handleCategoryClick = (category: string) => {
    track({ event: 'category_click', category });
  };

  // === MOBILE HAMBURGER BUTTON (rendered in navbar area via portal-like fixed positioning) ===
  const MobileMenuButton = (
    <button
      onClick={() => setMobileOpen(true)}
      className="fixed top-[18px] left-4 z-[60] lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all"
      aria-label="Open navigation menu"
    >
      <Menu className="w-5 h-5 text-white" />
    </button>
  );

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <>
        <aside className="w-[72px] fixed left-0 top-16 bottom-0 hidden lg:block border-r border-white/[0.06] bg-[#0a0a0f]" />
      </>
    );
  }

  // === SIDEBAR CONTENT (shared between desktop & mobile) ===
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const expanded = isMobile || isExpanded;
    
    return (
      <div className="flex flex-col h-full relative">
        {/* Top glow line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] sidebar-glow-line" />

        {/* Pin / Close button */}
        <div className={`flex items-center mb-6 ${expanded ? 'justify-between px-1' : 'justify-center'}`}>
          {expanded && !isMobile && (
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] select-none">
              Navigation
            </span>
          )}
          {isMobile ? (
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={toggleLock}
              className={`p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all ${expanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              title={isLocked ? "Unpin Sidebar" : "Pin Sidebar"}
            >
              {isLocked ? <PanelLeftClose className="w-4 h-4" /> : <PanelRightClose className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* === Discover Section === */}
        <div className="mb-6">
          <h4 className={`text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3 select-none ${expanded ? 'px-3' : 'text-center'}`}>
            {expanded ? 'Discover' : '•••'}
          </h4>
          <nav className="space-y-1">
            {NAV_ITEMS.map(item => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`group/nav relative flex items-center gap-3 py-2.5 text-[13px] font-semibold rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-white/[0.08]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  } ${expanded ? 'px-3 justify-start' : 'px-0 justify-center'}`}
                  title={!expanded ? item.label : undefined}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b ${item.color}`}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  
                  <div className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-lg outline-none transition-all duration-300 ease-out group-hover/nav:scale-110 ${
                    isActive 
                      ? `bg-gradient-to-br ${item.color} shadow-lg scale-105 shadow-purple-500/20` 
                      : 'bg-white/[0.04] group-hover/nav:bg-white/[0.08]'
                  }`}>
                    <item.Icon className={`${expanded ? 'w-4 h-4' : 'w-[18px] h-[18px]'} ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover/nav:text-white'
                    } transition-colors`} />
                  </div>

                  <AnimatePresence>
                    {expanded && (
                      <motion.span
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.15 }}
                        className="whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* === For You Section === */}
        <div className="mb-6">
          <h4 className={`text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3 select-none ${expanded ? 'px-3' : 'text-center'}`}>
            {expanded ? 'For You' : '•••'}
          </h4>
          <nav className="space-y-1">
            {FOR_YOU_ITEMS.map(item => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`group/nav relative flex items-center gap-3 py-2.5 text-[13px] font-semibold rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-white/[0.08]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  } ${expanded ? 'px-3 justify-start' : 'px-0 justify-center'}`}
                  title={!expanded ? item.label : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b ${item.color}`}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  
                  <div className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-lg outline-none transition-all duration-300 ease-out group-hover/nav:scale-110 ${
                    isActive 
                      ? `bg-gradient-to-br ${item.color} shadow-lg scale-105 shadow-purple-500/20` 
                      : 'bg-white/[0.04] group-hover/nav:bg-white/[0.08]'
                  }`}>
                    <item.Icon className={`${expanded ? 'w-4 h-4' : 'w-[18px] h-[18px]'} ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover/nav:text-white'
                    } transition-colors`} />
                  </div>

                  <AnimatePresence>
                    {expanded && (
                      <motion.span
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.15 }}
                        className="whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Divider removed along with categories */}
      </div>
    );
  };

  return (
    <>
      {/* Mobile hamburger button */}
      {MobileMenuButton}

      {/* === MOBILE SIDEBAR (slide-over overlay) === */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            {/* Panel */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] z-[80] lg:hidden bg-[#0a0a10]/95 backdrop-blur-2xl border-r border-white/[0.06] p-5 overflow-y-auto"
            >
              <SidebarContent isMobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* === DESKTOP SIDEBAR === */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed left-0 top-16 bottom-0 hidden lg:flex flex-col overflow-hidden border-r border-white/[0.06] z-50 py-5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isExpanded 
            ? 'w-[260px] px-4 bg-[#0a0a10]/90 backdrop-blur-2xl shadow-[4px_0_24px_-4px_rgba(0,0,0,0.5)]' 
            : 'w-[72px] px-2 bg-[#0a0a0f]/80 backdrop-blur-xl'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
