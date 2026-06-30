import { HeroHighlight } from '@/components/ui/HeroHighlight';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { TOOL_SELECT, validateTools } from '@/lib/database/schema';
import { CategoryBrowse } from '@/components/categories/CategoryBrowse';
import FeaturedShowcase from '@/components/tools/FeaturedShowcase';
import { DynamicSection } from '@/components/tools/DynamicSection';
import { PlatformStats } from '@/components/tools/PlatformStats';
import { Newsletter } from '@/components/layout/Newsletter';
import ToolCard from '@/components/tools/ToolCard';

export const metadata = {
  title: 'AI-Dex — Discover and Compare AI Products',
  description: 'The premier platform for professionals to discover, compare, and bookmark the best AI tools on the internet.',
  openGraph: {
    title: 'AI-Dex — Discover and Compare AI Products',
    description: 'The premier platform for professionals to discover, compare, and bookmark the best AI tools on the internet.',
    url: 'https://aidex.dev',
  },
};

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  const { data: tools } = await supabase
    .from('tools')
    .select(TOOL_SELECT)
    .limit(100); // Fetch a reasonable sample for the homepage sections

  const toolsList = validateTools(tools || []);

  // 1. Trending This Week (Top 5 by votes + views)
  const trendingTools = [...toolsList]
    .sort((a, b) => ((b.votes_count || 0) + (b.views_count || 0)) - ((a.votes_count || 0) + (a.views_count || 0)))
    .slice(0, 5);

  // 2. Featured Collection (Top 4 Featured)
  const featuredTools = toolsList
    .filter(t => t.is_featured)
    .sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0))
    .slice(0, 4);

  const showcaseTools = featuredTools.length > 0 
    ? featuredTools 
    : [...toolsList].sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0)).slice(0, 4);

  // 3. Category Counts (Top 8)
  const categoryCountsMap = toolsList.reduce((acc, tool) => {
    if (tool.category) {
      acc[tool.category] = (acc[tool.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const categories = Object.entries(categoryCountsMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // 4. Recently Added
  const newestTools = [...toolsList]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. Marketing Hero */}
      <div className="min-h-[85vh] relative w-full flex items-center justify-center py-24">
        <HeroHighlight containerClassName="w-full h-full absolute inset-0">
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-[var(--border-default)] mb-8 text-[13px] font-semibold text-purple-300 shadow-sm backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              <span>Welcome to AI-Dex v2</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-balance max-w-5xl mx-auto mb-8 text-white tracking-tight leading-[1.1]">
              The smartest way to <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400">
                discover AI products
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
              Join thousands of professionals finding the perfect AI tools for their workflows. Compare features, read community reviews, and curate your own stack.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
               <Link
                 href="/discover"
                 className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black hover:bg-slate-200 rounded-xl font-semibold transition-all shadow-lg shadow-white/5"
               >
                 Explore Directory
                 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </Link>
               <Link
                 href="/submit"
                 className="px-8 py-4 bg-[var(--surface-overlay)] text-white border border-[var(--border-default)] hover:bg-[var(--surface-base)] rounded-xl font-semibold transition-colors"
               >
                 Submit a Tool
               </Link>
            </div>
          </div>
        </HeroHighlight>
      </div>

      {/* 2. Trending This Week (5 Cards Custom Layout) */}
      {trendingTools.length > 0 && (
        <section className="py-24 bg-[var(--surface-base)] border-t border-[var(--border-subtle)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Trending This Week</h2>
                <p className="text-slate-400 text-lg">The most popular AI tools actively voted by the community.</p>
              </div>
              <Link href="/discover" className="hidden sm:flex text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                View directory &rarr;
              </Link>
            </div>
            
            {/* 5 Card Layout: 2 on top, 3 on bottom for large screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
              {trendingTools.slice(0, 2).map((tool, index) => (
                <div key={tool.id} className="lg:col-span-3">
                  <ToolCard tool={tool} index={index} isAuthenticated={isAuthenticated} />
                </div>
              ))}
              {trendingTools.slice(2, 5).map((tool, index) => (
                <div key={tool.id} className="lg:col-span-2">
                  <ToolCard tool={tool} index={index + 2} isAuthenticated={isAuthenticated} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Browse Categories */}
      <div className="bg-[var(--surface-overlay)] border-t border-[var(--border-subtle)]">
        <CategoryBrowse categories={categories} />
      </div>

      {/* 4. Featured Collection */}
      <div className="border-t border-[var(--border-subtle)] pb-12 pt-8 bg-[var(--surface-base)]">
        <FeaturedShowcase tools={showcaseTools} isAuthenticated={isAuthenticated} />
      </div>

      {/* 5. Platform Statistics */}
      <PlatformStats />

      {/* 6. Recently Added (Carousel) */}
      {newestTools.length > 0 && (
        <div className="border-t border-[var(--border-subtle)] bg-[var(--surface-overlay)]">
          <DynamicSection 
            title="✨ Recently Added"
            description="Discover the newest AI innovations added to the platform this week."
            tools={newestTools}
            isAuthenticated={isAuthenticated}
            viewAllLink="/discover?sort=newest"
          />
        </div>
      )}

      {/* 7. Newsletter */}
      <Newsletter />

    </div>
  );
}
