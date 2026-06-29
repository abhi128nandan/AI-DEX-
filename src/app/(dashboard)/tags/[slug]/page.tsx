import ToolGrid from '@/components/tools/ToolGrid';
import { Tag } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TOOL_SELECT, validateTools } from '@/lib/database/schema';

export default async function TagPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const tag = params.slug.toLowerCase();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: tools } = await supabase
    .from('tools')
    .select(TOOL_SELECT);
  
  const toolsList = validateTools(tools || []);
  
  const results = toolsList.filter((tool) => 
    tool.tags?.some((t: string) => t.toLowerCase() === tag)
  );

  if (results.length === 0) {
    notFound();
  }

  return (
    <div className="space-y-12 animate-fade-in min-h-[60vh]">
      <div className="text-center space-y-4 pt-8">
        <div className="inline-flex items-center justify-center bg-cyan-500/10 p-4 rounded-full mb-4">
          <Tag className="w-8 h-8 text-cyan-400" />
        </div>
        <h1 className="text-4xl font-bold text-white">
          #{tag}
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Found {results.length} tool{results.length !== 1 ? 's' : ''} with this tag.
        </p>
        <div className="pt-4">
           <Link href="/categories" className="text-sm font-medium text-purple-400 hover:text-purple-300">
             Explore all categories &rarr;
           </Link>
        </div>
      </div>

      <ToolGrid tools={results} isAuthenticated={!!user} />
    </div>
  );
}
