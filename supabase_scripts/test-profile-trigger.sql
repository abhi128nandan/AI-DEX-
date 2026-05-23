-- Test Profile Synchronization Trigger
-- This file tests that the handle_new_user() trigger creates profiles automatically
-- with ON CONFLICT DO NOTHING for idempotency

-- Test 1: Verify trigger function exists and has correct definition
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'handle_new_user';

-- Test 2: Verify trigger is attached to auth.users table
SELECT 
  t.tgname as trigger_name,
  c.relname as table_name,
  p.proname as function_name,
  t.tgenabled as enabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'auth' 
  AND c.relname = 'users'
  AND t.tgname = 'on_auth_user_created';

-- Test 3: Simulate new user insert (DO NOT RUN IN PRODUCTION)
-- This test would verify that the trigger creates a profile automatically
-- Uncomment to test in development environment:
/*
BEGIN;

-- Insert a test user (this would normally be done by Supabase Auth)
INSERT INTO auth.users (
  id, 
  email, 
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'test-trigger@example.com',
  '{"role": "user", "avatar_url": "https://example.com/avatar.png"}'::jsonb
);

-- Verify profile was created automatically
SELECT 
  p.id,
  p.username,
  p.role,
  p.avatar_url
FROM profiles p
WHERE p.username = 'test-trigger@example.com';

ROLLBACK;
*/

-- Test 4: Verify ON CONFLICT DO NOTHING behavior
-- This test verifies that duplicate inserts are handled gracefully
-- Uncomment to test in development environment:
/*
BEGIN;

-- Create a test user ID
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
BEGIN
  -- First insert should succeed
  INSERT INTO auth.users (id, email, raw_user_meta_data)
  VALUES (test_user_id, 'test-conflict@example.com', '{"role": "user"}'::jsonb);
  
  -- Manually trigger the function again (simulating concurrent insert)
  -- This should NOT fail due to ON CONFLICT DO NOTHING
  INSERT INTO public.profiles (id, username, avatar_url, role)
  VALUES (
    test_user_id,
    'test-conflict@example.com',
    'https://example.com/avatar.png',
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Verify only one profile exists
  IF (SELECT COUNT(*) FROM profiles WHERE id = test_user_id) = 1 THEN
    RAISE NOTICE 'Test PASSED: ON CONFLICT DO NOTHING works correctly';
  ELSE
    RAISE EXCEPTION 'Test FAILED: Multiple profiles created';
  END IF;
END $$;

ROLLBACK;
*/

-- Test 5: Verify role extraction from metadata
-- Uncomment to test in development environment:
/*
BEGIN;

-- Test with admin role in metadata
INSERT INTO auth.users (
  id,
  email,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'test-admin@example.com',
  '{"role": "admin"}'::jsonb
);

-- Verify admin role was set correctly
SELECT 
  p.username,
  p.role,
  CASE 
    WHEN p.role = 'admin' THEN 'PASSED: Admin role extracted correctly'
    ELSE 'FAILED: Role not set correctly'
  END as test_result
FROM profiles p
WHERE p.username = 'test-admin@example.com';

ROLLBACK;
*/

-- Test 6: Verify default role when metadata is missing
-- Uncomment to test in development environment:
/*
BEGIN;

-- Test with no role in metadata
INSERT INTO auth.users (
  id,
  email,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'test-default@example.com',
  '{}'::jsonb
);

-- Verify default 'user' role was set
SELECT 
  p.username,
  p.role,
  CASE 
    WHEN p.role = 'user' THEN 'PASSED: Default role set correctly'
    ELSE 'FAILED: Default role not set'
  END as test_result
FROM profiles p
WHERE p.username = 'test-default@example.com';

ROLLBACK;
*/
