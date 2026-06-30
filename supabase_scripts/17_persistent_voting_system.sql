-- Migration: 17_persistent_voting_system.sql
-- Goal: Reset tools.votes_count to the TRUE number of user votes in the `votes` table.
-- This wipes out any seeded/mock data that was artificially inflating the vote counts,
-- ensuring that the database is the absolute single source of truth for all users.

-- 1. Sync tools.votes_count with the actual upvotes in the votes table.
UPDATE public.tools t
SET votes_count = (
  SELECT COUNT(*)
  FROM public.votes v
  WHERE v.tool_id = t.id AND v.vote_type = 'up'
);

-- Note: The handle_vote RPC function already calculates and updates the true votes_count 
-- whenever a user casts a vote. By running this script, we synchronize the initial 
-- state to match reality (removing the mock data), allowing the RPC to work flawlessly.
