-- Create the tool_comments table
CREATE TABLE IF NOT EXISTS public.tool_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.tool_comments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read comments
DROP POLICY IF EXISTS "Anyone can view comments" ON public.tool_comments;
CREATE POLICY "Anyone can view comments"
ON public.tool_comments
FOR SELECT
USING (true);

-- Allow authenticated users to insert their own comments
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.tool_comments;
CREATE POLICY "Authenticated users can insert comments"
ON public.tool_comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own comments
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.tool_comments;
CREATE POLICY "Users can delete their own comments"
ON public.tool_comments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

