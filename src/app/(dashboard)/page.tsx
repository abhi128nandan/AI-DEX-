// import { CATEGORIES, CATEGORY_COUNTS } from '@/data/tools';
import { HeroHighlight } from '@/components/ui/HeroHighlight';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import RefreshButton from '@/components/ui/RefreshButton';
import ToolsExplorer from '@/components/tools/ToolsExplorer';
import { TOOL_SELECT, validateTools } from '@/lib/database/schema';
import { Suspense } from 'react';

function DashboardSkeleton() {
  return (
    <div className="pb-12 min-h-screen flex flex-col w-full">
      <div className="min-h-[40rem] flex flex-col items-center justify-center py-24 animate-pulse">
        <div className="w-48 h-8 bg-white/5 rounded-full mb-8"></div>
        <div className="w-[60%] max-w-2xl h-24 bg-white/5 rounded-2xl mb-6"></div>
        <div className="w-[40%] max-w-md h-12 bg-white/5 rounded-xl mb-10"></div>
        <div className="flex flex-wrap justify-center gap-2 max-w-3xl">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="w-24 h-10 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-white/5 rounded-3xl border border-white/5"></div>
            ))}
         </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const isAuthenticated = !!session;
  
  // Query only fields that exist in the database schema
  const { data: tools, error } = await supabase
    .from('tools')
    .select(TOOL_SELECT);
    
  let savedToolIds: string[] = [];
  if (session?.user?.id) {
    const { data: savedData } = await supabase
      .from('saved_tools')
      .select('tool_id')
      .eq('user_id', session.user.id);
    savedToolIds = savedData?.map(s => s.tool_id) || [];
  }
  
  if (error) {
    console.error("Database error fetching tools:", error);
    // Safe fallback: return empty array instead of throwing
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-2xl">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 mb-2">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Database Connection Error</h1>
          <p className="text-slate-400 text-lg">
            Unable to fetch tools from the database. Please try again later.
          </p>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-left space-y-4">
            <h3 className="font-semibold text-white">Error Details:</h3>
            <p className="text-sm text-slate-300">{error.message}</p>
          </div>
          <div className="flex gap-4 justify-center">
            <RefreshButton className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition-colors">
              Retry
            </RefreshButton>
          </div>
        </div>
      </div>
    );
  }
  
  const toolsList = validateTools(tools || []);
  
  // RENDER IMMEDIATELY IF WE HAVE TOOLS
  if (toolsList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-2xl">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-2">
            <span className="text-4xl">📦</span>
          </div>
          <h1 className="text-3xl font-bold text-white">No Tools Found</h1>
          <p className="text-slate-400 text-lg">
            The tools database is empty. You need to seed the database with initial data.
          </p>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6 text-left space-y-4">
            <h3 className="font-semibold text-white">To fix this:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300">
              <li>Open Supabase SQL Editor</li>
              <li>Run the seed script: <code className="bg-black/40 px-2 py-1 rounded text-purple-400">supabase-seed-tools.sql</code></li>
              <li>Refresh this page</li>
            </ol>
          </div>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/admin"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition-colors"
            >
              Go to Admin Panel
            </Link>
            <RefreshButton className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition-colors border border-white/10">
              Refresh Page
            </RefreshButton>
          </div>
        </div>
      </div>
    );
  }

  // Derive dynamic category counts from fetched tools
  const categoryCounts = toolsList.reduce((acc, tool) => {
    if (tool.category) {
      acc[tool.category] = (acc[tool.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const activeCategories = Object.keys(categoryCounts).sort();

  return (
    <div className="pb-12 min-h-screen flex flex-col">
      {/* Dynamic Interactive Hero Area */}
      <div className="min-h-[40rem] relative w-full flex items-center justify-center py-24">
        <HeroHighlight containerClassName="w-full h-full absolute inset-0">
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] mb-8 text-[13px] font-semibold text-purple-300 shadow-xl shadow-purple-500/5 backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              <span>The discovery engine for AI</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-balance max-w-3xl mx-auto mb-6 text-white tracking-tight leading-[1.1]">
              Find the perfect <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400">
                AI Tool for your workflow
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Explore {toolsList.length}+ curated AI tools, read reviews, and compare features. 
              Updated daily with the newest innovations.
            </p>

            <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
              {activeCategories.slice(0, 8).map(category => (
                <Link 
                  key={category}
                  href={`/categories/${category.toLowerCase().replace(/ /g, '-')}`}
                  className="group px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-purple-500/40 hover:bg-purple-500/[0.08] text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10"
                >
                  <span className="text-slate-400 group-hover:text-white transition-colors">{category}</span>
                  <span className="ml-1.5 text-[10px] font-mono text-slate-600 group-hover:text-purple-400 transition-colors">
                    {categoryCounts[category]}
                  </span>
                </Link>
              ))}
              <Link 
                href="/categories"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600/80 to-indigo-600/80 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all flex items-center gap-1 shadow-lg shadow-purple-500/20"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </HeroHighlight>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <ToolsExplorer tools={toolsList} isAuthenticated={isAuthenticated} savedToolIds={savedToolIds} />
      </div>

    </div>
  );
}
