import ToolGrid from '@/components/tools/ToolGrid';
import { Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { TOOL_SELECT, validateTools } from '@/lib/database/schema';
import Link from 'next/link';

/**
 * Server-side search page.
 * 
 * WHY server-side search is superior to client-side filtering:
 * 1. SCALABILITY: Client-side downloads ALL tools then filters in JS.
 *    At 500+ tools, this sends megabytes of JSON over the wire.
 *    Server-side uses PostgreSQL GIN indexes → O(log n) lookup.
 * 
 * 2. RELEVANCE RANKING: PostgreSQL ts_rank() scores results by how
 *    well they match, with weighted fields (name > description > tags).
 *    Client-side .includes() has no concept of relevance.
 * 
 * 3. BANDWIDTH: Only matching results are sent to the browser.
 *    At 1000 tools, a search for "code" might return 10 results
 *    instead of transferring all 1000.
 * 
 * APPROACH: Uses the search_tools() RPC function if available,
 * falls back to ilike queries if the migration hasn't been run yet.
 */
export default async function SearchPage(props: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const searchParams = await props.searchParams;
  const query = searchParams.q?.trim() || '';
  const page = Math.max(1, parseInt(searchParams.page || '1', 10));
  const pageSize = 20;

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  let results: any[] = [];
  let totalCount = 0;

  if (!query) {
    // No query — show all tools sorted by votes with pagination
    const { data, count } = await supabase
      .from('tools')
      .select(TOOL_SELECT, { count: 'exact' })
      .order('votes_count', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);
    
    results = data || [];
    totalCount = count || 0;
  } else {
    // Try RPC-based full-text search first (requires migration)
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('search_tools', {
        search_query: query,
        result_limit: pageSize,
        result_offset: (page - 1) * pageSize,
      });

    if (!rpcError && rpcData) {
      results = rpcData;
      totalCount = rpcData.length; // RPC doesn't return total count
    } else {
      // Fallback: ilike search (works without migration)
      const { data, count } = await supabase
        .from('tools')
        .select(TOOL_SELECT, { count: 'exact' })
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .order('votes_count', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);
      
      results = data || [];
      totalCount = count || 0;
    }
  }
  
  const toolsList = validateTools(results);
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-12 animate-fade-in min-h-[60vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-4 pt-8">
        <div className="inline-flex items-center justify-center bg-purple-500/10 p-4 rounded-2xl mb-4 border border-purple-500/20">
          <Search className="w-8 h-8 text-purple-400" />
        </div>
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
          {query ? `Results for "${query}"` : 'Search AI Tools'}
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto text-[15px]">
          {query 
            ? `Found ${toolsList.length}${totalCount > toolsList.length ? ` of ${totalCount}` : ''} tool${toolsList.length !== 1 ? 's' : ''} matching your query.`
            : 'Search by tool name, description, or tags.'}
        </p>
      </div>

      {toolsList.length > 0 ? (
        <>
          <ToolGrid tools={toolsList} isAuthenticated={!!session} />
          
          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4 pb-8">
              {page > 1 && (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
                  className="px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/10 text-slate-300 text-sm font-semibold transition-all"
                >
                  ← Previous
                </Link>
              )}
              <span className="text-sm text-slate-600 font-mono tabular-nums">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                  className="px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/10 text-slate-300 text-sm font-semibold transition-all"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 px-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-6">
            <Search className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No tools found</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
            Try adjusting your search terms or explore our categories.
          </p>
          <Link 
            href="/"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition-colors text-sm shadow-lg shadow-purple-500/20"
          >
            Browse all tools
          </Link>
        </div>
      )}
    </div>
  );
}
