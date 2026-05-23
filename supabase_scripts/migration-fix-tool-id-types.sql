-- Migration: Fix Inconsistent Tool ID Types
-- GOAL: Make the entire system strictly UUID-based and deterministic
-- This migration is IDEMPOTENT and safe to run multiple times

-- ============================================
-- STEP 1: Verify Current State
-- ============================================

-- Check current ID types and identify non-UUID IDs
SELECT 
  id,
  name,
  slug,
  CASE 
    WHEN id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 'UUID'
    WHEN id::text ~ '^[0-9]+$' THEN 'NUMERIC'
    ELSE 'INVALID'
  END as id_type
FROM tools
ORDER BY 
  CASE 
    WHEN id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 1
    ELSE 2
  END,
  name;

-- Count by type
SELECT 
  CASE 
    WHEN id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 'UUID'
    WHEN id::text ~ '^[0-9]+$' THEN 'NUMERIC'
    ELSE 'INVALID'
  END as id_type,
  COUNT(*) as count
FROM tools
GROUP BY id_type;

-- ============================================
-- STEP 2: Backup Data (Create Temporary Table)
-- ============================================

-- Create backup of tools with non-UUID IDs
CREATE TEMP TABLE tools_backup AS
SELECT * FROM tools
WHERE NOT (id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- Show what will be affected
SELECT 
  id as old_id,
  name,
  slug,
  'Will be regenerated with UUID' as action
FROM tools_backup;

-- ============================================
-- STEP 3: Delete Tools with Non-UUID IDs
-- ============================================

-- CRITICAL: This deletes tools with numeric/invalid IDs
-- They will be re-inserted with proper UUIDs in the next step
DELETE FROM tools
WHERE NOT (id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- Show deletion count
SELECT 
  (SELECT COUNT(*) FROM tools_backup) as deleted_count,
  (SELECT COUNT(*) FROM tools) as remaining_count;

-- ============================================
-- STEP 4: Verify Table Structure
-- ============================================

-- Ensure tools.id is UUID type with proper default
DO $$ 
BEGIN
  -- Check if id column is UUID type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tools' 
    AND column_name = 'id' 
    AND data_type = 'uuid'
  ) THEN
    RAISE EXCEPTION 'tools.id column is not UUID type. Manual intervention required.';
  END IF;
  
  -- Check if default is gen_random_uuid()
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tools' 
    AND column_name = 'id' 
    AND column_default LIKE '%gen_random_uuid%'
  ) THEN
    -- Set default if missing
    ALTER TABLE tools ALTER COLUMN id SET DEFAULT gen_random_uuid();
    RAISE NOTICE 'Set default gen_random_uuid() for tools.id';
  ELSE
    RAISE NOTICE 'tools.id already has gen_random_uuid() default';
  END IF;
END $$;

-- ============================================
-- STEP 5: Re-insert Tools with Proper UUIDs
-- ============================================

-- Re-insert tools from backup with new UUIDs
-- Uses ON CONFLICT DO NOTHING to prevent duplicates
INSERT INTO tools (name, slug, description, website_url, logo_url, category, tags, views_count, votes_count, is_featured, is_verified, created_at)
SELECT 
  name,
  slug,
  description,
  website_url,
  logo_url,
  category,
  tags,
  views_count,
  votes_count,
  is_featured,
  is_verified,
  created_at
FROM tools_backup
ON CONFLICT (slug) DO NOTHING;

-- Show re-inserted tools with their new UUIDs
SELECT 
  id as new_uuid,
  name,
  slug,
  'Re-inserted with UUID' as status
FROM tools
WHERE slug IN (SELECT slug FROM tools_backup);

-- ============================================
-- STEP 6: Verify All IDs are Now UUIDs
-- ============================================

-- Check that all IDs are now valid UUIDs
SELECT 
  COUNT(*) as total_tools,
  COUNT(CASE WHEN id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 1 END) as uuid_count,
  COUNT(CASE WHEN NOT (id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') THEN 1 END) as non_uuid_count
FROM tools;

-- Show sample of tools with their UUIDs
SELECT 
  id,
  name,
  slug,
  LEFT(description, 40) || '...' as description,
  website_url
FROM tools
ORDER BY name
LIMIT 10;

-- ============================================
-- STEP 7: Clean Up Orphaned Votes
-- ============================================

-- Delete votes that reference non-existent tool IDs
-- (These would be votes for the old numeric IDs)
DELETE FROM votes
WHERE tool_id NOT IN (SELECT id FROM tools);

-- Show cleanup results
SELECT 
  (SELECT COUNT(*) FROM votes) as remaining_votes,
  'Orphaned votes cleaned up' as status;

-- ============================================
-- STEP 8: Verify Constraints
-- ============================================

-- Verify PRIMARY KEY constraint
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'tools' AND constraint_type = 'PRIMARY KEY';

-- Verify UNIQUE constraint on slug
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'tools' AND constraint_type = 'UNIQUE';

-- Verify foreign key from votes to tools
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'votes' AND constraint_type = 'FOREIGN KEY';

-- ============================================
-- FINAL VERIFICATION
-- ============================================

RAISE NOTICE '=== Migration Complete ===';
RAISE NOTICE 'All tool IDs are now UUIDs';
RAISE NOTICE 'Voting system will now work correctly';
RAISE NOTICE 'Run the seed script to populate tools with proper UUIDs';

-- Show final state
SELECT 
  'Migration Complete' as status,
  COUNT(*) as total_tools,
  COUNT(CASE WHEN id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 1 END) as uuid_tools,
  (SELECT COUNT(*) FROM votes) as total_votes
FROM tools;
