-- Migration: Add slug column to tools table
-- Purpose: Fix schema mismatch where application code expects slug column but database doesn't have it
-- Date: 2026-04-25

-- STEP 1: Check current schema (for reference)
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'tools' 
-- ORDER BY ordinal_position;

-- STEP 2: Add slug column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tools' AND column_name = 'slug'
  ) THEN
    ALTER TABLE tools ADD COLUMN slug TEXT;
    RAISE NOTICE 'Added slug column to tools table';
  ELSE
    RAISE NOTICE 'slug column already exists';
  END IF;
END $$;

-- STEP 3: Populate slug for existing rows (generate from name)
UPDATE tools 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'),  -- Remove special chars
    '\s+', '-', 'g'  -- Replace spaces with hyphens
  )
)
WHERE slug IS NULL OR slug = '';

-- STEP 4: Add unique constraint (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'tools_slug_unique'
  ) THEN
    ALTER TABLE tools ADD CONSTRAINT tools_slug_unique UNIQUE (slug);
    RAISE NOTICE 'Added unique constraint on slug';
  ELSE
    RAISE NOTICE 'Unique constraint already exists';
  END IF;
END $$;

-- STEP 5: Set NOT NULL constraint
ALTER TABLE tools ALTER COLUMN slug SET NOT NULL;

-- STEP 6: Insert sample data if table is empty
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM tools LIMIT 1) THEN
    INSERT INTO tools (
      id, 
      name, 
      slug, 
      description, 
      website_url, 
      category, 
      tags,
      views_count,
      votes_count,
      is_featured,
      is_verified
    ) VALUES 
    (
      gen_random_uuid(), 
      'ChatGPT', 
      'chatgpt',
      'Advanced AI language model by OpenAI for natural conversations and content generation',
      'https://chat.openai.com',
      'productivity',
      ARRAY['ai', 'nlp', 'chatbot'],
      15000,
      250,
      true,
      true
    ),
    (
      gen_random_uuid(), 
      'Midjourney', 
      'midjourney',
      'AI-powered image generation tool that creates stunning artwork from text descriptions',
      'https://midjourney.com',
      'design',
      ARRAY['ai', 'image-generation', 'art'],
      12000,
      180,
      true,
      true
    ),
    (
      gen_random_uuid(), 
      'Gemini', 
      'gemini',
      'Google''s multimodal AI model for text, code, and image understanding',
      'https://gemini.google.com',
      'productivity',
      ARRAY['ai', 'google', 'multimodal'],
      10000,
      150,
      true,
      true
    ),
    (
      gen_random_uuid(), 
      'Claude', 
      'claude',
      'Anthropic''s AI assistant focused on being helpful, harmless, and honest',
      'https://claude.ai',
      'productivity',
      ARRAY['ai', 'assistant', 'chatbot'],
      8000,
      120,
      false,
      true
    ),
    (
      gen_random_uuid(), 
      'Stable Diffusion', 
      'stable-diffusion',
      'Open-source AI model for generating images from text descriptions',
      'https://stability.ai',
      'design',
      ARRAY['ai', 'image-generation', 'open-source'],
      9000,
      140,
      false,
      true
    );
    
    RAISE NOTICE 'Inserted sample tools data';
  ELSE
    RAISE NOTICE 'Tools table already has data, skipping sample insert';
  END IF;
END $$;

-- STEP 7: Ensure RLS is enabled and policies exist
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Allow public read" ON tools;
DROP POLICY IF EXISTS "Public tools are viewable by everyone." ON tools;

CREATE POLICY "Allow public read" 
  ON tools FOR SELECT 
  USING (true);

-- STEP 8: Create index on slug for performance
CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);

-- STEP 9: Verification query
SELECT 
  id, 
  name, 
  slug, 
  category,
  votes_count,
  views_count
FROM tools 
ORDER BY votes_count DESC
LIMIT 10;

-- Expected result: All rows should have non-null, unique slug values
