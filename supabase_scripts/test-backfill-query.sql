-- Test Backfill Query for Missing Profiles
-- Run this in Supabase SQL Editor (Development Environment Only)

-- ============================================================================
-- TEST SETUP: Create test scenario with missing profiles
-- ============================================================================

-- Test 1: Verify current state before backfill
-- Expected: Shows count of users and profiles, identifies any missing profiles
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN profiles p ON au.id = p.id WHERE p.id IS NULL) as missing_profiles;

-- Test 2: Identify specific users with missing profiles (if any)
-- Expected: Returns list of user IDs and emails that don't have profiles
SELECT 
  au.id,
  au.email,
  au.created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;

-- ============================================================================
-- TEST EXECUTION: Run the backfill query
-- ============================================================================

-- Test 3: Execute backfill query (idempotent - safe to run multiple times)
-- Expected: Inserts profiles for users without profiles, returns count of rows inserted
INSERT INTO profiles (id, username, role)
SELECT 
  au.id,
  au.email,
  'user'
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TEST VERIFICATION: Verify backfill results
-- ============================================================================

-- Test 4: Verify all users now have profiles
-- Expected: missing_profiles should be 0
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN profiles p ON au.id = p.id WHERE p.id IS NULL) as missing_profiles;

-- Test 5: Verify newly created profiles have correct default role
-- Expected: All backfilled profiles should have role='user'
SELECT 
  p.id,
  p.username,
  p.role,
  p.created_at
FROM profiles p
WHERE p.id IN (
  SELECT au.id 
  FROM auth.users au
  WHERE au.created_at < NOW() - INTERVAL '1 minute'
)
ORDER BY p.created_at DESC
LIMIT 10;

-- Test 6: Test idempotency - run backfill again
-- Expected: No new rows inserted (ON CONFLICT DO NOTHING prevents duplicates)
INSERT INTO profiles (id, username, role)
SELECT 
  au.id,
  au.email,
  'user'
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Test 7: Verify no duplicates were created
-- Expected: Each user ID should appear exactly once in profiles table
SELECT 
  id,
  COUNT(*) as profile_count
FROM profiles
GROUP BY id
HAVING COUNT(*) > 1;
-- Expected result: No rows (empty result set means no duplicates)

-- Test 8: Verify existing profiles were not modified
-- Expected: Profiles with role='admin' should still be 'admin', not changed to 'user'
SELECT 
  COUNT(*) as admin_profiles_preserved
FROM profiles
WHERE role = 'admin';
-- Compare this count before and after backfill - should be identical

-- ============================================================================
-- TEST SUMMARY
-- ============================================================================

-- Final verification query
SELECT 
  'Backfill Test Summary' as test_name,
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN profiles p ON au.id = p.id WHERE p.id IS NULL) as missing_profiles,
  (SELECT COUNT(*) FROM profiles WHERE role = 'user') as user_profiles,
  (SELECT COUNT(*) FROM profiles WHERE role = 'admin') as admin_profiles,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users au LEFT JOIN profiles p ON au.id = p.id WHERE p.id IS NULL) = 0 
    THEN '✅ PASS: All users have profiles'
    ELSE '❌ FAIL: Some users still missing profiles'
  END as test_result;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- 1. This test is safe to run in development environments
-- 2. The backfill query is idempotent - safe to run multiple times
-- 3. ON CONFLICT DO NOTHING ensures existing profiles are never modified
-- 4. Only missing profiles are created with default role='user'
-- 5. Admin profiles are preserved and not overwritten
-- 6. After running in production, verify with the final summary query
--
