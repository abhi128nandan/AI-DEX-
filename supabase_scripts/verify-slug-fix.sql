-- Verification Script: Check if slug column fix was applied correctly
-- Run this in Supabase SQL Editor after running the migration

-- ============================================
-- VERIFICATION CHECKS
-- ============================================

-- Check 1: Verify slug column exists
SELECT 
  'Check 1: Slug Column Exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'tools' AND column_name = 'slug'
    ) THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status;

-- Check 2: Verify slug is NOT NULL
SELECT 
  'Check 2: Slug is NOT NULL' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'tools' 
      AND column_name = 'slug' 
      AND is_nullable = 'NO'
    ) THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status;

-- Check 3: Verify slug has UNIQUE constraint
SELECT 
  'Check 3: Slug has UNIQUE constraint' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'tools_slug_unique'
    ) THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status;

-- Check 4: Verify index on slug exists
SELECT 
  'Check 4: Index on slug exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'tools' 
      AND indexname = 'idx_tools_slug'
    ) THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status;

-- Check 5: Verify RLS is enabled
SELECT 
  'Check 5: RLS is enabled' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'tools' 
      AND rowsecurity = true
    ) THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status;

-- Check 6: Verify public read policy exists
SELECT 
  'Check 6: Public read policy exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'tools' 
      AND policyname = 'Allow public read'
    ) THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status;

-- Check 7: Verify tools table has data
SELECT 
  'Check 7: Tools table has data' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM tools LIMIT 1) THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status;

-- Check 8: Verify all rows have non-null slugs
SELECT 
  'Check 8: All rows have non-null slugs' as check_name,
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM tools WHERE slug IS NULL) THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status;

-- Check 9: Verify all slugs are unique
SELECT 
  'Check 9: All slugs are unique' as check_name,
  CASE 
    WHEN NOT EXISTS (
      SELECT slug FROM tools GROUP BY slug HAVING COUNT(*) > 1
    ) THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status;

-- ============================================
-- DATA INSPECTION
-- ============================================

-- Show all tools with their slugs
SELECT 
  '--- TOOLS DATA ---' as section,
  '' as id,
  '' as name,
  '' as slug,
  '' as category,
  '' as votes_count,
  '' as views_count
UNION ALL
SELECT 
  '',
  LEFT(id::text, 8) as id,
  name,
  slug,
  category,
  votes_count::text,
  views_count::text
FROM tools 
ORDER BY votes_count DESC;

-- ============================================
-- SCHEMA DETAILS
-- ============================================

-- Show slug column details
SELECT 
  '--- SLUG COLUMN SCHEMA ---' as section,
  '' as column_name,
  '' as data_type,
  '' as is_nullable,
  '' as column_default
UNION ALL
SELECT 
  '',
  column_name,
  data_type,
  is_nullable,
  COALESCE(column_default, 'NULL')
FROM information_schema.columns 
WHERE table_name = 'tools' AND column_name = 'slug';

-- ============================================
-- SUMMARY
-- ============================================

SELECT 
  '--- SUMMARY ---' as info,
  '' as value
UNION ALL
SELECT 
  'Total tools',
  COUNT(*)::text
FROM tools
UNION ALL
SELECT 
  'Tools with slugs',
  COUNT(*)::text
FROM tools
WHERE slug IS NOT NULL
UNION ALL
SELECT 
  'Unique slugs',
  COUNT(DISTINCT slug)::text
FROM tools;

-- ============================================
-- EXPECTED OUTPUT
-- ============================================
-- All checks should show: ✅ PASS
-- Tools data should show at least 5 sample tools
-- All slugs should be non-null and unique
-- Summary should show matching counts
-- ============================================
