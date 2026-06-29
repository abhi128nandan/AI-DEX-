import ToolGrid from '@/components/tools/ToolGrid';
import { Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { TOOL_SELECT, validateTools } from '@/lib/database/schema';

export default async function NewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: tools } = await supabase
    .from('tools')
    .select(TOOL_SELECT)
    .order('created_at', { ascending: false })
    .limit(50);
  
  const newTools = validateTools(tools || []);

  return (
    <div className="space-y-12 animate-fade-in min-h-[60vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-4 pt-8">
        <div className="inline-flex items-center justify-center bg-emerald-500/10 p-4 rounded-full mb-4">
          <Clock className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
          New Additions
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          The latest AI tools added to our discovery engine.
        </p>
      </div>

      <ToolGrid tools={newTools} isAuthenticated={!!user} />
    </div>
  );
}
