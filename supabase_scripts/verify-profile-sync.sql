-- Verify Profile Sync Status
-- Run this in Supabase SQL Editor to check profile sync health

-- 1. Check if role column exists
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('id', 'username', 'role', 'created_at')
ORDER BY ordinal_position;

-- 2. Count users vs profiles
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN profiles p ON au.id = p.id WHERE p.id IS NULL) as users_without_profiles;

-- 3. Check role distribution
SELECT 
  role,
  COUNT(*) as count
FROM profiles
GROUP BY role
ORDER BY count DESC;

-- 4. Find users without profiles (should be empty after backfill)
SELECT 
  au.id,
  au.email,
  au.created_at as user_created_at,
  'MISSING PROFILE' as status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
LIMIT 10;

-- 5. Check trigger function exists and is correct
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'handle_new_user'
  AND routine_schema = 'public';

-- 6. Check trigger is active
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 7. Sample profiles with roles
SELECT 
  p.id,
  p.username,
  p.role,
  p.created_at,
  au.email
FROM profiles p
JOIN auth.users au ON p.id = au.id
ORDER BY p.created_at DESC
LIMIT 5;

-- Expected Results:
-- 1. role column should exist with type 'text' and default 'user'
-- 2. users_without_profiles should be 0
-- 3. Most profiles should have role='user', some may have role='admin'
-- 4. No users should be missing profiles
-- 5. Trigger function should exist and include role column
-- 6. Trigger should be active on auth.users INSERT
-- 7. All profiles should have a role value
