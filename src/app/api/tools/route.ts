import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TOOL_SELECT } from '@/lib/database/schema';

/**
 * Tools API — Paginated, filterable, sortable.
 * 
 * WHY pagination at the API layer:
 * - Dashboard, search, and categories all need paginated data
 * - Without pagination, every page load transfers ALL tools
 * - PostgreSQL LIMIT/OFFSET is the simplest correct approach at this scale
 * - Cursor-based would be better at 100k+ rows, but OFFSET is fine for <10k
 * 
 * Query params:
 *   page     - Page number (default: 1)
 *   limit    - Items per page (default: 20, max: 100)
 *   category - Filter by category name
 *   sort     - votes | views | newest | oldest (default: votes)
 *   search   - Full-text search query
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'votes';
    const search = searchParams.get('search')?.trim();
    const offset = (page - 1) * limit;

    const supabase = await createClient();

    // If search query provided, use RPC-based full-text search
    if (search) {
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('search_tools', {
          search_query: search,
          result_limit: limit,
          result_offset: offset,
        });

      if (!rpcError && rpcData) {
        return NextResponse.json({
          success: true,
          data: rpcData,
          pagination: { page, limit, total: rpcData.length, totalPages: 1, hasMore: false }
        });
      }
      // Fall through to regular query with ilike if RPC fails
    }

    // Build query with filters and sorting
    let query = supabase
      .from('tools')
      .select(TOOL_SELECT, { count: 'exact' });

    if (category) {
      query = query.eq('category', category);
    }

    // Apply sort order
    switch (sort) {
      case 'views':
        query = query.order('views_count', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'votes':
      default:
        query = query.order('votes_count', { ascending: false });
        break;
    }

    // Apply ilike search fallback if search was provided but RPC failed
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch tools',
      }, { status: 500 });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasMore: page < totalPages
      }
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: 'Internal Server Error',
    }, { status: 500 });
  }
}

