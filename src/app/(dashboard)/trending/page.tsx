import ToolGrid from '@/components/tools/ToolGrid';
import { Flame } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { TOOL_SELECT, validateTools } from '@/lib/database/schema';

export default async function TrendingPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const { data: tools } = await supabase
    .from('tools')
    .select(TOOL_SELECT)
    .limit(50);
  
  const toolsList = validateTools(tools || []);
  
  const trending = [...toolsList].sort((a, b) => {
    const scoreA = a.votes_count * 3 + a.views_count * 0.1;
    const scoreB = b.votes_count * 3 + b.views_count * 0.1;
    return scoreB - scoreA;
  });

  return (
    <div className="space-y-12 animate-fade-in min-h-[60vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-4 pt-8">
        <div className="inline-flex items-center justify-center bg-orange-500/10 p-4 rounded-2xl mb-4 border border-orange-500/20">
          <Flame className="w-8 h-8 text-orange-500" />
        </div>
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-400 tracking-tight">
          Trending AI Tools
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto text-[15px]">
          The most popular AI tools based on votes, views, and recency.
        </p>
      </div>

      <ToolGrid tools={trending} isAuthenticated={!!session} />
    </div>
  );
}
