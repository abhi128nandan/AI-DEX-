"use client";

import { useEffect } from 'react';
import { Tool } from '@/types';

export default function RecentlyViewedTracker({ tool }: { tool: Tool }) {
  useEffect(() => {
    if (!tool) return;
    try {
      const stored = localStorage.getItem('recentlyViewedTools');
      let history: Tool[] = stored ? JSON.parse(stored) : [];
      
      // Remove if it already exists to move it to the front
      history = history.filter(t => t.id !== tool.id);
      
      // Prepend to front
      history.unshift(tool);
      
      // Cap at 10 items
      if (history.length > 10) {
        history = history.slice(0, 10);
      }
      
      localStorage.setItem('recentlyViewedTools', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to track recently viewed tools', e);
    }
  }, [tool]);

  return null;
}
