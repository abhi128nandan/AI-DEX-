'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';

/**
 * QueryProvider — Wraps the app with TanStack Query context.
 * 
 * WHY a separate component:
 * - Root layout.tsx is a Server Component — can't use hooks there
 * - This client component provides the QueryClient to all children
 * - Uses the singleton pattern from getQueryClient() to prevent
 *   creating a new client on every re-render
 */
export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
