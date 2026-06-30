import { HeroHighlight } from '@/components/ui/HeroHighlight';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import RefreshButton from '@/components/ui/RefreshButton';
import ToolsExplorer from '@/components/tools/ToolsExplorer';
import FeaturedShowcase from '@/components/tools/FeaturedShowcase';
import { DynamicSection } from '@/components/tools/DynamicSection';
import { CategoryBrowse } from '@/components/categories/CategoryBrowse';
import { SponsorBanner } from '@/components/layout/SponsorBanner';
import { Newsletter } from '@/components/layout/Newsletter';
import { TOOL_SELECT, validateTools } from '@/lib/database/schema';
import { Suspense } from 'react';
import { Tool } from '@/types';

function DashboardSkeleton() {
  return (
    <div className="pb-12 min-h-screen flex flex-col w-full">
      <div className="min-h-[20rem] flex flex-col items-center justify-center py-12 animate-pulse">
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

export const metadata = {
  title: 'Discover AI Tools',
  description: 'Browse and vote on the best AI tools, sorted by the community.',
  openGraph: {
    title: 'AIDex — Discover the Best AI Tools',
    description: 'Browse and vote on the best AI tools, sorted by the community.',
    url: 'https://aidex.app',
  },
};

export default function Home() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;
  
  // Query only fields that exist in the database schema
  const { data: tools, error } = await supabase
    .from('tools')
    .select(TOOL_SELECT);
    
  let savedToolIds: string[] = [];
  if (user?.id) {
    const { data: savedData } = await supabase
      .from('saved_tools')
      .select('tool_id')
      .eq('user_id', user.id);
    savedToolIds = savedData?.map(s => s.tool_id) || [];
  }
  
  if (error) {
    console.error("Database error fetching tools:", error);
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

  // --- Process Data for Discovery Sections ---

  // 1. Featured (Editorial / Top Voted)
  const featuredTools = toolsList
    .filter(t => t.is_featured)
    .sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0))
    .slice(0, 4);

  // Fallback if no featured tools exist: pick the top voted overall
  const showcaseTools = featuredTools.length > 0 
    ? featuredTools 
    : [...toolsList].sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0)).slice(0, 4);

  // 2. Trending (High recent activity - approximated by votes+views)
  const trendingTools = [...toolsList]
    .sort((a, b) => ((b.votes_count || 0) + (b.views_count || 0)) - ((a.votes_count || 0) + (a.views_count || 0)))
    .slice(0, 8);

  // 3. Editor's Picks (High quality, verified tools)
  const editorPicks = toolsList
    .filter(t => t.is_verified)
    .sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0))
    .slice(0, 8);

  // 4. Newest
  const newestTools = [...toolsList]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  // 5. Category Counts
  const categoryCountsMap = toolsList.reduce((acc, tool) => {
    if (tool.category) {
      acc[tool.category] = (acc[tool.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const categories = Object.entries(categoryCountsMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // Top 8 categories for the browse section

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. Hero Section */}
      <div className="min-h-[22rem] relative w-full flex items-center justify-center py-16">
        <HeroHighlight containerClassName="w-full h-full absolute inset-0">
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-[var(--border-default)] mb-8 text-[13px] font-semibold text-purple-300 shadow-sm backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              <span>The discovery engine for AI</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-balance max-w-4xl mx-auto mb-6 text-white tracking-tight leading-[1.1]">
              Find the perfect <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400">
                AI Tool for your workflow
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Explore {toolsList.length} curated AI tools, voted on by the community.
              Discover what&apos;s trending, top-rated, or newly added.
            </p>

            <div className="flex gap-4">
               <Link
                 href="#directory"
                 className="px-6 py-3.5 bg-white text-black hover:bg-slate-200 rounded-xl font-semibold transition-colors shadow-lg shadow-white/5"
               >
                 Start Exploring
               </Link>
               <Link
                 href="/submit"
                 className="px-6 py-3.5 bg-white/5 text-white border border-white/10 hover:bg-white/10 rounded-xl font-semibold transition-colors"
               >
                 Submit Tool
               </Link>
            </div>
          </div>
        </HeroHighlight>
      </div>

      {/* 2. Trending Tools */}
      <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-overlay)]">
        <DynamicSection 
          title="🔥 Trending Right Now"
          description="The AI tools everyone is talking about and voting for this week."
          tools={trendingTools}
          isAuthenticated={isAuthenticated}
          viewAllLink="/?sort=votes#directory"
        />
      </div>

      {/* 3. Browse Categories */}
      <CategoryBrowse categories={categories} />

      {/* 4. Featured Showcase */}
      <div className="border-t border-[var(--border-subtle)] pb-12 pt-8">
        <FeaturedShowcase tools={showcaseTools} isAuthenticated={isAuthenticated} />
      </div>

      {/* 5. Sponsor Banner */}
      <SponsorBanner sponsor={null} />

      {/* 6. Editor's Picks */}
      {editorPicks.length > 0 && (
        <div className="border-t border-[var(--border-subtle)]">
          <DynamicSection 
            title="⭐ Editor's Picks"
            description="Verified, high-quality tools recommended by our curation team."
            tools={editorPicks}
            isAuthenticated={isAuthenticated}
            viewAllLink="/?category=all#directory"
          />
        </div>
      )}

      {/* 7. Newest Tools */}
      <div className="border-t border-[var(--border-subtle)]">
        <DynamicSection 
          title="✨ Just Added"
          description="Be the first to discover the newest AI tools on the platform."
          tools={newestTools}
          isAuthenticated={isAuthenticated}
          viewAllLink="/?sort=newest#directory"
        />
      </div>

      {/* 8. Full Tool Directory (Advanced Search & Grid) */}
      <div id="directory" className="border-t border-[var(--border-subtle)] bg-[var(--surface-overlay)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
              Full Tool Directory
            </h2>
            <p className="text-slate-400">
              Search, filter, and discover {toolsList.length} tools across the platform.
            </p>
          </div>
          <ToolsExplorer tools={toolsList} isAuthenticated={isAuthenticated} savedToolIds={savedToolIds} />
        </div>
      </div>

      {/* 9. Newsletter */}
      <Newsletter />
      
    </div>
  );
}
