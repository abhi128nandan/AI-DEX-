/**
 * Tool Categories and Counts
 * 
 * This file contains category definitions used across the application.
 * The actual tool data comes from Supabase.
 */

export const CATEGORIES = [
  'Writing',
  'Image Generation',
  'Video',
  'Audio',
  'Code',
  'Productivity',
  'Research',
  'Design',
  'Marketing',
  'Data',
  'Other'
];

export type Category = typeof CATEGORIES[number];

/**
 * Category counts - these are approximate and should be
 * dynamically fetched from Supabase in production
 */
export const CATEGORY_COUNTS: Record<string, number> = {
  'Writing': 6,
  'Image Generation': 5,
  'Video': 4,
  'Audio': 3,
  'Code': 5,
  'Productivity': 4,
  'Research': 3,
  'Design': 3,
  'Marketing': 2,
  'Data': 2,
  'Other': 1
};
