-- Production Seed Script: 80+ High-Quality AI Tools
-- IDEMPOTENT: Safe to run multiple times (uses ON CONFLICT DO NOTHING)
-- GOAL: Populate database with real, high-quality AI tools data
-- 
-- Features:
-- - 80+ real AI tools across all categories
-- - Complete data: name, slug, description, website_url, logo_url, category
-- - UUID generation via gen_random_uuid()
-- - Unique slugs with conflict handling
-- - Realistic vote counts and view counts
-- - Featured and verified flags for quality tools
--
-- Usage: Run this in Supabase SQL Editor

INSERT INTO tools (name, slug, description, website_url, logo_url, category, tags, views_count, votes_count, is_featured, is_verified, created_at)
VALUES
-- Writing & Content Creation (15 tools)
('ChatGPT', 'chatgpt', 'Conversational AI assistant by OpenAI for natural language tasks, writing, and problem-solving', 'https://chat.openai.com', 'https://logo.clearbit.com/openai.com', 'Writing', ARRAY['chatbot', 'writing', 'assistant'], 25420, 4847, true, true, NOW() - INTERVAL '180 days'),
('Claude', 'claude', 'Advanced AI assistant by Anthropic for complex reasoning, analysis, and long-form content', 'https://claude.ai', 'https://logo.clearbit.com/anthropic.com', 'Writing', ARRAY['chatbot', 'writing', 'analysis'], 18350, 3456, true, true, NOW() - INTERVAL '150 days'),
('Gemini', 'gemini', 'Google multimodal AI for conversations, coding, and creative tasks', 'https://gemini.google.com', 'https://logo.clearbit.com/google.com', 'Writing', ARRAY['chatbot', 'multimodal', 'google'], 22890, 4123, true, true, NOW() - INTERVAL '120 days'),
('Grammarly', 'grammarly', 'AI writing assistant for grammar, spelling, style, and tone improvements', 'https://grammarly.com', 'https://logo.clearbit.com/grammarly.com', 'Writing', ARRAY['grammar', 'editing', 'writing'], 21340, 3967, true, true, NOW() - INTERVAL '200 days'),
('Jasper', 'jasper', 'AI content creation platform for marketing copy, blog posts, and business writing', 'https://jasper.ai', 'https://logo.clearbit.com/jasper.ai', 'Writing', ARRAY['marketing', 'copywriting', 'content'], 12920, 2354, true, true, NOW() - INTERVAL '160 days'),
('Copy.ai', 'copy-ai', 'AI copywriting tool for marketing content, social media, and ad copy', 'https://copy.ai', 'https://logo.clearbit.com/copy.ai', 'Writing', ARRAY['copywriting', 'marketing', 'social'], 9650, 1823, true, true, NOW() - INTERVAL '140 days'),
('Writesonic', 'writesonic', 'AI writing assistant for articles, blog posts, ads, and product descriptions', 'https://writesonic.com', 'https://logo.clearbit.com/writesonic.com', 'Writing', ARRAY['writing', 'content', 'seo'], 7890, 1498, false, true, NOW() - INTERVAL '130 days'),
('Rytr', 'rytr', 'AI writing assistant for emails, blogs, social media, and creative content', 'https://rytr.me', 'https://logo.clearbit.com/rytr.me', 'Writing', ARRAY['writing', 'content', 'email'], 6560, 1276, false, true, NOW() - INTERVAL '110 days'),
('QuillBot', 'quillbot', 'AI paraphrasing, grammar checking, and summarization tool for writers', 'https://quillbot.com', 'https://logo.clearbit.com/quillbot.com', 'Writing', ARRAY['paraphrasing', 'grammar', 'summarization'], 13230, 2487, true, true, NOW() - INTERVAL '170 days'),
('Wordtune', 'wordtune', 'AI writing companion for rewriting, tone adjustment, and clarity improvements', 'https://wordtune.com', 'https://logo.clearbit.com/wordtune.com', 'Writing', ARRAY['rewriting', 'editing', 'clarity'], 8890, 1676, false, true, NOW() - INTERVAL '100 days'),
('Notion AI', 'notion-ai', 'AI writing assistant integrated into Notion for notes, docs, and wikis', 'https://notion.so', 'https://logo.clearbit.com/notion.so', 'Writing', ARRAY['productivity', 'notes', 'collaboration'], 15450, 2856, true, true, NOW() - INTERVAL '90 days'),
('Hemingway Editor', 'hemingway-editor', 'AI-powered writing tool for clarity, readability, and concise prose', 'https://hemingwayapp.com', 'https://logo.clearbit.com/hemingwayapp.com', 'Writing', ARRAY['editing', 'readability', 'clarity'], 5670, 1087, false, true, NOW() - INTERVAL '80 days'),
('ProWritingAid', 'prowritingaid', 'AI writing assistant for grammar, style, and in-depth writing reports', 'https://prowritingaid.com', 'https://logo.clearbit.com/prowritingaid.com', 'Writing', ARRAY['grammar', 'editing', 'style'], 7230, 1345, false, true, NOW() - INTERVAL '70 days'),
('Sudowrite', 'sudowrite', 'AI writing tool for fiction authors with story generation and editing', 'https://sudowrite.com', 'https://logo.clearbit.com/sudowrite.com', 'Writing', ARRAY['fiction', 'storytelling', 'creative'], 4890, 912, false, true, NOW() - INTERVAL '60 days'),
('Lex', 'lex', 'AI-powered word processor for writers with intelligent suggestions', 'https://lex.page', 'https://logo.clearbit.com/lex.page', 'Writing', ARRAY['word-processor', 'writing', 'ai'], 3450, 645, false, true, NOW() - INTERVAL '50 days'),

