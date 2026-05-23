-- Test script for handle_vote RPC function
-- Run this in Supabase SQL Editor AFTER deploying the migration

-- Setup: Create test data
DO $$
DECLARE
  test_user_id UUID := '00000000-0000-0000-0000-000000000001';
  test_tool_id UUID := '00000000-0000-0000-0000-000000000002';
  result JSON;
BEGIN
  -- Clean up any existing test data
  DELETE FROM votes WHERE user_id = test_user_id;
  
  RAISE NOTICE '=== TEST 1: Add new upvote ===';
  result := handle_vote(test_user_id, test_tool_id, 'up');
  RAISE NOTICE 'Result: %', result;
  ASSERT (result->>'operation') = 'added', 'Expected operation=added';
  ASSERT (result->>'upvotes')::int = 1, 'Expected upvotes=1';
  ASSERT (result->>'downvotes')::int = 0, 'Expected downvotes=0';
  ASSERT (result->>'userVote') = 'up', 'Expected userVote=up';
  RAISE NOTICE '✓ Test 1 passed';
  
  RAISE NOTICE '=== TEST 2: Toggle off (remove vote) ===';
  result := handle_vote(test_user_id, test_tool_id, 'up');
  RAISE NOTICE 'Result: %', result;
  ASSERT (result->>'operation') = 'removed', 'Expected operation=removed';
  ASSERT (result->>'upvotes')::int = 0, 'Expected upvotes=0';
  ASSERT (result->>'downvotes')::int = 0, 'Expected downvotes=0';
  ASSERT (result->>'userVote') IS NULL, 'Expected userVote=null';
  RAISE NOTICE '✓ Test 2 passed';
  
  RAISE NOTICE '=== TEST 3: Add downvote ===';
  result := handle_vote(test_user_id, test_tool_id, 'down');
  RAISE NOTICE 'Result: %', result;
  ASSERT (result->>'operation') = 'added', 'Expected operation=added';
  ASSERT (result->>'upvotes')::int = 0, 'Expected upvotes=0';
  ASSERT (result->>'downvotes')::int = 1, 'Expected downvotes=1';
  ASSERT (result->>'userVote') = 'down', 'Expected userVote=down';
  RAISE NOTICE '✓ Test 3 passed';
  
  RAISE NOTICE '=== TEST 4: Switch from down to up ===';
  result := handle_vote(test_user_id, test_tool_id, 'up');
  RAISE NOTICE 'Result: %', result;
  ASSERT (result->>'operation') = 'switched', 'Expected operation=switched';
  ASSERT (result->>'upvotes')::int = 1, 'Expected upvotes=1';
  ASSERT (result->>'downvotes')::int = 0, 'Expected downvotes=0';
  ASSERT (result->>'userVote') = 'up', 'Expected userVote=up';
  RAISE NOTICE '✓ Test 4 passed';
  
  RAISE NOTICE '=== TEST 5: Verify no duplicate votes ===';
  -- Check that only one vote exists for this user/tool combination
  ASSERT (SELECT COUNT(*) FROM votes WHERE user_id = test_user_id AND tool_id = test_tool_id) = 1,
    'Expected exactly 1 vote record';
  RAISE NOTICE '✓ Test 5 passed';
  
  -- Clean up test data
  DELETE FROM votes WHERE user_id = test_user_id;
  
  RAISE NOTICE '=== ALL TESTS PASSED ===';
END $$;
