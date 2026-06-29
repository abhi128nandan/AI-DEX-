-- ══════════════════════════════════════════════════════════════
-- AIDex Master Rebuild Script
-- Run this in your Supabase SQL Editor for a 100% clean reset.
-- WARNING: This will drop and rebuild all tables, views, and data.
-- ══════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- STEP 1: CLEAN PURGE (Drop everything with CASCADE)
-- ──────────────────────────────────────────────

-- Drop Views
DROP VIEW IF EXISTS public.category_counts CASCADE;
DROP VIEW IF EXISTS public.trending_tools CASCADE;

-- Drop Tables
DROP TABLE IF EXISTS public.votes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TABLE IF EXISTS public.tools CASCADE;
DROP TABLE IF EXISTS public.tool_comments CASCADE;
DROP TABLE IF EXISTS public.saved_tools CASCADE;
DROP TABLE IF EXISTS public.auth_rate_limits CASCADE;
DROP TABLE IF EXISTS public.tool_submissions CASCADE;

-- Drop Triggers & Functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_vote(UUID, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.search_tools(TEXT, INT, INT) CASCADE;
DROP FUNCTION IF EXISTS public.increment_views(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.immutable_array_to_string(TEXT[], TEXT) CASCADE;

-- ──────────────────────────────────────────────
-- STEP 2: CREATE HELPER FUNCTIONS & EXTENSIONS
-- ──────────────────────────────────────────────

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create an immutable wrapper for array_to_string for generated columns
CREATE OR REPLACE FUNCTION public.immutable_array_to_string(arr TEXT[], sep TEXT)
RETURNS TEXT
LANGUAGE sql IMMUTABLE STRICT
AS $$
  SELECT array_to_string(arr, sep);
$$;

-- ──────────────────────────────────────────────
-- STEP 3: CREATE TABLES
-- ──────────────────────────────────────────────

-- 1. Create Profiles table (referenced by other tables)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Tools table
CREATE TABLE public.tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  website_url TEXT NOT NULL,
  logo_url TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  views_count INT DEFAULT 0,
  votes_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Generated Full-Text Search tsvector column
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(public.immutable_array_to_string(tags, ' '), '')), 'C')
  ) STORED
);

-- 3. Create Votes table
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
  vote_type TEXT CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tool_id)
);

-- 4. Create Tool Comments table
CREATE TABLE public.tool_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Saved Tools (Bookmarks) table
CREATE TABLE public.saved_tools (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, tool_id)
);