-- Image Generation & Design (20 tools)
('Midjourney', 'midjourney', 'AI art generator creating stunning, artistic images from text descriptions', 'https://midjourney.com', 'https://logo.clearbit.com/midjourney.com', 'Image Generation', ARRAY['art', 'image', 'creative'], 28920, 5421, true, true, NOW() - INTERVAL '190 days'),
('DALL-E 3', 'dall-e-3', 'OpenAI advanced image generation model with photorealistic and artistic capabilities', 'https://openai.com/dall-e-3', 'https://logo.clearbit.com/openai.com', 'Image Generation', ARRAY['image', 'art', 'photorealistic'], 19230, 3634, true, true, NOW() - INTERVAL '100 days'),
('Stable Diffusion', 'stable-diffusion', 'Open-source image generation model for creative artwork and customization', 'https://stability.ai', 'https://logo.clearbit.com/stability.ai', 'Image Generation', ARRAY['open-source', 'image', 'art'], 16540, 3089, true, true, NOW() - INTERVAL '180 days'),
('Canva AI', 'canva-ai', 'AI-powered design platform for graphics, presentations, and social media', 'https://canva.com', 'https://logo.clearbit.com/canva.com', 'Image Generation', ARRAY['design', 'graphics', 'templates'], 24650, 4589, true, true, NOW() - INTERVAL '210 days'),
('Adobe Firefly', 'adobe-firefly', 'Adobe generative AI for creative design, images, and text effects', 'https://adobe.com/products/firefly', 'https://logo.clearbit.com/adobe.com', 'Image Generation', ARRAY['adobe', 'design', 'creative'], 14890, 2812, true, true, NOW() - INTERVAL '110 days'),
('Leonardo.ai', 'leonardo-ai', 'AI image generation for game assets, concept art, and creative projects', 'https://leonardo.ai', 'https://logo.clearbit.com/leonardo.ai', 'Image Generation', ARRAY['game-art', 'concept', 'creative'], 9540, 1823, true, true, NOW() - INTERVAL '90 days'),
('Playground AI', 'playground-ai', 'AI image creation and editing playground with multiple models', 'https://playgroundai.com', 'https://logo.clearbit.com/playgroundai.com', 'Image Generation', ARRAY['image', 'editing', 'playground'], 7670, 1467, false, true, NOW() - INTERVAL '80 days'),
('Lexica', 'lexica', 'AI art search engine and Stable Diffusion image generation', 'https://lexica.art', 'https://logo.clearbit.com/lexica.art', 'Image Generation', ARRAY['search', 'stable-diffusion', 'art'], 10890, 2056, true, true, NOW() - INTERVAL '120 days'),
('Ideogram', 'ideogram', 'AI image generation with excellent text rendering capabilities', 'https://ideogram.ai', 'https://logo.clearbit.com/ideogram.ai', 'Image Generation', ARRAY['image', 'text', 'design'], 8230, 1545, true, true, NOW() - INTERVAL '60 days'),
('Lensa AI', 'lensa-ai', 'AI photo editor and magic avatar generator for portraits', 'https://prisma-ai.com/lensa', 'https://logo.clearbit.com/prisma-ai.com', 'Image Generation', ARRAY['photo', 'avatar', 'portrait'], 11760, 2223, false, true, NOW() - INTERVAL '130 days'),
('Remove.bg', 'remove-bg', 'AI background removal tool for images with one click', 'https://remove.bg', 'https://logo.clearbit.com/remove.bg', 'Image Generation', ARRAY['background-removal', 'editing', 'photo'], 15340, 2889, true, true, NOW() - INTERVAL '150 days'),
('Cleanup.pictures', 'cleanup-pictures', 'AI object removal and image cleanup tool for photo editing', 'https://cleanup.pictures', 'https://logo.clearbit.com/cleanup.pictures', 'Image Generation', ARRAY['editing', 'cleanup', 'photo'], 8780, 1656, false, true, NOW() - INTERVAL '70 days'),
('Upscale.media', 'upscale-media', 'AI image upscaling and enhancement for higher resolution', 'https://upscale.media', 'https://logo.clearbit.com/upscale.media', 'Image Generation', ARRAY['upscaling', 'enhancement', 'photo'], 7890, 1489, false, true, NOW() - INTERVAL '60 days'),
('Looka', 'looka', 'AI logo and brand identity generator for businesses', 'https://looka.com', 'https://logo.clearbit.com/looka.com', 'Image Generation', ARRAY['logo', 'branding', 'design'], 9230, 1745, false, true, NOW() - INTERVAL '100 days'),
('Designs.ai', 'designs-ai', 'AI design suite for logos, videos, mockups, and social media', 'https://designs.ai', 'https://logo.clearbit.com/designs.ai', 'Image Generation', ARRAY['design', 'logo', 'video'], 6560, 1256, false, true, NOW() - INTERVAL '50 days'),
('Photoleap', 'photoleap', 'AI photo editor with advanced editing and generation features', 'https://photoleapapp.com', 'https://logo.clearbit.com/photoleapapp.com', 'Image Generation', ARRAY['photo', 'editing', 'mobile'], 5670, 1067, false, true, NOW() - INTERVAL '40 days'),
('Artbreeder', 'artbreeder', 'AI image mixing and generation for portraits and landscapes', 'https://artbreeder.com', 'https://logo.clearbit.com/artbreeder.com', 'Image Generation', ARRAY['mixing', 'portraits', 'creative'], 6780, 1289, false, true, NOW() - INTERVAL '140 days'),
('NightCafe', 'nightcafe', 'AI art generator with multiple algorithms and community features', 'https://nightcafe.studio', 'https://logo.clearbit.com/nightcafe.studio', 'Image Generation', ARRAY['art', 'community', 'creative'], 7890, 1456, false, true, NOW() - INTERVAL '110 days'),
('Craiyon', 'craiyon', 'Free AI image generator (formerly DALL-E mini) for quick creations', 'https://craiyon.com', 'https://logo.clearbit.com/craiyon.com', 'Image Generation', ARRAY['free', 'image', 'quick'], 9340, 1765, false, true, NOW() - INTERVAL '120 days'),
('DreamStudio', 'dreamstudio', 'Stable Diffusion interface by Stability AI for image generation', 'https://dreamstudio.ai', 'https://logo.clearbit.com/stability.ai', 'Image Generation', ARRAY['stable-diffusion', 'image', 'art'], 8120, 1523, false, true, NOW() - INTERVAL '90 days'),

