-- Migration: Add description and website_url columns to tools table
-- This migration is IDEMPOTENT and safe to run multiple times
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Add columns if they don't exist
-- ============================================

-- Add description column (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tools' AND column_name = 'description'
  ) THEN
    ALTER TABLE tools ADD COLUMN description TEXT;
    RAISE NOTICE 'Added description column to tools table';
  ELSE
    RAISE NOTICE 'description column already exists in tools table';
  END IF;
END $$;

-- Add website_url column (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tools' AND column_name = 'website_url'
  ) THEN
    ALTER TABLE tools ADD COLUMN website_url TEXT;
    RAISE NOTICE 'Added website_url column to tools table';
  ELSE
    RAISE NOTICE 'website_url column already exists in tools table';
  END IF;
END $$;

-- ============================================
-- STEP 2: Update existing tools with missing data
-- ============================================

-- Update tools that have NULL description or website_url
-- This uses data from the seed script to fill in missing values

UPDATE tools SET 
  description = COALESCE(description, 'AI tool description'),
  website_url = CASE slug
    WHEN 'chatgpt' THEN 'https://chat.openai.com'
    WHEN 'claude' THEN 'https://claude.ai'
    WHEN 'midjourney' THEN 'https://midjourney.com'
    WHEN 'dall-e-3' THEN 'https://openai.com/dall-e-3'
    WHEN 'stable-diffusion' THEN 'https://stability.ai'
    WHEN 'github-copilot' THEN 'https://github.com/features/copilot'
    WHEN 'cursor' THEN 'https://cursor.sh'
    WHEN 'notion-ai' THEN 'https://notion.so'
    WHEN 'grammarly' THEN 'https://grammarly.com'
    WHEN 'jasper' THEN 'https://jasper.ai'
    WHEN 'copy-ai' THEN 'https://copy.ai'
    WHEN 'runway' THEN 'https://runwayml.com'
    WHEN 'synthesia' THEN 'https://synthesia.io'
    WHEN 'descript' THEN 'https://descript.com'
    WHEN 'elevenlabs' THEN 'https://elevenlabs.io'
    WHEN 'murf-ai' THEN 'https://murf.ai'
    WHEN 'perplexity' THEN 'https://perplexity.ai'
    WHEN 'consensus' THEN 'https://consensus.app'
    WHEN 'elicit' THEN 'https://elicit.org'
    WHEN 'otter-ai' THEN 'https://otter.ai'
    WHEN 'fireflies-ai' THEN 'https://fireflies.ai'
    WHEN 'tome' THEN 'https://tome.app'
    WHEN 'beautiful-ai' THEN 'https://beautiful.ai'
    WHEN 'canva-ai' THEN 'https://canva.com'
    WHEN 'adobe-firefly' THEN 'https://adobe.com'
    WHEN 'lensa-ai' THEN 'https://prisma-ai.com'
    WHEN 'replit-ghostwriter' THEN 'https://replit.com'
    WHEN 'tabnine' THEN 'https://tabnine.com'
    WHEN 'codeium' THEN 'https://codeium.com'
    WHEN 'phind' THEN 'https://phind.com'
    WHEN 'writesonic' THEN 'https://writesonic.com'
    WHEN 'rytr' THEN 'https://rytr.me'
    WHEN 'quillbot' THEN 'https://quillbot.com'
    WHEN 'wordtune' THEN 'https://wordtune.com'
    WHEN 'pictory' THEN 'https://pictory.ai'
    WHEN 'heygen' THEN 'https://heygen.com'
    WHEN 'fliki' THEN 'https://fliki.ai'
    WHEN 'soundraw' THEN 'https://soundraw.io'
    WHEN 'aiva' THEN 'https://aiva.ai'
    WHEN 'boomy' THEN 'https://boomy.com'
    WHEN 'krisp' THEN 'https://krisp.ai'
    WHEN 'cleanvoice' THEN 'https://cleanvoice.ai'
    WHEN 'podcastle' THEN 'https://podcastle.ai'
    WHEN 'lexica' THEN 'https://lexica.art'
    WHEN 'leonardo-ai' THEN 'https://leonardo.ai'
    WHEN 'playground-ai' THEN 'https://playgroundai.com'
    WHEN 'remove-bg' THEN 'https://remove.bg'
    WHEN 'cleanup-pictures' THEN 'https://cleanup.pictures'
    WHEN 'upscale-media' THEN 'https://upscale.media'
    WHEN 'looka' THEN 'https://looka.com'
    WHEN 'designs-ai' THEN 'https://designs.ai'
    WHEN 'gamma' THEN 'https://gamma.app'
    WHEN 'motion' THEN 'https://usemotion.com'
    WHEN 'reclaim-ai' THEN 'https://reclaim.ai'
    WHEN 'mem' THEN 'https://mem.ai'
    WHEN 'superhuman' THEN 'https://superhuman.com'
    WHEN 'gemini' THEN 'https://gemini.google.com'
    WHEN 'jasper-ai' THEN 'https://jasper.ai'
    WHEN 'writesonic' THEN 'https://writesonic.com'
    WHEN 'sora' THEN 'https://openai.com/sora'
    WHEN 'runway-gen-3' THEN 'https://runwayml.com'
    WHEN 'luma-dream-machine' THEN 'https://lumalabs.ai/dream-machine'
    WHEN 'vercel-v0' THEN 'https://v0.dev'
    WHEN 'replit-ai' THEN 'https://replit.com'
    WHEN 'bolt-new' THEN 'https://bolt.new'
    WHEN 'suno' THEN 'https://suno.com'
    WHEN 'udio' THEN 'https://udio.com'
    WHEN 'ideogram' THEN 'https://ideogram.ai'
    ELSE COALESCE(website_url, 'https://example.com')
  END
WHERE description IS NULL OR website_url IS NULL;

-- ============================================
-- STEP 3: Set NOT NULL constraints (optional)
-- ============================================

-- Only set NOT NULL if all existing rows have values
DO $$ 
BEGIN
  -- Check if any NULL values exist
  IF NOT EXISTS (SELECT 1 FROM tools WHERE description IS NULL) THEN
    ALTER TABLE tools ALTER COLUMN description SET NOT NULL;
    RAISE NOTICE 'Set description column to NOT NULL';
  ELSE
    RAISE NOTICE 'Cannot set description to NOT NULL - NULL values exist';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM tools WHERE website_url IS NULL) THEN
    ALTER TABLE tools ALTER COLUMN website_url SET NOT NULL;
    RAISE NOTICE 'Set website_url column to NOT NULL';
  ELSE
    RAISE NOTICE 'Cannot set website_url to NOT NULL - NULL values exist';
  END IF;
END $$;

-- ============================================
-- STEP 4: Verify migration
-- ============================================

-- Show column information
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'tools'
  AND column_name IN ('description', 'website_url')
ORDER BY ordinal_position;

-- Show count of NULL values
SELECT 
  COUNT(*) as total_tools,
  COUNT(description) as tools_with_description,
  COUNT(website_url) as tools_with_website_url,
  COUNT(*) - COUNT(description) as missing_description,
  COUNT(*) - COUNT(website_url) as missing_website_url
FROM tools;

-- Show sample data
SELECT 
  id,
  name,
  slug,
  LEFT(description, 50) || '...' as description_preview,
  website_url
FROM tools
LIMIT 10;

RAISE NOTICE 'Migration completed successfully!';
