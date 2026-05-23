-- Migration: Add atomic vote handling RPC function
-- This function performs vote operation + count calculation in ONE transaction
-- Prevents race conditions and ensures counts always match database reality
-- Run this in Supabase SQL Editor

-- Drop function if it exists (for idempotent migrations)
DROP FUNCTION IF EXISTS handle_vote(UUID, UUID, TEXT);

-- Create atomic vote RPC function
CREATE OR REPLACE FUNCTION handle_vote(
  p_user_id UUID,
  p_tool_id UUID,
  p_vote_type TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_vote TEXT;
  v_operation TEXT;
  v_upvotes INT;
  v_downvotes INT;
  v_user_vote TEXT;
BEGIN
  -- Validate vote_type
  IF p_vote_type NOT IN ('up', 'down') THEN
    RAISE EXCEPTION 'Invalid vote_type: %. Must be ''up'' or ''down''', p_vote_type;
  END IF;

  -- Check current vote status
  SELECT vote_type INTO v_existing_vote
  FROM votes
  WHERE user_id = p_user_id AND tool_id = p_tool_id;

  -- Perform atomic vote operation
  IF v_existing_vote IS NOT NULL AND v_existing_vote = p_vote_type THEN
    -- Same vote type - toggle off (DELETE)
    DELETE FROM votes
    WHERE user_id = p_user_id AND tool_id = p_tool_id;
    v_operation := 'removed';
  ELSE
    -- Different vote type or no vote - UPSERT
    INSERT INTO votes (user_id, tool_id, vote_type)
    VALUES (p_user_id, p_tool_id, p_vote_type)
    ON CONFLICT (user_id, tool_id)
    DO UPDATE SET vote_type = EXCLUDED.vote_type;
    
    IF v_existing_vote IS NULL THEN
      v_operation := 'added';
    ELSE
      v_operation := 'switched';
    END IF;
  END IF;

  -- Calculate counts atomically (within same transaction)
  SELECT 
    COUNT(*) FILTER (WHERE vote_type = 'up'),
    COUNT(*) FILTER (WHERE vote_type = 'down')
  INTO v_upvotes, v_downvotes
  FROM votes
  WHERE tool_id = p_tool_id;

  -- Get user's current vote status
  SELECT vote_type INTO v_user_vote
  FROM votes
  WHERE user_id = p_user_id AND tool_id = p_tool_id;

  -- Return result as JSON
  RETURN json_build_object(
    'upvotes', v_upvotes,
    'downvotes', v_downvotes,
    'userVote', v_user_vote,
    'operation', v_operation
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION handle_vote(UUID, UUID, TEXT) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION handle_vote(UUID, UUID, TEXT) IS 
'Atomically handles vote operations (add/switch/remove) and returns updated counts. 
All operations happen in a single transaction to prevent race conditions.';
