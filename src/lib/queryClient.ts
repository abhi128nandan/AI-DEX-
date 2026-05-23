import { QueryClient } from '@tanstack/react-query';

/**
 * Shared QueryClient factory for TanStack Query.
 * 
 * WHY TanStack Query over raw fetch:
 * 1. Automatic caching — identical queries share a single network request
 * 2. Stale-while-revalidate — shows cached data instantly, refreshes in background
 * 3. Automatic retry — failed requests retry with exponential backoff
 * 4. Window focus refetching — data stays fresh when user returns to tab
 * 5. Garbage collection — unused cache entries are cleaned up automatically
 * 
 * WHY these defaults:
 * - staleTime: 60s — tools data doesn't change every second
 * - gcTime: 5min — keep cache for navigations but don't hog memory
 * - retry: 1 — fail fast, don't block UI with retries
 * - refetchOnWindowFocus: false — prevent unnecessary Supabase calls
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,            // 60 seconds
        gcTime: 5 * 60 * 1000,           // 5 minutes
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

// Singleton for browser — prevents creating a new client on every render
let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  // Server: always create a new client (no shared state between requests)
  if (typeof window === 'undefined') {
    return makeQueryClient();
  }
  // Browser: reuse singleton
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
