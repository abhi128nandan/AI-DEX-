-- ============================================
-- SUPABASE SEED SCRIPT FOR TOOLS TABLE
-- ============================================
-- Run this in Supabase SQL Editor to populate the tools table
-- This script uses the seedTools data to create initial database records

-- IMPORTANT: This script will:
-- 1. Clear existing tools (if any)
-- 2. Insert sample tools with proper UUIDs
-- 3. Maintain all required fields

-- ============================================
-- STEP 1: Clear existing data (optional - comment out if you want to keep existing data)
-- ============================================
-- TRUNCATE TABLE tools CASCADE;

-- ============================================
-- STEP 2: Insert sample tools
-- ============================================

-- Writing Tools
INSERT INTO tools (
  id, name, slug, description, website_url, logo_url, category, tags,
  views_count, votes_count, is_featured, is_verified, created_at
) VALUES
(
  gen_random_uuid(),
  'ChatGPT',
  'chatgpt',
  'The industry-leading conversational AI model by OpenAI. Versatile for writing, coding, reasoning, and more.',
  'https://chat.openai.com',
  NULL,
  'Writing',
  ARRAY['chatbot', 'llm', 'openai', 'assistant'],
  14500,
  5200,
  true,
  true,
  NOW() - INTERVAL '100 days'
),
(
  gen_random_uuid(),
  'Claude',
  'claude',
  'Anthropic''s smartest AI assistant. Known for nuance, safety, and massive 200k token context windows.',
  'https://claude.ai',
  NULL,
  'Writing',
  ARRAY['llm', 'anthropic', 'context', 'chat'],
  11000,
  4100,
  true,
  true,
  NOW() - INTERVAL '30 days'
),
(
  gen_random_uuid(),
  'Gemini',
  'gemini',
  'Google DeepMind''s most capable multimodal AI. Combines text, image, and code understanding natively.',
  'https://gemini.google.com',
  NULL,
  'Writing',
  ARRAY['google', 'multimodal', 'llm', 'search'],
  13200,
  4600,
  true,
  true,
  NOW() - INTERVAL '10 days'
),
(
  gen_random_uuid(),
  'Jasper AI',
  'jasper-ai',
  'AI writing assistant designed for marketing copy, blogs, and social media content at scale.',
  'https://jasper.ai',
  NULL,
  'Writing',
  ARRAY['copywriting', 'marketing', 'content'],
  5400,
  1450,
  false,
  true,
  NOW() - INTERVAL '250 days'
),
(
  gen_random_uuid(),
  'Copy.ai',
  'copy-ai',
  'Go from blank to brilliant. Generate high-converting copy for ads, emails, and websites in seconds.',
  'https://copy.ai',
  NULL,
  'Writing',
  ARRAY['copywriting', 'ads', 'email'],
  4100,
  1100,
  false,
  true,
  NOW() - INTERVAL '200 days'
),
(
  gen_random_uuid(),
  'Writesonic',
  'writesonic',
  'AI writer that creates SEO-optimized, plagiarism-free content for blogs, ads, emails, and websites.',
  'https://writesonic.com',
  NULL,
  'Writing',
  ARRAY['seo', 'blog', 'content'],
  3800,
  980,
  false,
  false,
  NOW() - INTERVAL '180 days'
);

-- Image Generation Tools
INSERT INTO tools (
  id, name, slug, description, website_url, logo_url, category, tags,
  views_count, votes_count, is_featured, is_verified, created_at
) VALUES
(
  gen_random_uuid(),
  'Midjourney',
  'midjourney',
  'Incredible AI image generator accessible via Discord. Excels at artistic, realistic, and highly stylized imagery.',
  'https://midjourney.com',
  NULL,
  'Image Generation',
  ARRAY['image', 'art', 'generative', 'discord'],
  12000,
  4800,
  true,
  true,
  NOW() - INTERVAL '90 days'
),
(
  gen_random_uuid(),
  'DALL·E 3',
  'dalle-3',
  'OpenAI''s latest text-to-image model integrated directly into ChatGPT. Create stunning images from natural language.',
  'https://openai.com/dall-e-3',
  NULL,
  'Image Generation',
  ARRAY['image', 'openai', 'generation'],
  9800,
  3500,
  true,
  true,
  NOW() - INTERVAL '50 days'
),
(
  gen_random_uuid(),
  'Stable Diffusion',
  'stable-diffusion',
  'Open-source image generation model. Run locally or in the cloud with full control and customization.',
  'https://stability.ai',
  NULL,
  'Image Generation',
  ARRAY['image', 'open-source', 'generation'],
  8500,
  3200,
  true,
  true,
  NOW() - INTERVAL '120 days'
);

