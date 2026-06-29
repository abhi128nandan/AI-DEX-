-- Auth rate limits table
-- Stores timestamps of auth actions per email to enforce server-restart-safe rate limiting.
-- Run this once in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email       text NOT NULL,
  action      text NOT NULL,
  created_at  timestamptz DEFAULT now() NOT NULL
);

-- Auto-delete records older than 1 hour to keep the table small
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_email_action_created
  ON public.auth_rate_limits (email, action, created_at DESC);

-- RLS: only service role can read/write (called from server-side admin client only)
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

-- No public access — admin client bypasses RLS
