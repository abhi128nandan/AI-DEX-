import { DatabaseTool } from '@/lib/database/schema';

/**
 * Tool type - matches database schema exactly
 * Use this type throughout the application
 */
export type Tool = DatabaseTool;

/**
 * Extended Tool type for components that need additional computed fields
 * These fields don't exist in the database but may be added by the frontend
 */
export interface ExtendedTool extends DatabaseTool {
  // Add any computed/frontend-only fields here if needed
  // Example: displayName?: string;
}

export type Profile = {
  id: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
};

export type Vote = {
  id: string;
  user_id: string;
  tool_id: string;
  vote_type: 'up' | 'down';
  created_at: string;
};

export type Comment = {
  id: string;
  user_id: string;
  tool_id: string;
  content: string;
  created_at: string;
};
