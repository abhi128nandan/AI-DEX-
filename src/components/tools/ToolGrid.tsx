"use client";

import { useState, useEffect } from 'react';
import { Tool } from '@/types';
import ToolCard from './ToolCard';
import { getSupabaseClient } from '@/lib/supabase/client';

interface ToolGridProps {
  tools: Tool[];
  columns?: 2 | 3;
  isAuthenticated?: boolean;
  isSaved?: boolean;
}

/**
 * ToolGrid — Client wrapper that provides modal context to ToolCards.
 * Use this in server components that render tool lists.
 * Handles the ToolDetailModal state management.
 */
export default function ToolGrid({ tools: initialTools, columns = 3, isAuthenticated = false, isSaved }: ToolGridProps) {
  const [tools, setTools] = useState<Tool[]>(initialTools);

  useEffect(() => {
    setTools(initialTools);
  }, [initialTools]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    const channel = supabase.channel('public:tools')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tools' }, (payload: any) => {
        setTools(currentTools => 
          currentTools.map(tool => 
            tool.id === payload.new.id 
              ? { ...tool, votes_count: payload.new.votes_count } 
              : tool
          )
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <>
      <div className={`grid grid-cols-1 md:grid-cols-2 ${columns === 3 ? 'lg:grid-cols-3' : ''} gap-6`}>
        {tools.map((tool, i) => (
          <ToolCard key={tool.id} tool={tool} index={i} isAuthenticated={isAuthenticated} isSaved={isSaved} />
        ))}
      </div>
    </>
  );
}

