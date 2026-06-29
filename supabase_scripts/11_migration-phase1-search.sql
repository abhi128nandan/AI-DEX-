-- ══════════════════════════════════════════════════════════════
-- AIDex Phase 1 Migration: Full-Text Search + Performance
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- 1. FULL-TEXT SEARCH COLUMN + INDEX
-- ──────────────────────────────────────────────
-- WHY: Client-side search downloads ALL tools then filters in JS.
-- At 500+ tools this is unacceptable. PostgreSQL FTS uses inverted
-- indexes (GIN) that search in O(log n) instead of O(n).
--
-- WHY tsvector GENERATED ALWAYS:
-- - Auto-updates when name/description/tags change
-- - No need for triggers or manual sync
-- - Zero maintenance overhead
-- ──────────────────────────────────────────────

-- Create an immutable wrapper for array_to_string because Postgres does not allow STABLE functions in generated columns
CREATE OR REPLACE FUNCTION public.immutable_array_to_string(arr TEXT[], sep TEXT)
RETURNS TEXT
LANGUAGE sql IMMUTABLE STRICT
AS $$
  SELECT array_to_string(arr, sep);
$$;

-- Add generated tsvector column combining name, description, and tags
ALTER TABLE tools ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(public.immutable_array_to_string(tags, ' '), '')), 'C')
  ) STORED;

-- WHY GIN index: GIN (Generalized Inverted Index) is the standard
-- for full-text search. It creates an inverted index of lexemes,
-- making text search O(log n) instead of sequential scan.
CREATE INDEX IF NOT EXISTS idx_tools_search_vector ON tools USING gin(search_vector);

-- ──────────────────────────────────────────────
-- 2. FIX NULL TAGS
-- ──────────────────────────────────────────────
-- Some existing tools have tags = NULL instead of '{}'. 
-- This causes validation failures on the frontend.
UPDATE tools SET tags = '{}' WHERE tags IS NULL;

-- ──────────────────────────────────────────────
-- 3. SEARCH RPC FUNCTION
-- ──────────────────────────────────────────────
-- WHY an RPC function instead of raw query:
-- - Encapsulates search logic in the database layer
-- - Supports both FTS and ILIKE fallback for partial matches
-- - Returns relevance ranking for result ordering
-- - Single round-trip instead of multiple queries

CREATE OR REPLACE FUNCTION search_tools(
  search_query TEXT,
  result_limit INT DEFAULT 20,
  result_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  website_url TEXT,
  logo_url TEXT,
  category TEXT,
  tags TEXT[],
  views_count INT,
  votes_count INT,
  is_featured BOOLEAN,
  is_verified BOOLEAN,
  created_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  -- If query is empty, return tools sorted by votes
  IF search_query IS NULL OR trim(search_query) = '' THEN
    RETURN QUERY
      SELECT t.id, t.name, t.slug, t.description, t.website_url, t.logo_url,
             t.category, t.tags, t.views_count, t.votes_count,
             t.is_featured, t.is_verified, t.created_at,
             0::REAL as rank
      FROM tools t
      ORDER BY t.votes_count DESC
      LIMIT result_limit OFFSET result_offset;
    RETURN;
  END IF;

  -- Full-text search with relevance ranking + ILIKE fallback
  RETURN QUERY
    SELECT t.id, t.name, t.slug, t.description, t.website_url, t.logo_url,
           t.category, t.tags, t.views_count, t.votes_count,
           t.is_featured, t.is_verified, t.created_at,
           ts_rank(t.search_vector, websearch_to_tsquery('english', search_query))::REAL as rank
    FROM tools t
    WHERE 
      t.search_vector @@ websearch_to_tsquery('english', search_query)
      OR t.name ILIKE '%' || search_query || '%'
      OR t.description ILIKE '%' || search_query || '%'
    ORDER BY rank DESC, t.votes_count DESC
    LIMIT result_limit OFFSET result_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- ──────────────────────────────────────────────
-- 4. PAGINATION INDEXES
-- ──────────────────────────────────────────────
-- Composite indexes for the most common query patterns:
-- dashboard sorted by votes, filtered by category, sorted by date

CREATE INDEX IF NOT EXISTS idx_tools_votes_desc ON tools(votes_count DESC);
CREATE INDEX IF NOT EXISTS idx_tools_category_votes ON tools(category, votes_count DESC);
CREATE INDEX IF NOT EXISTS idx_tools_created_desc ON tools(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tools_featured ON tools(is_featured) WHERE is_featured = true;

-- ──────────────────────────────────────────────
-- 5. VIEW COUNT INCREMENT FUNCTION (if missing)
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_views(tool_id_input UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tools SET views_count = views_count + 1 WHERE id = tool_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
