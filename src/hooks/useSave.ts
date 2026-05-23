'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { isValidUUID } from '@/lib/validation/uuid';

export function useSave(toolId: string, initialIsSaved: boolean) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  const isProcessing = useRef(false);

  useEffect(() => {
    setIsSaved(initialIsSaved);
  }, [initialIsSaved]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
      setUserId(session?.user?.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: string, session: any) => {
        setUserId(session?.user?.id ?? null);
        if (!session?.user?.id) {
          setIsSaved(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setError(null);

    if (!userId) {
      setError("Please sign in to save tools");
      return;
    }

    if (!isValidUUID(toolId)) {
      setError("Invalid tool ID.");
      return;
    }

    if (isProcessing.current) return;
    isProcessing.current = true;
    
    // Strict session isolation: fetch exactly at click
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
      setError("Please sign in to save tools");
      isProcessing.current = false;
      return;
    }

    const previousIsSaved = isSaved;
    
    // We update local state optimistically
    setIsSaved(!previousIsSaved);

    try {
      if (previousIsSaved) {
        // If it was saved, we DELETE
        const { error: deleteError } = await supabase
          .from('saved_tools')
          .delete()
          .match({ user_id: currentUserId, tool_id: toolId });
        if (deleteError) throw deleteError;
      } else {
        // If it was not saved, we INSERT
        const { error: insertError } = await supabase
          .from('saved_tools')
          .insert({ user_id: currentUserId, tool_id: toolId });
        if (insertError) throw insertError;
      }
    } catch (err: any) {
      console.error('[useSave] Save failed:', err.message);
      setIsSaved(previousIsSaved);
      setError(err.message || 'Failed to save tool');
    } finally {
      isProcessing.current = false;
    }
  };

  return {
    isSaved,
    loading: false,
    error,
    handleSave,
  };
}
