-- ====================================================================
-- AIDex Production Readiness Migration Script
-- Run this in your Supabase SQL Editor to apply database optimizations.
-- ====================================================================

-- ────────────────────────────────────────────────────────────────────
-- 1. PERFORMANCE INDEXES
-- ────────────────────────────────────────────────────────────────────

-- Index for fetching comments for a tool sorted by newest first
-- Prevents sequential scans on tool_comments table when loading details page
CREATE INDEX IF NOT EXISTS idx_tool_comments_tool_created 
ON public.tool_comments (tool_id, created_at DESC);

-- GIN (Generalized Inverted Index) on tools tags array
-- Required for fast SQL-level array containment searches (e.g. tags @> ARRAY['tag'])
CREATE INDEX IF NOT EXISTS idx_tools_tags 
ON public.tools USING gin (tags);

-- Indexes for unindexed foreign keys (prevents full-table scans during user cascade deletes)
CREATE INDEX IF NOT EXISTS idx_tool_comments_user ON public.tool_comments (user_id);
CREATE INDEX IF NOT EXISTS idx_tool_submissions_user ON public.tool_submissions (user_id);


-- ────────────────────────────────────────────────────────────────────
-- 2. PERFORMANCE VIEWS (DATABASE-LEVEL AGGREGATIONS)
-- ────────────────────────────────────────────────────────────────────

-- Category Counts View
-- Replaces fetching all tools just to perform category counts in JavaScript memory
-- WITH (security_invoker = true) ensures this view respects Row Level Security policies
CREATE OR REPLACE VIEW public.category_counts 
WITH (security_invoker = true) AS
SELECT 
  category, 
  COUNT(*)::INT as count 
FROM public.tools 
WHERE is_deleted = false 
GROUP BY category;

-- Trending Tools View
-- Replaces random 50 tool fetch followed by in-memory trending sort
-- WITH (security_invoker = true) ensures this view respects Row Level Security policies
CREATE OR REPLACE VIEW public.trending_tools 
WITH (security_invoker = true) AS
SELECT 
  *, 
  (votes_count * 3.0 + views_count * 0.1)::REAL as trend_score
FROM public.tools
WHERE is_deleted = false
ORDER BY trend_score DESC;

-- Grant read privileges on new views to anon and authenticated roles
GRANT SELECT ON public.category_counts TO anon, authenticated, service_role;
GRANT SELECT ON public.trending_tools TO anon, authenticated, service_role;


-- ────────────────────────────────────────────────────────────────────
-- 3. AUTO-CLEANUP WORKER FOR RATE LIMITS
-- ────────────────────────────────────────────────────────────────────

-- Enable pg_cron extension (often enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule auto-deletion of rate limit logs older than 1 hour (runs hourly)
SELECT cron.schedule(
  'purge-old-rate-limits',
  '30 * * * *', -- Run every hour at minute 30
  $$ DELETE FROM public.auth_rate_limits WHERE created_at < now() - interval '1 hour' $$
);
