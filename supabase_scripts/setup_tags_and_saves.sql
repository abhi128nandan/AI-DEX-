-- 1. Populate tags array in tools table based on category
-- Ensure we don't overwrite existing non-null tags if they are valid, but the prompt says "Updates the tools table to populate the tags array... Ensure NO tool has a null tags array."
UPDATE tools
SET tags = CASE 
    WHEN category ILIKE '%Image%' OR category ILIKE '%Design%' OR category ILIKE '%Art%' THEN ARRAY['design', 'ai-art', 'creative']
    WHEN category ILIKE '%Code%' OR category ILIKE '%Development%' OR category ILIKE '%Programming%' THEN ARRAY['developer', 'programming', 'productivity']
    WHEN category ILIKE '%Writing%' OR category ILIKE '%Text%' OR category ILIKE '%Copy%' THEN ARRAY['writing', 'content', 'copywriting']
    WHEN category ILIKE '%Video%' OR category ILIKE '%Animation%' THEN ARRAY['video', 'animation', 'media']
    WHEN category ILIKE '%Audio%' OR category ILIKE '%Voice%' OR category ILIKE '%Music%' THEN ARRAY['audio', 'music', 'sound']
    WHEN category ILIKE '%Chat%' OR category ILIKE '%Bot%' OR category ILIKE '%Assistant%' THEN ARRAY['chatbot', 'assistant', 'ai']
    ELSE ARRAY['ai', 'productivity', 'tool']
END
WHERE tags IS NULL OR array_length(tags, 1) IS NULL OR tags = '{}';

-- 2. Create saved_tools table
CREATE TABLE IF NOT EXISTS saved_tools (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, tool_id)
);

-- 3. Enable RLS
ALTER TABLE saved_tools ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for saved_tools

-- Select policy
CREATE POLICY "Users can view their own saved tools" 
ON saved_tools FOR SELECT 
USING (auth.uid() = user_id);

-- Insert policy
CREATE POLICY "Users can save tools" 
ON saved_tools FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Delete policy
CREATE POLICY "Users can unsave tools" 
ON saved_tools FOR DELETE 
USING (auth.uid() = user_id);
