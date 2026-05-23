'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import { Tool } from '@/types';
import ToolGrid from '@/components/tools/ToolGrid';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function HistoryPage() {
  const [history, setHistory] = useState<Tool[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem('recentlyViewedTools');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse history', e);
    }

    const checkAuth = async () => {
      try {
        const response = await getSupabaseClient().auth.getSession();
        setIsAuthenticated(!!response?.data?.session); 
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (!isMounted) {
    // Return empty shell for SSR to avoid hydration mismatch
    return (
      <div className="flex flex-col min-h-[80vh] p-6 lg:p-12 max-w-7xl mx-auto w-full mt-10">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Recently Viewed</h1>
          <p className="text-lg text-slate-400">Keep track of the AI tools you've recently explored.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[80vh] p-6 lg:p-12 max-w-7xl mx-auto w-full mt-10">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Recently Viewed</h1>
        <p className="text-lg text-slate-400">Keep track of the AI tools you've recently explored.</p>
      </div>

      {history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.02] backdrop-blur-md p-12 text-center relative overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-8 border border-blue-500/30 shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]">
              <Clock className="w-12 h-12 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No history found</h2>
            <p className="text-slate-400 max-w-md mx-auto mb-10 text-lg">
              You haven't viewed any tools recently. Start discovering to build your history.
            </p>
            <Link 
              href="/"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-semibold transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)] hover:scale-[1.02]"
            >
              Explore Tools
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="relative z-10">
          <ToolGrid tools={history} isAuthenticated={isAuthenticated} />
        </div>
      )}
    </div>
  );
}
