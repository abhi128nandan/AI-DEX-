import { DatabaseTool } from '@/lib/database/schema';

/**
 * Tool type - matches database schema exactly
 * Use this type throughout the application
 */
export type Tool = DatabaseTool;

export type { ExtendedTool, Profile, Vote, Comment } from '@/lib/database/schema';
