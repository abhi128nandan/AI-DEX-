// import { CATEGORIES, CATEGORY_COUNTS } from '@/lib/config/tool-categories';
import { HeroHighlight } from '@/components/ui/HeroHighlight';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import RefreshButton from '@/components/ui/RefreshButton';
import ToolsExplorer from '@/components/tools/ToolsExplorer';
import { TOOL_SELECT, validateTools } from '@/lib/database/schema';
import { Suspense } from 'react';

function DashboardSkeleton() {
  return (
    <div className="pb-12 min-h-screen flex flex-col w-full">
      <div className="min-h-[22rem] flex flex-col items-center justify-center py-14 animate-pulse">
        <div className="w-48 h-8 bg-white/5 rounded-full mb-8"></div>
        <div className="w-[60%] max-w-2xl h-24 bg-white/5 rounded-2xl mb-6"></div>
        <div className="w-[40%] max-w-md h-12 bg-white/5 rounded-xl mb-10"></div>
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
        <div className="text-center space-y-5 max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-2">
            <span className="text-3xl">🔍</span>
          </div>
          <h1 className="text-2xl font-bold text-white">No tools yet</h1>
          <p className="text-slate-400 text-base leading-relaxed">
            The directory is being built. Check back soon, or be the first to contribute.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Link
              href="/submit"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition-colors text-sm"
            >
              Submit a Tool
            </Link>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="pb-12 min-h-screen flex flex-col">
      {/* Dynamic Interactive Hero Area */}
      <div className="min-h-[22rem] relative w-full flex items-center justify-center py-14">
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
              Explore {toolsList.length}+ curated AI tools, voted on by the community.
              Discover what&apos;s trending, top-rated, or newly added.
            </p>
          </div>
        </HeroHighlight>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 pt-8">
        <ToolsExplorer tools={toolsList} isAuthenticated={isAuthenticated} savedToolIds={savedToolIds} />
      </div>

    </div>
  );
}
