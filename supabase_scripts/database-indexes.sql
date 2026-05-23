-- Critical Database Indexes for Production
-- Run this in your Supabase SQL Editor

-- Index for vote lookups (tool_id, user_id)
-- Used by: checkVoteStatus in useVote hook, /api/votes endpoint
CREATE INDEX IF NOT EXISTS idx_votes_tool_user ON votes(tool_id, user_id);

-- Index for vote counting by tool
-- Used by: /api/votes endpoint to count votes per tool
CREATE INDEX IF NOT EXISTS idx_votes_tool_id ON votes(tool_id);

-- Index for admin dashboard pending submissions
-- Used by: /api/admin/tools GET endpoint
CREATE INDEX IF NOT EXISTS idx_tool_submissions_status ON tool_submissions(status);

-- Index for sorting tools by vote count (descending)
-- Used by: tool listing pages, trending/top pages
CREATE INDEX IF NOT EXISTS idx_tools_votes_count_desc ON tools(votes_count DESC);

-- Index for filtering tools by category
-- Used by: category pages, tool filtering
CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category);

-- Verify indexes were created
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
