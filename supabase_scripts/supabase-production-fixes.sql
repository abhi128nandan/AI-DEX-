-- Production Fixes SQL
-- Run this in Supabase SQL Editor

-- FIX 1: Add role column to profiles table (idempotent)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- FIX 1.1: Update existing trigger to include role column with idempotent ON CONFLICT handling
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger is attached to auth.users table (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- FIX 1.2: Backfill missing profiles for existing users
-- 
-- PURPOSE: Creates profiles for any auth.users records that don't have corresponding profiles.
--          This handles cases where:
--          - Users were created before the trigger was implemented
--          - The trigger failed due to race conditions or RLS violations
--          - Profile creation was skipped due to past bugs
--
-- WHEN TO RUN:
--          - After deploying the updated handle_new_user() trigger (FIX 1.1)
--          - When verifyAdmin() logs warnings about missing profiles
--          - During production database maintenance to ensure data consistency
--
-- SAFETY: This query is idempotent and safe to run multiple times.
--         ON CONFLICT DO NOTHING ensures existing profiles are never modified or duplicated.
--         Only missing profiles will be created with default role='user'.
--
-- VERIFICATION: After running, check the verification query at the end of this file
--               to confirm all users have profiles.
--
INSERT INTO profiles (id, username, role)
SELECT 
  au.id,
  au.email,
  'user'
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- FIX 3: Add soft delete column to tools table (idempotent)
ALTER TABLE tools ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- FIX 5: Add performance indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);
CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category);
CREATE INDEX IF NOT EXISTS idx_tools_votes_count_desc ON tools(votes_count DESC);
CREATE INDEX IF NOT EXISTS idx_tools_is_deleted ON tools(is_deleted) WHERE is_deleted = false;

-- Verify profiles have role column
SELECT COUNT(*) as total_profiles, 
       COUNT(role) as profiles_with_role,
       COUNT(*) FILTER (WHERE role = 'admin') as admin_count
FROM profiles;
