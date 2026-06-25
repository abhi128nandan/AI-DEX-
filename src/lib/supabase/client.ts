/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, react/no-unescaped-entities, react-hooks/exhaustive-deps, prefer-const, react-hooks/set-state-in-effect */
import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

// Singleton instance to prevent "Multiple GoTrueClient instances detected"
let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function getSupabaseClient() {
  if (browserClient) return browserClient;

  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return browserClient;
}