-- Code Tools
INSERT INTO tools (
  id, name, slug, description, website_url, logo_url, category, tags,
  views_count, votes_count, is_featured, is_verified, created_at
) VALUES
(
  gen_random_uuid(),
  'GitHub Copilot',
  'github-copilot',
  'AI pair programmer that suggests code and entire functions in real-time from your editor.',
  'https://github.com/features/copilot',
  NULL,
  'Code',
  ARRAY['code', 'github', 'autocomplete', 'ide'],
  10500,
  4200,
  true,
  true,
  NOW() - INTERVAL '60 days'
),
(
  gen_random_uuid(),
  'Cursor',
  'cursor',
  'AI-first code editor built on VS Code. Chat with your codebase, generate code, and refactor with AI.',
  'https://cursor.sh',
  NULL,
  'Code',
  ARRAY['code', 'editor', 'ide', 'ai'],
  7800,
  2900,
  true,
  true,
  NOW() - INTERVAL '40 days'
),
(
  gen_random_uuid(),
  'Replit',
  'replit',
  'Collaborative browser-based IDE with AI code generation. Build and deploy apps instantly.',
  'https://replit.com',
  NULL,
  'Code',
  ARRAY['code', 'ide', 'collaboration', 'deployment'],
  6200,
  2100,
  false,
  true,
  NOW() - INTERVAL '150 days'
);

-- Video Tools
INSERT INTO tools (
  id, name, slug, description, website_url, logo_url, category, tags,
  views_count, votes_count, is_featured, is_verified, created_at
) VALUES
(
  gen_random_uuid(),
  'Runway',
  'runway',
  'AI-powered video editing and generation. Create videos from text, images, or existing footage.',
  'https://runwayml.com',
  NULL,
  'Video',
  ARRAY['video', 'editing', 'generation', 'creative'],
  8900,
  3400,
  true,
  true,
  NOW() - INTERVAL '70 days'
),
(
  gen_random_uuid(),
  'Synthesia',
  'synthesia',
  'Create professional AI videos with avatars and voiceovers in minutes. No camera or crew needed.',
  'https://synthesia.io',
  NULL,
  'Video',
  ARRAY['video', 'avatar', 'voiceover', 'presentation'],
  5600,
  1800,
  false,
  true,
  NOW() - INTERVAL '110 days'
);

-- Productivity Tools
INSERT INTO tools (
  id, name, slug, description, website_url, logo_url, category, tags,
  views_count, votes_count, is_featured, is_verified, created_at
) VALUES
(
  gen_random_uuid(),
  'Notion AI',
  'notion-ai',
  'AI writing assistant built into Notion. Summarize, brainstorm, and write directly in your workspace.',
  'https://notion.so/product/ai',
  NULL,
  'Productivity',
  ARRAY['productivity', 'writing', 'workspace', 'notes'],
  9200,
  3600,
  true,
  true,
  NOW() - INTERVAL '80 days'
),
(
  gen_random_uuid(),
  'Otter.ai',
  'otter-ai',
  'AI meeting assistant that records audio, writes notes, and generates summaries automatically.',
  'https://otter.ai',
  NULL,
  'Productivity',
  ARRAY['transcription', 'meetings', 'notes', 'productivity'],
  6800,
  2400,
  false,
  true,
  NOW() - INTERVAL '130 days'
),
(
  gen_random_uuid(),
  'Grammarly',
  'grammarly',
  'AI writing assistant that checks grammar, spelling, and style. Improve your writing everywhere you type.',
  'https://grammarly.com',
  NULL,
  'Productivity',
  ARRAY['writing', 'grammar', 'editing', 'productivity'],
  11500,
  4400,
  true,
  true,
  NOW() - INTERVAL '300 days'
);

-- ============================================
-- STEP 3: Verify insertion
-- ============================================
SELECT 
  COUNT(*) as total_tools,
  COUNT(CASE WHEN is_featured THEN 1 END) as featured_tools,
  COUNT(CASE WHEN is_verified THEN 1 END) as verified_tools
FROM tools;

-- Show sample of inserted tools
SELECT id, name, slug, category, votes_count, is_featured, is_verified
FROM tools
ORDER BY votes_count DESC
LIMIT 10;

-- ============================================
-- NOTES:
-- ============================================
-- 1. All IDs are generated as UUIDs using gen_random_uuid()
-- 2. This ensures compatibility with the voting system
-- 3. You can add more tools by following the same pattern
-- 4. Make sure to update votes_count and views_count as needed
-- 5. The created_at timestamps are relative to NOW() for realistic data
