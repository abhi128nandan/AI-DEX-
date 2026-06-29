-- Fix RLS Policies for Production
-- Purpose: Ensure public read access to tools table
-- Run this in Supabase SQL Editor if tools are not loading

-- STEP 1: Check current RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'tools';

-- STEP 2: Check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'tools';

-- STEP 3: Enable RLS if not enabled
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON tools;
DROP POLICY IF EXISTS "Public tools are viewable by everyone." ON tools;
DROP POLICY IF EXISTS "Enable read access for all users" ON tools;
DROP POLICY IF EXISTS "tools_select_policy" ON tools;
DROP POLICY IF EXISTS "tools_public_read_policy" ON tools;


-- STEP 5: Create comprehensive public read policy
CREATE POLICY "tools_public_read_policy"
  ON tools
  FOR SELECT
  TO public
  USING (true);

-- STEP 6: Verify the policy was created
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'tools';

-- STEP 7: Test query as anon user
SET ROLE anon;
SELECT COUNT(*) as tool_count FROM tools;
SELECT id, name, slug FROM tools LIMIT 5;
RESET ROLE;

-- STEP 8: Grant SELECT permission to anon role
GRANT SELECT ON tools TO anon;
GRANT SELECT ON tools TO authenticated;
GRANT SELECT ON tools TO public;

-- STEP 9: Verify grants
SELECT 
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'tools';

-- STEP 10: Final verification
SELECT 
  '✅ RLS Enabled' as check_name,
  CASE 
    WHEN rowsecurity = true THEN 'PASS'
    ELSE 'FAIL'
  END as status
FROM pg_tables 
WHERE tablename = 'tools'
UNION ALL
SELECT 
  '✅ Public Read Policy Exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'tools' 
      AND cmd = 'SELECT'
    ) THEN 'PASS'
    ELSE 'FAIL'
  END as status
UNION ALL
SELECT 
  '✅ Tools Table Has Data' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM tools LIMIT 1) THEN 'PASS'
    ELSE 'FAIL'
  END as status;

-- Expected: All checks should show PASS
