import { CATEGORIES } from '@/data/tools';
import ToolGrid from '@/components/tools/ToolGrid';
import { Layers } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TOOL_SELECT, validateTools } from '@/lib/database/schema';

export default async function CategoryDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const slug = params.slug;
  
  // Map slug back to category name
  const category = CATEGORIES.find(
    c => c.toLowerCase().replace(/ /g, '-') === slug
  );

  if (!category) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const { data: tools } = await supabase
    .from('tools')
    .select(TOOL_SELECT)
    .eq('category', category)
    .order('votes_count', { ascending: false });
  
  const toolsList = validateTools(tools || []);

  return (
    <div className="space-y-12 animate-fade-in min-h-[60vh]">
      <div className="text-center space-y-4 pt-8">
        <div className="inline-flex items-center justify-center bg-purple-500/10 p-4 rounded-full mb-4">
          <Layers className="w-8 h-8 text-purple-400" />
        </div>
        <h1 className="text-4xl font-bold text-white">
          {category}
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          {toolsList.length} tool{toolsList.length !== 1 ? 's' : ''} in this category, ranked by popularity.
        </p>
        <div className="pt-2">
          <Link href="/categories" className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">
            &larr; All Categories
          </Link>
        </div>
      </div>

      {toolsList.length > 0 ? (
        <ToolGrid tools={toolsList} isAuthenticated={!!session} />
      ) : (
        <div className="text-center py-16">
          <p className="text-slate-500 text-lg">No tools in this category yet. Be the first to <Link href="/submit" className="text-purple-400 hover:underline">submit one</Link>!</p>
        </div>
      )}
    </div>
  );
}
