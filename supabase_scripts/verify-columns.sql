-- Verify that description and website_url columns exist in tools table
-- Run this in Supabase SQL Editor

-- Check table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'tools'
  AND column_name IN ('description', 'website_url')
ORDER BY ordinal_position;

-- Check for NULL values in these columns
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
  CASE 
    WHEN description IS NULL THEN 'NULL'
    WHEN description = '' THEN 'EMPTY'
    ELSE LEFT(description, 50) || '...'
  END as description_status,
  CASE 
    WHEN website_url IS NULL THEN 'NULL'
    WHEN website_url = '' THEN 'EMPTY'
    ELSE website_url
  END as website_url_status
FROM tools
LIMIT 10;