-- Video Generation & Editing (10 tools)
('Runway', 'runway', 'AI video editing and generation platform for creators and filmmakers', 'https://runwayml.com', 'https://logo.clearbit.com/runwayml.com', 'Video', ARRAY['video', 'editing', 'generation'], 14230, 2687, true, true, NOW() - INTERVAL '140 days'),
('Synthesia', 'synthesia', 'AI video generation with realistic avatars and voiceovers for training', 'https://synthesia.io', 'https://logo.clearbit.com/synthesia.io', 'Video', ARRAY['avatar', 'voiceover', 'training'], 10780, 2034, true, true, NOW() - INTERVAL '130 days'),
('Descript', 'descript', 'AI-powered audio and video editing with transcription and overdub', 'https://descript.com', 'https://logo.clearbit.com/descript.com', 'Video', ARRAY['editing', 'transcription', 'audio'], 12450, 2367, true, true, NOW() - INTERVAL '150 days'),
('Pictory', 'pictory', 'AI video creation from text, articles, and scripts with auto-editing', 'https://pictory.ai', 'https://logo.clearbit.com/pictory.ai', 'Video', ARRAY['text-to-video', 'editing', 'content'], 7670, 1445, false, true, NOW() - INTERVAL '80 days'),
('HeyGen', 'heygen', 'AI video generation with customizable avatars and multilingual support', 'https://heygen.com', 'https://logo.clearbit.com/heygen.com', 'Video', ARRAY['avatar', 'multilingual', 'video'], 9230, 1756, true, true, NOW() - INTERVAL '70 days'),
('Fliki', 'fliki', 'AI text-to-video and voiceover platform for content creators', 'https://fliki.ai', 'https://logo.clearbit.com/fliki.ai', 'Video', ARRAY['text-to-video', 'voiceover', 'content'], 6890, 1312, false, true, NOW() - INTERVAL '60 days'),
('Lumen5', 'lumen5', 'AI video creation platform for social media and marketing content', 'https://lumen5.com', 'https://logo.clearbit.com/lumen5.com', 'Video', ARRAY['social-media', 'marketing', 'video'], 8120, 1534, false, true, NOW() - INTERVAL '100 days'),
('InVideo', 'invideo', 'AI video editor with templates for marketing and social media', 'https://invideo.io', 'https://logo.clearbit.com/invideo.io', 'Video', ARRAY['templates', 'marketing', 'editing'], 7230, 1367, false, true, NOW() - INTERVAL '90 days'),
('Kapwing', 'kapwing', 'AI-powered video editor with collaboration and automation features', 'https://kapwing.com', 'https://logo.clearbit.com/kapwing.com', 'Video', ARRAY['collaboration', 'editing', 'automation'], 9890, 1876, false, true, NOW() - INTERVAL '110 days'),
('Opus Clip', 'opus-clip', 'AI video clipper that turns long videos into viral short clips', 'https://opus.pro', 'https://logo.clearbit.com/opus.pro', 'Video', ARRAY['clips', 'short-form', 'viral'], 6560, 1245, false, true, NOW() - INTERVAL '50 days'),

