"use client";

import { useCallback, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';

/**
 * Analytics Event Types — feeds ranking + trending systems
 */
export type AnalyticsEvent = 
  | 'tool_click'        // User clicks a tool card
  | 'tool_open'         // Tool panel opens (URL synced)
  | 'modal_open'        // Modal/panel opens for a tool
  | 'modal_close'       // Modal/panel closed
  | 'cta_click'         // "Visit Website" button clicked
  | 'category_click'    // Category selected in sidebar
  | 'search_query'      // User searches
  | 'vote_cast';        // User votes

interface AnalyticsPayload {
  event: AnalyticsEvent;
  tool_id?: string;
  tool_name?: string;
  category?: string;
  metadata?: Record<string, string | number | boolean>;
}

/**
 * useAnalytics — Lightweight event tracking hook.
 * 
 * Tracks user interactions and writes to Supabase `analytics_events` table.
 * Falls back gracefully if table doesn't exist.
 * Includes debounce to prevent duplicate rapid-fire events.
 */
export function useAnalytics() {
  const lastEvent = useRef<string>('');
  const lastTime = useRef<number>(0);

  const track = useCallback(async (payload: AnalyticsPayload) => {
    try {
      // Debounce: ignore identical events within 500ms
      const eventKey = `${payload.event}-${payload.tool_id || payload.category || ''}`;
      const now = Date.now();
      if (eventKey === lastEvent.current && now - lastTime.current < 500) {
        return;
      }
      lastEvent.current = eventKey;
      lastTime.current = now;

      // Get current user (optional — anonymous tracking ok)
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;

      // Fire-and-forget insert — don't block UI
      Promise.resolve(
        supabase
          .from('analytics_events')
          .insert({
            event_type: payload.event,
            user_id: userId,
            tool_id: payload.tool_id || null,
            tool_name: payload.tool_name || null,
            category: payload.category || null,
            metadata: payload.metadata || {},
            created_at: new Date().toISOString(),
          })
      ).catch(() => {
        // Table might not exist yet — that's fine
        // Analytics should never break the app
      });

      // Also update views_count on the tool if it's a click/modal_open
      if ((payload.event === 'tool_click' || payload.event === 'modal_open') && payload.tool_id) {
        Promise.resolve(supabase.rpc('increment_views', { tool_id_input: payload.tool_id })).catch(() => {});
      }

    } catch {
      // Analytics should NEVER crash the app
      console.debug('[Analytics] Event dropped:', payload.event);
    }
  }, []);

  return { track };
}

/**
 * Standalone track function for server components or non-hook contexts.
 * Use sparingly — prefer the hook version.
 */
export async function trackEvent(payload: AnalyticsPayload) {
  try {
    const supabase = getSupabaseClient();
    await supabase
      .from('analytics_events')
      .insert({
        event_type: payload.event,
        tool_id: payload.tool_id || null,
        tool_name: payload.tool_name || null,
        category: payload.category || null,
        metadata: payload.metadata || {},
        created_at: new Date().toISOString(),
      });
  } catch {
    // Silent fail
  }
}
