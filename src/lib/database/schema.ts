/**
 * Database Schema Constants
 * 
 * This file defines the actual database schema based on supabase-schema.sql
 * Use these constants to ensure queries match the actual database structure
 */

// Tool fields that exist in the database
export const TOOL_FIELDS = [
  'id',
  'name',
  'slug',
  'description',
  'website_url',
  'logo_url',
  'category',
  'tags',
  'views_count',
  'votes_count',
  'is_featured',
  'is_verified',
  'created_at'
] as const;

// Type-safe field selector for Supabase queries
export const TOOL_SELECT = TOOL_FIELDS.join(', ');

/**
 * Database Tool Type
 * Matches the actual database schema exactly
 * Note: Supabase returns null for optional fields
 */
export interface DatabaseTool {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
  category: string;
  tags: string[] | null;
  views_count: number;
  votes_count: number;
  is_featured: boolean;
  is_verified: boolean;
  created_at: string;
}

/**
 * Validates that a tool object has all required database fields
 * Allows null for optional fields as returned by Supabase
 */
export function isValidTool(tool: any): tool is DatabaseTool {
  if (!tool || typeof tool !== 'object') return false;
  
  return (
    typeof tool.id === 'string' &&
    typeof tool.name === 'string' &&
    typeof tool.slug === 'string' &&
    (tool.description === null || typeof tool.description === 'string') &&
    (tool.website_url === null || typeof tool.website_url === 'string') &&
    (tool.logo_url === null || typeof tool.logo_url === 'string') &&
    typeof tool.category === 'string' &&
    (tool.tags === null || Array.isArray(tool.tags)) &&
    typeof tool.views_count === 'number' &&
    typeof tool.votes_count === 'number' &&
    typeof tool.is_featured === 'boolean' &&
    typeof tool.is_verified === 'boolean' &&
    typeof tool.created_at === 'string'
  );
}

/**
 * Safely validates and filters an array of tools
 * Removes any invalid tools and logs warnings
 */
export function validateTools(tools: any[]): DatabaseTool[] {
  if (!Array.isArray(tools)) {
    return [];
  }

  return tools
    .filter((tool) => {
      return isValidTool(tool);
    })
    .map(tool => ({
      ...tool,
      // Coerce null tags to empty array for consistent downstream usage
      tags: tool.tags ?? [],
    }));
}

/**
 * Profile fields that exist in the database
 */
export const PROFILE_FIELDS = [
  'id',
  'username',
  'avatar_url',
  'created_at'
] as const;

export const PROFILE_SELECT = PROFILE_FIELDS.join(', ');

/**
 * Vote fields that exist in the database
 */
export const VOTE_FIELDS = [
  'id',
  'user_id',
  'tool_id',
  'vote_type',
  'created_at'
] as const;

export const VOTE_SELECT = VOTE_FIELDS.join(', ');

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
