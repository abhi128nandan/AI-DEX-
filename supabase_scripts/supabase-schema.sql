-- Run this in your Supabase SQL Editor

-- 1. Create Tools table
CREATE TABLE tools (
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Profiles table (linked to auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  vote_type TEXT CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tool_id)
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies

-- Tools: anyone can read
CREATE POLICY "Public tools are viewable by everyone." 
  ON tools FOR SELECT USING (true);

-- Profiles: public can read, users can update their own
CREATE POLICY "Public profiles are viewable by everyone." 
  ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." 
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Votes: public can read, auth can insert/update, owner can delete
CREATE POLICY "Votes are viewable by everyone." 
  ON votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert votes." 
  ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes." 
  ON votes FOR DELETE USING (auth.uid() = user_id);

-- 6. Trigger to automatically create profile on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. Create Performance Indexes
-- Index for vote lookups (tool_id, user_id)
CREATE INDEX IF NOT EXISTS idx_votes_tool_user ON votes(tool_id, user_id);

-- Index for vote counting by tool
CREATE INDEX IF NOT EXISTS idx_votes_tool_id ON votes(tool_id);

-- Index for admin dashboard pending submissions
CREATE INDEX IF NOT EXISTS idx_tool_submissions_status ON tool_submissions(status);

-- Index for sorting tools by vote count (descending)
CREATE INDEX IF NOT EXISTS idx_tools_votes_count_desc ON tools(votes_count DESC);

-- Index for filtering tools by category
CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category);
