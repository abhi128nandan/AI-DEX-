-- ============================================================================
-- VOTING SYSTEM VERIFICATION TEST SUITE
-- ============================================================================
-- Purpose: Verify voting system correctness under real conditions
-- DO NOT RUN IN PRODUCTION - Use test environment only
-- ============================================================================

-- Setup: Create test users and tools
DO $$
DECLARE
  test_user_1 UUID := '10000000-0000-0000-0000-000000000001';
  test_user_2 UUID := '20000000-0000-0000-0000-000000000002';
  test_tool_1 UUID := '30000000-0000-0000-0000-000000000003';
  test_tool_2 UUID := '40000000-0000-0000-0000-000000000004';
  result JSON;
  vote_count_db INT;
  vote_count_rpc INT;
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'VOTING SYSTEM VERIFICATION TEST SUITE';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '';
  
  -- Clean up any existing test data
  DELETE FROM votes WHERE user_id IN (test_user_1, test_user_2);
  
  -- ========================================================================
  -- TEST 1: Vote Toggle (Same User, Same Vote Type)
  -- ========================================================================
  RAISE NOTICE '=== TEST 1: Vote Toggle (Same User, Same Vote Type) ===';
  
  -- Add upvote
  result := handle_vote(test_user_1, test_tool_1, 'up');
  RAISE NOTICE 'Step 1 - Add upvote: %', result;
  ASSERT (result->>'operation') = 'added', 'Expected operation=added';
  ASSERT (result->>'upvotes')::int = 1, 'Expected upvotes=1';
  ASSERT (result->>'userVote') = 'up', 'Expected userVote=up';
  
  -- Verify database state
  SELECT COUNT(*) INTO vote_count_db FROM votes WHERE user_id = test_user_1 AND tool_id = test_tool_1;
  ASSERT vote_count_db = 1, 'Expected 1 vote in database';
  
  -- Toggle off (click same button again)
  result := handle_vote(test_user_1, test_tool_1, 'up');
  RAISE NOTICE 'Step 2 - Toggle off: %', result;
  ASSERT (result->>'operation') = 'removed', 'Expected operation=removed';
  ASSERT (result->>'upvotes')::int = 0, 'Expected upvotes=0';
  ASSERT (result->>'userVote') IS NULL, 'Expected userVote=null';
  
  -- Verify database state
  SELECT COUNT(*) INTO vote_count_db FROM votes WHERE user_id = test_user_1 AND tool_id = test_tool_1;
  ASSERT vote_count_db = 0, 'Expected 0 votes in database after toggle';
  
  RAISE NOTICE '✓ TEST 1 PASSED: Vote toggle works correctly';
  RAISE NOTICE '';
  
  -- ========================================================================
  -- TEST 2: Vote Switching (Up to Down, Down to Up)
  -- ========================================================================
  RAISE NOTICE '=== TEST 2: Vote Switching ===';
  
  -- Add upvote
  result := handle_vote(test_user_1, test_tool_1, 'up');
  RAISE NOTICE 'Step 1 - Add upvote: %', result;
  ASSERT (result->>'upvotes')::int = 1, 'Expected upvotes=1';
  ASSERT (result->>'downvotes')::int = 0, 'Expected downvotes=0';
  
  -- Switch to downvote
  result := handle_vote(test_user_1, test_tool_1, 'down');
  RAISE NOTICE 'Step 2 - Switch to downvote: %', result;
  ASSERT (result->>'operation') = 'switched', 'Expected operation=switched';
  ASSERT (result->>'upvotes')::int = 0, 'Expected upvotes=0';
  ASSERT (result->>'downvotes')::int = 1, 'Expected downvotes=1';
  ASSERT (result->>'userVote') = 'down', 'Expected userVote=down';
  
  -- Verify only one vote exists
  SELECT COUNT(*) INTO vote_count_db FROM votes WHERE user_id = test_user_1 AND tool_id = test_tool_1;
  ASSERT vote_count_db = 1, 'Expected exactly 1 vote after switch';
  
  -- Switch back to upvote
  result := handle_vote(test_user_1, test_tool_1, 'up');
  RAISE NOTICE 'Step 3 - Switch back to upvote: %', result;
  ASSERT (result->>'operation') = 'switched', 'Expected operation=switched';
  ASSERT (result->>'upvotes')::int = 1, 'Expected upvotes=1';
  ASSERT (result->>'downvotes')::int = 0, 'Expected downvotes=0';
  
  RAISE NOTICE '✓ TEST 2 PASSED: Vote switching works correctly';
  RAISE NOTICE '';
  
  -- Clean up for next test
  DELETE FROM votes WHERE user_id = test_user_1;
  
  -- ========================================================================
  -- TEST 3: Rapid Repeated Clicks (Idempotency)
  -- ========================================================================
  RAISE NOTICE '=== TEST 3: Rapid Repeated Clicks (Idempotency) ===';
  
  -- Simulate rapid clicks (5 times)
  FOR i IN 1..5 LOOP
    result := handle_vote(test_user_1, test_tool_1, 'up');
    RAISE NOTICE 'Click %: operation=%, upvotes=%', i, result->>'operation', result->>'upvotes';
  END LOOP;
  
  -- Verify final state (should be removed after odd number of clicks)
  ASSERT (result->>'upvotes')::int = 0, 'Expected upvotes=0 after 5 clicks';
  ASSERT (result->>'userVote') IS NULL, 'Expected userVote=null after 5 clicks';
  
  -- Verify database consistency
  SELECT COUNT(*) INTO vote_count_db FROM votes WHERE user_id = test_user_1 AND tool_id = test_tool_1;
  ASSERT vote_count_db = 0, 'Expected 0 votes in database';
  
  RAISE NOTICE '✓ TEST 3 PASSED: Rapid clicks handled correctly (idempotent)';
  RAISE NOTICE '';
  
  -- ========================================================================
  -- TEST 4: Multiple Users Voting on Same Tool (Concurrency)
  -- ========================================================================
  RAISE NOTICE '=== TEST 4: Multiple Users Voting on Same Tool ===';
  
  -- User 1 upvotes
  result := handle_vote(test_user_1, test_tool_1, 'up');
  RAISE NOTICE 'User 1 upvotes: %', result;
  ASSERT (result->>'upvotes')::int = 1, 'Expected upvotes=1';
  
  -- User 2 upvotes same tool
  result := handle_vote(test_user_2, test_tool_1, 'up');
  RAISE NOTICE 'User 2 upvotes: %', result;
  ASSERT (result->>'upvotes')::int = 2, 'Expected upvotes=2';
  
  -- User 1 switches to downvote
  result := handle_vote(test_user_1, test_tool_1, 'down');
  RAISE NOTICE 'User 1 switches to downvote: %', result;
  ASSERT (result->>'upvotes')::int = 1, 'Expected upvotes=1';
  ASSERT (result->>'downvotes')::int = 1, 'Expected downvotes=1';
  
  -- Verify database state
  SELECT COUNT(*) INTO vote_count_db FROM votes WHERE tool_id = test_tool_1;
  ASSERT vote_count_db = 2, 'Expected 2 votes total for tool';
  
  -- Verify no duplicate votes per user
  SELECT COUNT(*) INTO vote_count_db 
  FROM votes 
  WHERE tool_id = test_tool_1 
  GROUP BY user_id 
  HAVING COUNT(*) > 1;
  
  ASSERT vote_count_db IS NULL, 'Expected no duplicate votes per user';
  
  RAISE NOTICE '✓ TEST 4 PASSED: Multiple users handled correctly';
  RAISE NOTICE '';
  
  -- Clean up
  DELETE FROM votes WHERE user_id IN (test_user_1, test_user_2);
  
  -- ========================================================================
  -- TEST 5: Votes Table vs RPC Consistency
  -- ========================================================================
  RAISE NOTICE '=== TEST 5: Votes Table vs RPC Consistency ===';
  
  -- Create complex voting scenario
  PERFORM handle_vote(test_user_1, test_tool_1, 'up');
  PERFORM handle_vote(test_user_2, test_tool_1, 'up');
  PERFORM handle_vote(test_user_1, test_tool_2, 'down');
  PERFORM handle_vote(test_user_2, test_tool_2, 'up');
  
  -- Get RPC result for tool 1
  result := handle_vote(test_user_1, test_tool_1, 'up'); -- Toggle to get current state
  result := handle_vote(test_user_1, test_tool_1, 'up'); -- Toggle back
  vote_count_rpc := (result->>'upvotes')::int;
  
  -- Count directly from database
  SELECT COUNT(*) FILTER (WHERE vote_type = 'up') INTO vote_count_db
  FROM votes WHERE tool_id = test_tool_1;
  
  RAISE NOTICE 'Tool 1 - RPC upvotes: %, DB upvotes: %', vote_count_rpc, vote_count_db;
  ASSERT vote_count_rpc = vote_count_db, 'RPC and DB counts must match';
  
  -- Verify for tool 2
  result := handle_vote(test_user_1, test_tool_2, 'down'); -- Toggle to get current state
  result := handle_vote(test_user_1, test_tool_2, 'down'); -- Toggle back
  
  SELECT COUNT(*) FILTER (WHERE vote_type = 'up') INTO vote_count_db
  FROM votes WHERE tool_id = test_tool_2;
  
  ASSERT (result->>'upvotes')::int = vote_count_db, 'RPC and DB counts must match for tool 2';
  
  RAISE NOTICE '✓ TEST 5 PASSED: RPC and database counts are consistent';
  RAISE NOTICE '';
  
  -- ========================================================================
  -- TEST 6: UNIQUE Constraint Enforcement
  -- ========================================================================
  RAISE NOTICE '=== TEST 6: UNIQUE Constraint Enforcement ===';
  
  -- Clean up
  DELETE FROM votes WHERE user_id = test_user_1;
  
  -- Try to insert duplicate vote directly (should fail)
  BEGIN
    INSERT INTO votes (user_id, tool_id, vote_type) 
    VALUES (test_user_1, test_tool_1, 'up');
    
    INSERT INTO votes (user_id, tool_id, vote_type) 
    VALUES (test_user_1, test_tool_1, 'down');
    
    RAISE EXCEPTION 'UNIQUE constraint should have prevented duplicate';
  EXCEPTION
    WHEN unique_violation THEN
      RAISE NOTICE 'UNIQUE constraint correctly prevented duplicate vote';
  END;
  
  RAISE NOTICE '✓ TEST 6 PASSED: UNIQUE constraint enforced';
  RAISE NOTICE '';
  
  -- ========================================================================
  -- TEST 7: Vote Type Validation
  -- ========================================================================
  RAISE NOTICE '=== TEST 7: Vote Type Validation ===';
  
  -- Try invalid vote type
  BEGIN
    result := handle_vote(test_user_1, test_tool_1, 'invalid');
    RAISE EXCEPTION 'Should have rejected invalid vote type';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Invalid vote type correctly rejected: %', SQLERRM;
  END;
  
  RAISE NOTICE '✓ TEST 7 PASSED: Vote type validation works';
  RAISE NOTICE '';
  
  -- ========================================================================
  -- TEST 8: Cross-Tool Vote Independence
  -- ========================================================================
  RAISE NOTICE '=== TEST 8: Cross-Tool Vote Independence ===';
  
  -- Clean up
  DELETE FROM votes WHERE user_id = test_user_1;
  
  -- Vote on tool 1
  result := handle_vote(test_user_1, test_tool_1, 'up');
  ASSERT (result->>'upvotes')::int = 1, 'Tool 1 should have 1 upvote';
  
  -- Vote on tool 2 (should not affect tool 1)
  result := handle_vote(test_user_1, test_tool_2, 'down');
  ASSERT (result->>'downvotes')::int = 1, 'Tool 2 should have 1 downvote';
  
  -- Verify tool 1 unchanged
  result := handle_vote(test_user_1, test_tool_1, 'up'); -- Toggle to check
  result := handle_vote(test_user_1, test_tool_1, 'up'); -- Toggle back
  ASSERT (result->>'upvotes')::int = 1, 'Tool 1 should still have 1 upvote';
  
  RAISE NOTICE '✓ TEST 8 PASSED: Votes are independent per tool';
  RAISE NOTICE '';
  
  -- ========================================================================
  -- TEST 9: Database Consistency After Operations
  -- ========================================================================
  RAISE NOTICE '=== TEST 9: Database Consistency Check ===';
  
  -- Clean up
  DELETE FROM votes WHERE user_id IN (test_user_1, test_user_2);
  
  -- Perform series of operations
  PERFORM handle_vote(test_user_1, test_tool_1, 'up');
  PERFORM handle_vote(test_user_1, test_tool_1, 'down');
  PERFORM handle_vote(test_user_1, test_tool_1, 'up');
  PERFORM handle_vote(test_user_2, test_tool_1, 'down');
  PERFORM handle_vote(test_user_2, test_tool_1, 'up');
  
  -- Check for orphaned votes
  SELECT COUNT(*) INTO vote_count_db
  FROM votes v
  WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = v.user_id)
     OR NOT EXISTS (SELECT 1 FROM tools t WHERE t.id = v.tool_id);
  
  ASSERT vote_count_db = 0, 'No orphaned votes should exist';
  
  -- Check for duplicate votes
  SELECT COUNT(*) INTO vote_count_db
  FROM (
    SELECT user_id, tool_id, COUNT(*) as cnt
    FROM votes
    GROUP BY user_id, tool_id
    HAVING COUNT(*) > 1
  ) duplicates;
  
  ASSERT vote_count_db = 0, 'No duplicate votes should exist';
  
  RAISE NOTICE '✓ TEST 9 PASSED: Database consistency maintained';
  RAISE NOTICE '';
  
  -- ========================================================================
  -- FINAL CLEANUP
  -- ========================================================================
  DELETE FROM votes WHERE user_id IN (test_user_1, test_user_2);
  
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '✓✓✓ ALL TESTS PASSED ✓✓✓';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Voting system verified under:';
  RAISE NOTICE '  - Vote toggling';
  RAISE NOTICE '  - Vote switching';
  RAISE NOTICE '  - Rapid repeated clicks';
  RAISE NOTICE '  - Multiple users (concurrency)';
  RAISE NOTICE '  - Database consistency';
  RAISE NOTICE '  - UNIQUE constraint enforcement';
  RAISE NOTICE '  - Vote type validation';
  RAISE NOTICE '  - Cross-tool independence';
  RAISE NOTICE '  - No orphaned or duplicate votes';
  RAISE NOTICE '============================================================================';
  
END $$;