-- Code & Development (12 tools)
('GitHub Copilot', 'github-copilot', 'AI pair programmer that suggests code completions and entire functions', 'https://github.com/features/copilot', 'https://logo.clearbit.com/github.com', 'Code', ARRAY['coding', 'autocomplete', 'github'], 22780, 4324, true, true, NOW() - INTERVAL '200 days'),
('Cursor', 'cursor', 'AI-powered code editor built for productivity with GPT-4 integration', 'https://cursor.sh', 'https://logo.clearbit.com/cursor.sh', 'Code', ARRAY['editor', 'ide', 'gpt4'], 14870, 2876, true, true, NOW() - INTERVAL '120 days'),
('Tabnine', 'tabnine', 'AI code completion tool for multiple programming languages and IDEs', 'https://tabnine.com', 'https://logo.clearbit.com/tabnine.com', 'Code', ARRAY['autocomplete', 'multi-language', 'ide'], 9540, 1834, true, true, NOW() - INTERVAL '160 days'),
('Codeium', 'codeium', 'Free AI code completion and chat assistant for developers', 'https://codeium.com', 'https://logo.clearbit.com/codeium.com', 'Code', ARRAY['free', 'autocomplete', 'chat'], 8670, 1687, true, true, NOW() - INTERVAL '100 days'),
('Replit Ghostwriter', 'replit-ghostwriter', 'AI coding assistant integrated into Replit cloud IDE', 'https://replit.com/ai', 'https://logo.clearbit.com/replit.com', 'Code', ARRAY['cloud-ide', 'coding', 'collaboration'], 10890, 2056, true, true, NOW() - INTERVAL '130 days'),
('Amazon CodeWhisperer', 'amazon-codewhisperer', 'AI code generator by AWS for multiple programming languages', 'https://aws.amazon.com/codewhisperer', 'https://logo.clearbit.com/aws.amazon.com', 'Code', ARRAY['aws', 'autocomplete', 'enterprise'], 7230, 1367, false, true, NOW() - INTERVAL '90 days'),
('Phind', 'phind', 'AI search engine optimized for developers and technical queries', 'https://phind.com', 'https://logo.clearbit.com/phind.com', 'Code', ARRAY['search', 'developer', 'technical'], 9780, 1856, true, true, NOW() - INTERVAL '80 days'),
('Sourcegraph Cody', 'sourcegraph-cody', 'AI coding assistant that understands your entire codebase', 'https://sourcegraph.com/cody', 'https://logo.clearbit.com/sourcegraph.com', 'Code', ARRAY['codebase', 'assistant', 'enterprise'], 5670, 1067, false, true, NOW() - INTERVAL '60 days'),
('Pieces', 'pieces', 'AI-powered code snippet manager with context-aware suggestions', 'https://pieces.app', 'https://logo.clearbit.com/pieces.app', 'Code', ARRAY['snippets', 'productivity', 'organization'], 4890, 923, false, true, NOW() - INTERVAL '50 days'),
('Mintlify', 'mintlify', 'AI documentation writer for code with automatic generation', 'https://mintlify.com', 'https://logo.clearbit.com/mintlify.com', 'Code', ARRAY['documentation', 'automation', 'developer'], 6120, 1156, false, true, NOW() - INTERVAL '70 days'),
('v0 by Vercel', 'v0-by-vercel', 'AI-powered UI generation from text descriptions using React', 'https://v0.dev', 'https://logo.clearbit.com/vercel.com', 'Code', ARRAY['ui', 'react', 'generation'], 11230, 2134, true, true, NOW() - INTERVAL '40 days'),
('Bolt.new', 'bolt-new', 'AI full-stack web app builder that generates and deploys code', 'https://bolt.new', 'https://logo.clearbit.com/stackblitz.com', 'Code', ARRAY['full-stack', 'deployment', 'web-app'], 8890, 1689, true, true, NOW() - INTERVAL '30 days'),