-- 6. Create Auth Rate Limits table
CREATE TABLE public.auth_rate_limits (
  ip_address TEXT PRIMARY KEY,
  request_count INT DEFAULT 1,
  last_request TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create Tool Submissions table
CREATE TABLE public.tool_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_deleted BOOLEAN DEFAULT false,
  url TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- STEP 4: ENABLE ROW LEVEL SECURITY (RLS)
-- ──────────────────────────────────────────────

ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_submissions ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────
-- STEP 5: CREATE RLS POLICIES
-- ──────────────────────────────────────────────

-- Tools RLS
CREATE POLICY "Public tools are viewable by everyone" ON public.tools FOR SELECT USING (is_deleted = false);

-- Profiles RLS
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Votes RLS
CREATE POLICY "Votes are viewable by everyone" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert votes" ON public.votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes" ON public.votes FOR DELETE USING (auth.uid() = user_id);

-- Comments RLS
CREATE POLICY "Comments are viewable by everyone" ON public.tool_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can post comments" ON public.tool_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.tool_comments FOR DELETE USING (auth.uid() = user_id);

-- Saved Tools RLS
CREATE POLICY "Users can manage their saved tools" ON public.saved_tools FOR ALL USING (auth.uid() = user_id);

-- Submissions RLS
CREATE POLICY "Authenticated users can submit tools" ON public.tool_submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- STEP 6: PROCEDURAL TRIGGERS & RPC FUNCTIONS
-- ──────────────────────────────────────────────

-- Trigger Function: Auto-create profile on Auth User sign up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, role)
  VALUES (
    new.id, 
    LOWER(SPLIT_PART(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Attach Profile Sync Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- RPC Function: Atomic Vote Handler
CREATE OR REPLACE FUNCTION public.handle_vote(
  p_user_id UUID,
  p_tool_id UUID,
  p_vote_type TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_vote TEXT;
  v_operation TEXT;
  v_upvotes INT;
  v_downvotes INT;
  v_user_vote TEXT;
BEGIN
  IF p_vote_type NOT IN ('up', 'down') THEN
    RAISE EXCEPTION 'Invalid vote_type: %. Must be ''up'' or ''down''', p_vote_type;
  END IF;

  SELECT vote_type INTO v_existing_vote FROM votes WHERE user_id = p_user_id AND tool_id = p_tool_id;

  IF v_existing_vote IS NOT NULL AND v_existing_vote = p_vote_type THEN
    DELETE FROM votes WHERE user_id = p_user_id AND tool_id = p_tool_id;
    v_operation := 'removed';
  ELSE
    INSERT INTO votes (user_id, tool_id, vote_type) VALUES (p_user_id, p_tool_id, p_vote_type)
    ON CONFLICT (user_id, tool_id) DO UPDATE SET vote_type = EXCLUDED.vote_type;
    
    IF v_existing_vote IS NULL THEN v_operation := 'added'; ELSE v_operation := 'switched'; END IF;
  END IF;

  SELECT COUNT(*) FILTER (WHERE vote_type = 'up'), COUNT(*) FILTER (WHERE vote_type = 'down') INTO v_upvotes, v_downvotes FROM votes WHERE tool_id = p_tool_id;
  SELECT vote_type INTO v_user_vote FROM votes WHERE user_id = p_user_id AND tool_id = p_tool_id;

  -- Update cache counts directly on live tools table
  UPDATE public.tools SET votes_count = v_upvotes WHERE id = p_tool_id;

  RETURN json_build_object('upvotes', v_upvotes, 'downvotes', v_downvotes, 'userVote', v_user_vote, 'operation', v_operation);
END;
$$;
GRANT EXECUTE ON FUNCTION public.handle_vote(UUID, UUID, TEXT) TO authenticated;

-- RPC Function: Full-Text Search
CREATE OR REPLACE FUNCTION public.search_tools(
  search_query TEXT,
  result_limit INT DEFAULT 20,
  result_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID, name TEXT, slug TEXT, description TEXT, website_url TEXT, logo_url TEXT,
  category TEXT, tags TEXT[], views_count INT, votes_count INT,
  is_featured BOOLEAN, is_verified BOOLEAN, created_at TIMESTAMPTZ, rank REAL
) AS $$
BEGIN
  IF search_query IS NULL OR trim(search_query) = '' THEN
    RETURN QUERY
      SELECT t.id, t.name, t.slug, t.description, t.website_url, t.logo_url,
             t.category, t.tags, t.views_count, t.votes_count,
             t.is_featured, t.is_verified, t.created_at, 0::REAL as rank
      FROM public.tools t WHERE t.is_deleted = false
      ORDER BY t.votes_count DESC LIMIT result_limit OFFSET result_offset;
    RETURN;
  END IF;

  RETURN QUERY
    SELECT t.id, t.name, t.slug, t.description, t.website_url, t.logo_url,
           t.category, t.tags, t.views_count, t.votes_count,
           t.is_featured, t.is_verified, t.created_at,
           ts_rank(t.search_vector, websearch_to_tsquery('english', search_query))::REAL as rank
    FROM public.tools t
    WHERE t.is_deleted = false AND (
      t.search_vector @@ websearch_to_tsquery('english', search_query)
      OR t.name ILIKE '%' || search_query || '%'
      OR t.description ILIKE '%' || search_query || '%'
    )
    ORDER BY rank DESC, t.votes_count DESC LIMIT result_limit OFFSET result_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- RPC Function: Increment Views
CREATE OR REPLACE FUNCTION public.increment_views(tool_id_input UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.tools SET views_count = views_count + 1 WHERE id = tool_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ──────────────────────────────────────────────
-- STEP 7: PERFORMANCE INDEXES
-- ──────────────────────────────────────────────

-- Search Vector GIN Index
CREATE INDEX IF NOT EXISTS idx_tools_search_vector ON public.tools USING gin(search_vector);

-- Tags Array GIN Index
CREATE INDEX IF NOT EXISTS idx_tools_tags ON public.tools USING gin (tags);

-- Comments sorting & foreign key index
CREATE INDEX IF NOT EXISTS idx_tool_comments_tool_created ON public.tool_comments (tool_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_comments_user ON public.tool_comments (user_id);

-- Submissions index
CREATE INDEX IF NOT EXISTS idx_tool_submissions_user ON public.tool_submissions (user_id);

-- Query sorting indexes
CREATE INDEX IF NOT EXISTS idx_tools_votes_desc ON public.tools(votes_count DESC);
CREATE INDEX IF NOT EXISTS idx_tools_category_votes ON public.tools(category, votes_count DESC);
CREATE INDEX IF NOT EXISTS idx_tools_created_desc ON public.tools(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tools_featured ON public.tools(is_featured) WHERE is_featured = true;

-- ──────────────────────────────────────────────
-- STEP 8: SECURITY-SAFE VIEWS
-- ──────────────────────────────────────────────

-- Category Counts View
CREATE OR REPLACE VIEW public.category_counts 
WITH (security_invoker = true) AS
SELECT category, COUNT(*)::INT as count FROM public.tools WHERE is_deleted = false GROUP BY category;

-- Trending Tools View
CREATE OR REPLACE VIEW public.trending_tools 
WITH (security_invoker = true) AS
SELECT *, (votes_count * 3.0 + views_count * 0.1)::REAL as trend_score FROM public.tools WHERE is_deleted = false ORDER BY trend_score DESC;

GRANT SELECT ON public.category_counts TO anon, authenticated, service_role;
GRANT SELECT ON public.trending_tools TO anon, authenticated, service_role;

-- ──────────────────────────────────────────────
-- STEP 9: RATE LIMIT LOGS CLEANER SCHEDULER
-- ──────────────────────────────────────────────

SELECT cron.schedule(
  'purge-old-rate-limits',
  '30 * * * *',
  $$ DELETE FROM public.auth_rate_limits WHERE created_at < now() - interval '1 hour' $$
);
