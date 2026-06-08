'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tool } from '@/types';

/**
 * Pagination response shape from /api/tools
 */
interface PaginatedResponse {
  success: boolean;
  data: Tool[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

interface UseToolsOptions {
  page?: number;
  limit?: number;
  category?: string;
  sort?: 'votes' | 'views' | 'newest' | 'oldest';
  search?: string;
  enabled?: boolean;
}

/**
 * useTools — Paginated tool fetching with TanStack Query.
 * 
 * WHY this hook:
 * - Centralizes all tool-fetching logic in one reusable hook
 * - Automatic caching means navigating back to a page is instant
 * - Query key includes all params, so different filters = different cache entries
 * - Prefetching: we prefetch the next page for instant pagination
 * 
 * WHY not use Supabase client directly:
 * - API route handles auth + validation server-side
 * - Easier to add rate limiting, logging, and caching at the API layer
 * - Client components shouldn't build complex Supabase queries
 */
export function useTools(options: UseToolsOptions = {}) {
  const {
    page = 1,
    limit = 20,
    category,
    sort = 'votes',
    search,
    enabled = true,
  } = options;

  const queryClient = useQueryClient();

  const queryKey = ['tools', { page, limit, category, sort, search }];

  const query = useQuery<PaginatedResponse>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (category) params.set('category', category);
      if (sort) params.set('sort', sort);
      if (search) params.set('search', search);

      const res = await fetch(`/api/tools?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch tools');
      return res.json();
    },
    enabled,
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev, // Keep previous data while loading next page
  });

  // Prefetch next page for instant pagination
  if (query.data?.pagination?.hasMore) {
    const nextPageKey = ['tools', { page: page + 1, limit, category, sort, search }];
    queryClient.prefetchQuery({
      queryKey: nextPageKey,
      queryFn: async () => {
        const params = new URLSearchParams();
        params.set('page', String(page + 1));
        params.set('limit', String(limit));
        if (category) params.set('category', category);
        if (sort) params.set('sort', sort);
        if (search) params.set('search', search);

        const res = await fetch(`/api/tools?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch tools');
        return res.json();
      },
      staleTime: 60 * 1000,
    });
  }

  return {
    tools: query.data?.data ?? [],
    pagination: query.data?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0, hasMore: false },
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