-- Audio & Music (8 tools)
('ElevenLabs', 'elevenlabs', 'AI voice generation and cloning with natural speech synthesis', 'https://elevenlabs.io', 'https://logo.clearbit.com/elevenlabs.io', 'Audio', ARRAY['voice', 'speech', 'cloning'], 16230, 3045, true, true, NOW() - INTERVAL '110 days'),
('Murf AI', 'murf-ai', 'AI voiceover generator for professional audio content and videos', 'https://murf.ai', 'https://logo.clearbit.com/murf.ai', 'Audio', ARRAY['voiceover', 'professional', 'video'], 8670, 1634, true, true, NOW() - INTERVAL '100 days'),
('AIVA', 'aiva', 'AI music composition for soundtracks, scores, and background music', 'https://aiva.ai', 'https://logo.clearbit.com/aiva.ai', 'Audio', ARRAY['music', 'composition', 'soundtrack'], 6560, 1245, false, true, NOW() - INTERVAL '140 days'),
('Soundraw', 'soundraw', 'AI music generation for content creators with customization', 'https://soundraw.io', 'https://logo.clearbit.com/soundraw.io', 'Audio', ARRAY['music', 'generation', 'royalty-free'], 7120, 1367, false, true, NOW() - INTERVAL '80 days'),
('Boomy', 'boomy', 'AI music creation platform for instant songs and releases', 'https://boomy.com', 'https://logo.clearbit.com/boomy.com', 'Audio', ARRAY['music', 'creation', 'instant'], 5890, 1123, false, true, NOW() - INTERVAL '70 days'),
('Suno', 'suno', 'AI music generation from text prompts with vocals and instruments', 'https://suno.com', 'https://logo.clearbit.com/suno.com', 'Audio', ARRAY['music', 'vocals', 'generation'], 12340, 2345, true, true, NOW() - INTERVAL '50 days'),
('Udio', 'udio', 'AI music creation platform with high-quality audio generation', 'https://udio.com', 'https://logo.clearbit.com/udio.com', 'Audio', ARRAY['music', 'high-quality', 'creation'], 9780, 1856, true, true, NOW() - INTERVAL '40 days'),
('Krisp', 'krisp', 'AI noise cancellation for calls, recordings, and meetings', 'https://krisp.ai', 'https://logo.clearbit.com/krisp.ai', 'Audio', ARRAY['noise-cancellation', 'calls', 'meetings'], 10890, 2067, true, true, NOW() - INTERVAL '120 days'),

