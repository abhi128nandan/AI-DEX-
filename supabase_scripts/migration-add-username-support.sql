-- Username Support Migration
-- Safe, idempotent migration to add username support to profiles
-- Run this in Supabase SQL Editor

-- STEP 1: Add username column (idempotent)
-- Note: Column may already exist, IF NOT EXISTS prevents errors
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- STEP 2: Create index for username lookups (idempotent)
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- STEP 3: Backfill usernames for existing users
-- Extract username from email (part before @)
-- Only update rows where username is NULL
UPDATE profiles
SET username = LOWER(SPLIT_PART(
  (SELECT email FROM auth.users WHERE auth.users.id = profiles.id),
  '@',
  1
))
WHERE username IS NULL;

-- STEP 4: Update trigger to automatically set username on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, role)
  VALUES (
    NEW.id, 
    LOWER(SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but allow auth to succeed
    RAISE WARNING 'Profile creation failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger is attached (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- VERIFICATION QUERIES
-- Run these to confirm migration success

-- Check username population
SELECT 
  COUNT(*) as total_profiles,
  COUNT(username) as profiles_with_username,
  COUNT(*) - COUNT(username) as profiles_without_username
FROM profiles;

-- Sample usernames
SELECT id, username, role, created_at 
FROM profiles 
LIMIT 10;

-- Verify trigger function
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_name = 'handle_new_user'
  AND routine_schema = 'public';
