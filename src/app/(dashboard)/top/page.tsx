import ToolGrid from '@/components/tools/ToolGrid';
import { Trophy } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { TOOL_SELECT, validateTools } from '@/lib/database/schema';

export default async function TopPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const { data: tools } = await supabase
    .from('tools')
    .select(TOOL_SELECT)
    .order('votes_count', { ascending: false })
    .limit(50);
  
  const topRated = validateTools(tools || []);

  return (
    <div className="space-y-12 animate-fade-in min-h-[60vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-4 pt-8">
        <div className="inline-flex items-center justify-center bg-yellow-500/10 p-4 rounded-2xl mb-4 border border-yellow-500/20">
          <Trophy className="w-8 h-8 text-yellow-400" />
        </div>
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 tracking-tight">
          Top Rated
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto text-[15px]">
          The all-time highest voted AI tools on AIDex.
        </p>
      </div>

      <ToolGrid tools={topRated} isAuthenticated={!!session} />
    </div>
  );
}