-- Productivity & Organization (10 tools)
('Notion AI', 'notion-ai-workspace', 'AI-powered workspace for notes, docs, wikis, and project management', 'https://notion.so/product/ai', 'https://logo.clearbit.com/notion.so', 'Productivity', ARRAY['workspace', 'notes', 'collaboration'], 18450, 3467, true, true, NOW() - INTERVAL '160 days'),
('Otter.ai', 'otter-ai', 'AI meeting transcription and note-taking assistant with real-time sync', 'https://otter.ai', 'https://logo.clearbit.com/otter.ai', 'Productivity', ARRAY['transcription', 'meetings', 'notes'], 13340, 2534, true, true, NOW() - INTERVAL '150 days'),
('Fireflies.ai', 'fireflies-ai', 'AI meeting recorder, transcription, and search across conversations', 'https://fireflies.ai', 'https://logo.clearbit.com/fireflies.ai', 'Productivity', ARRAY['meetings', 'transcription', 'search'], 11230, 2145, true, true, NOW() - INTERVAL '140 days'),
('Gamma', 'gamma', 'AI presentation and document creation platform with smart formatting', 'https://gamma.app', 'https://logo.clearbit.com/gamma.app', 'Productivity', ARRAY['presentations', 'documents', 'formatting'], 10120, 1923, true, true, NOW() - INTERVAL '90 days'),
('Motion', 'motion', 'AI calendar and task management for automatic scheduling', 'https://usemotion.com', 'https://logo.clearbit.com/usemotion.com', 'Productivity', ARRAY['calendar', 'tasks', 'scheduling'], 8890, 1689, true, true, NOW() - INTERVAL '100 days'),
('Reclaim.ai', 'reclaim-ai', 'AI calendar assistant for time management and habit scheduling', 'https://reclaim.ai', 'https://logo.clearbit.com/reclaim.ai', 'Productivity', ARRAY['calendar', 'time-management', 'habits'], 7670, 1456, false, true, NOW() - INTERVAL '80 days'),
('Mem', 'mem', 'AI-powered note-taking and knowledge management with smart search', 'https://mem.ai', 'https://logo.clearbit.com/mem.ai', 'Productivity', ARRAY['notes', 'knowledge', 'search'], 6890, 1312, false, true, NOW() - INTERVAL '70 days'),
('Superhuman', 'superhuman', 'AI-enhanced email client for productivity and inbox management', 'https://superhuman.com', 'https://logo.clearbit.com/superhuman.com', 'Productivity', ARRAY['email', 'productivity', 'inbox'], 12340, 2345, true, true, NOW() - INTERVAL '130 days'),
('Tome', 'tome', 'AI-powered presentation and storytelling platform with templates', 'https://tome.app', 'https://logo.clearbit.com/tome.app', 'Productivity', ARRAY['presentations', 'storytelling', 'templates'], 8120, 1534, false, true, NOW() - INTERVAL '60 days'),
('Beautiful.ai', 'beautiful-ai', 'AI presentation software with smart templates and design', 'https://beautiful.ai', 'https://logo.clearbit.com/beautiful.ai', 'Productivity', ARRAY['presentations', 'design', 'templates'], 7230, 1367, false, true, NOW() - INTERVAL '110 days'),

