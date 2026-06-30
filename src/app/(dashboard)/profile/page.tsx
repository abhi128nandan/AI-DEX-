import Link from 'next/link';
import { Bookmark, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ToolGrid from '@/components/tools/ToolGrid';

export const dynamic = 'force-dynamic';

export default async function SavedToolsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data, error } = await supabase
    .from('saved_tools')
    .select('*, tools(*)')
    .eq('user_id', user.id);

  if (error) {
    console.error("Error fetching saved tools:", error);
  }

  // Extract the nested 'tools' object from the saved_tools join
  // Type assertion since Supabase returns nested joins as any by default
  const savedTools = data ? data.map((row) => row.tools as any).filter(Boolean) : [];

  return (
    <div className="flex flex-col min-h-[80vh] p-6 lg:p-12 max-w-7xl mx-auto w-full mt-10">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Saved Tools</h1>
        <p className="text-lg text-slate-400">Your personalized collection of favorite AI tools.</p>
      </div>

      {savedTools.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.02] backdrop-blur-md p-12 text-center relative overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center mb-8 border border-pink-500/30 shadow-[0_0_40px_-10px_rgba(236,72,153,0.3)]">
              <Bookmark className="w-12 h-12 text-pink-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Your collection is empty</h2>
            <p className="text-slate-400 max-w-md mx-auto mb-10 text-lg">
              Your saved tools will appear here. Bookmark the ones you love for easy access later.
            </p>
            <Link 
              href="/"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-semibold transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(236,72,153,0.5)] hover:scale-[1.02]"
            >
              Discover Tools
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="relative z-10">
          <ToolGrid tools={savedTools} isAuthenticated={true} isSaved={true} />
        </div>
      )}
    </div>
  );
}

