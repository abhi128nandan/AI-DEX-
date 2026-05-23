'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { isValidUUID } from '@/lib/validation/uuid';

export interface UseVoteReturn {
  upvotes: number;
  downvotes: number;
  userVote: 'up' | 'down' | null;
  loading: boolean;
  error: string | null;
  handleVote: (e: React.MouseEvent, type: 'up' | 'down') => Promise<void>;
}

export function useVote(
  toolId: string,
  initialVotes: number,
  initialDownvotes: number
): UseVoteReturn {
  const router = useRouter();
  const [upvotes, setUpvotes] = useState(initialVotes || 0);
  const [downvotes, setDownvotes] = useState(initialDownvotes || 0);
  
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Sync local state with fresh server props
  useEffect(() => {
    setUpvotes(initialVotes || 0);
  }, [initialVotes]);

  useEffect(() => {
    setDownvotes(initialDownvotes || 0);
  }, [initialDownvotes]);

  // Synchronous flag to prevent race conditions on rapid clicks
  const isProcessing = useRef(false);

  useEffect(() => {
    // Check session and initialize user ID
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
      setUserId(session?.user?.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: any, session: any) => {
        setUserId(session?.user?.id ?? null);
        if (!session?.user?.id) {
          setUserVote(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleVote = async (e: React.MouseEvent, type: 'up' | 'down') => {
    e.preventDefault();
    e.stopPropagation();

    // Clear previous errors
    setError(null);

    // Check user is signed in
    if (!userId) {
      setError("Please sign in to vote");
      return;
    }

    // Light validation: Quick UUID format check
    if (!isValidUUID(toolId)) {
      console.error('[useVote] Invalid toolId format:', toolId);
      setError("Invalid tool ID. Please refresh the page.");
      return;
    }

    // Synchronous guard to prevent race conditions
    if (isProcessing.current) {
      return;
    }
    isProcessing.current = true;
    
    // Strict session isolation: fetch exactly at click
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;
    
    if (!currentUserId) {
      setError("Please sign in to vote");
      isProcessing.current = false;
      return;
    }

    // Optimistic update
    const previousUpvotes = upvotes;
    const previousDownvotes = downvotes;
    const previousUserVote = userVote;

    let newUpvotes = upvotes;
    let newDownvotes = downvotes;
    let newUserVote = userVote;

    // Calculate optimistic state
    if (type === 'up') {
      if (userVote === 'up') {
        newUpvotes = upvotes - 1;
        newUserVote = null;
      } else if (userVote === 'down') {
        newUpvotes = upvotes + 2;
        newDownvotes = downvotes - 1;
        newUserVote = 'up';
      } else {
        newUpvotes = upvotes + 1;
        newUserVote = 'up';
      }
    } else {
      if (userVote === 'down') {
        newUpvotes = upvotes + 1;
        newDownvotes = downvotes - 1;
        newUserVote = null;
      } else if (userVote === 'up') {
        newUpvotes = upvotes - 2;
        newDownvotes = downvotes + 1;
        newUserVote = 'down';
      } else {
        newUpvotes = upvotes - 1;
        newDownvotes = downvotes + 1;
        newUserVote = 'down';
      }
    }

    setUpvotes(newUpvotes);
    setDownvotes(newDownvotes);
    setUserVote(newUserVote);

    try {
      // Direct Supabase mutation
      const { error: updateError } = await supabase
        .from('tools')
        .update({ votes_count: newUpvotes })
        .eq('id', toolId);

      if (updateError) throw updateError;
    } catch (err: any) {
      console.error('[useVote] Vote failed:', err.message);
      
      // Revert optimistic update
      setUpvotes(previousUpvotes);
      setDownvotes(previousDownvotes);
      setUserVote(previousUserVote);
      
      setError(err.message || 'Failed to vote');
    } finally {
      isProcessing.current = false;
    }
  };

  return {
    upvotes,
    downvotes,
    userVote,
    loading: false,
    error,
    handleVote,
  };
}