-- Research & Analysis (5 tools)
('Perplexity', 'perplexity', 'AI-powered search engine with cited sources and conversational answers', 'https://perplexity.ai', 'https://logo.clearbit.com/perplexity.ai', 'Research', ARRAY['search', 'citations', 'answers'], 17890, 3378, true, true, NOW() - INTERVAL '100 days'),
('Consensus', 'consensus', 'AI research assistant that searches and summarizes scientific papers', 'https://consensus.app', 'https://logo.clearbit.com/consensus.app', 'Research', ARRAY['research', 'papers', 'science'], 7560, 1434, true, true, NOW() - INTERVAL '90 days'),
('Elicit', 'elicit', 'AI research assistant for literature reviews and paper analysis', 'https://elicit.org', 'https://logo.clearbit.com/elicit.org', 'Research', ARRAY['research', 'literature', 'analysis'], 6890, 1312, false, true, NOW() - INTERVAL '80 days'),
('Scite', 'scite', 'AI tool for discovering and evaluating scientific articles with Smart Citations', 'https://scite.ai', 'https://logo.clearbit.com/scite.ai', 'Research', ARRAY['citations', 'research', 'evaluation'], 5670, 1078, false, true, NOW() - INTERVAL '70 days'),
('Semantic Scholar', 'semantic-scholar', 'AI-powered research tool for scientific literature by Allen Institute', 'https://semanticscholar.org', 'https://logo.clearbit.com/allenai.org', 'Research', ARRAY['research', 'papers', 'academic'], 8120, 1545, false, true, NOW() - INTERVAL '120 days')

ON CONFLICT (slug) DO NOTHING;

-- Verification Query
-- Run this after the INSERT to verify the data
SELECT 
  COUNT(*) as total_tools,
  COUNT(CASE WHEN is_featured THEN 1 END) as featured_tools,
  COUNT(CASE WHEN is_verified THEN 1 END) as verified_tools,
  COUNT(DISTINCT category) as categories
FROM tools;

-- Expected output:
-- total_tools: 80+
-- featured_tools: 30+
-- verified_tools: 80+
-- categories: 7 (Writing, Image Generation, Video, Code, Audio, Productivity, Research)

-- Show sample by category
SELECT 
  category,
  COUNT(*) as tool_count,
  ROUND(AVG(votes_count)) as avg_votes
FROM tools
GROUP BY category
ORDER BY tool_count DESC;
