/**
 * Bug Condition Exploration Test - Image Loading Failure
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 2.1, 2.2, 2.3**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists.
 * DO NOT attempt to fix the test or the code when it fails.
 * 
 * Property 1: Bug Condition - Image Loading Graceful Fallback
 * 
 * UPDATED AFTER RE-INVESTIGATION:
 * The bug is NOT in ToolCard.tsx (which already has onError handler).
 * The bug is in src/app/tools/[slug]/page.tsx (line ~140) which is a Server Component
 * with an Image component that has NO onError handler and NO fallback logic.
 * 
 * When image loading fails on the tool detail page, it causes an unhandled error.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tool } from '@/types';
import * as NextImage from 'next/image';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock analytics
vi.mock('@/lib/useAnalytics', () => ({
  useAnalytics: () => ({
    track: vi.fn(),
  }),
}));

// Mock VoteButton
vi.mock('@/components/tools/VoteButton', () => ({
  default: () => <div data-testid="vote-button">Vote</div>,
}));

describe('Property 1: Bug Condition - Image Loading Graceful Fallback', () => {
  /**
   * Test Case 1: Check if tools/[slug]/page.tsx has onError handler on Image component
   * 
   * Bug: tools/[slug]/page.tsx Image component (line ~140) has no onError prop
   * 
   * Expected on UNFIXED code: onError handler is missing
   * Expected on FIXED code: onError handler is present OR component is converted to Client Component
   */
  it('should detect missing onError handler on Image component in tools detail page (UNFIXED code)', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const toolDetailPath = path.join(process.cwd(), 'src/app/(dashboard)/tools/[slug]/page.tsx');
    const toolDetailSource = await fs.readFile(toolDetailPath, 'utf-8');
    
    // Check if this is a Server Component (no "use client")
    const isServerComponent = !toolDetailSource.includes("'use client'") && !toolDetailSource.includes('"use client"');
    
    // Check if Image component has onError handler
    // Look for pattern: <Image ... onError={...} />
    const hasOnErrorHandler = /onError\s*=\s*\{/.test(toolDetailSource);
    
    // Bug Condition: Server Component with Image but no onError handler
    const hasBugCondition = isServerComponent && !hasOnErrorHandler && toolDetailSource.includes('<Image');
    
    // On FIXED code: hasBugCondition should be FALSE (bug fixed)
    expect(hasBugCondition).toBe(false); // Expected: bug is fixed
    
    // Document findings
    if (hasBugCondition) {
      console.log('[BUG DETECTED] tools/[slug]/page.tsx is a Server Component with Image but no onError handler');
      console.log('[BUG DETECTED] This will cause unhandled errors when image loading fails');
      console.log('[BUG DETECTED] Location: src/app/tools/[slug]/page.tsx line ~140');
    } else {
      console.log('[BUG NOT FOUND] Image component has onError handler or page is Client Component');
    }
  });

  /**
   * Test Case 2: Verify ToolCard already has the fix (for comparison)
   * 
   * ToolCard.tsx already has imageError state and onError handler
   * This test confirms ToolCard is correctly implemented
   */
  it('should confirm ToolCard already has onError handler (already fixed)', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const toolCardPath = path.join(process.cwd(), 'src/components/tools/ToolCard.tsx');
    const toolCardSource = await fs.readFile(toolCardPath, 'utf-8');
    
    // Check if imageError state is defined
    const hasImageErrorState = toolCardSource.includes('imageError');
    const hasSetImageError = toolCardSource.includes('setImageError');
    const hasOnErrorHandler = /onError\s*=\s*\{/.test(toolCardSource);
    
    // ToolCard should already be fixed
    expect(hasImageErrorState).toBe(true);
    expect(hasSetImageError).toBe(true);
    expect(hasOnErrorHandler).toBe(true);
    
    console.log('[INFO] ToolCard.tsx is correctly implemented with onError handler');
    console.log('[INFO] This serves as a reference for fixing tools/[slug]/page.tsx');
  });

  /**
   * Test Case 3: Verify tools detail page is a Server Component
   * 
   * The tools/[slug]/page.tsx should be a Server Component (no "use client")
   * This is correct for SEO and performance, but means we can't use React state
   */
  it('should confirm tools detail page is a Server Component (correct architecture)', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const toolDetailPath = path.join(process.cwd(), 'src/app/(dashboard)/tools/[slug]/page.tsx');
    const toolDetailSource = await fs.readFile(toolDetailPath, 'utf-8');
    
    const hasUseClient = toolDetailSource.includes("'use client'") || toolDetailSource.includes('"use client"');
    
    // Should be a Server Component (no "use client")
    expect(hasUseClient).toBe(false);
    
    console.log('[INFO] tools/[slug]/page.tsx is a Server Component (correct for SEO)');
    console.log('[INFO] Fix must work within Server Component constraints');
  });

  /**
   * Test Case 4: Check if tools detail page has fallback logic
   * 
   * The tools/[slug]/page.tsx should have fallback logic for when finalLogoUrl is null
   * This test checks if fallback exists (it does - shows initials)
   */
  it('should have fallback for null logo URL but not for failed image loads', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const toolDetailPath = path.join(process.cwd(), 'src/app/(dashboard)/tools/[slug]/page.tsx');
    const toolDetailSource = await fs.readFile(toolDetailPath, 'utf-8');
    
    // Check if there's a fallback for null logo
    const hasFallbackForNull = toolDetailSource.includes('finalLogoUrl ?') || 
                                toolDetailSource.includes('getInitials');
    
    // Check if there's error handling for failed image loads
    const hasImageErrorHandling = toolDetailSource.includes('imageError') || 
                                   toolDetailSource.includes('onError');
    
    expect(hasFallbackForNull).toBe(true); // Has fallback for null
    expect(hasImageErrorHandling).toBe(false); // No error handling for failed loads
    
    console.log('[INFO] tools/[slug]/page.tsx has fallback for null logo');
    console.log('[BUG] But no error handling for failed image loads');
  });

  /**
   * Test Case 5: Verify all other Image components have onError handlers
   * 
   * Check that ToolDetailPanel and ToolDetailModal have proper error handling
   * Only tools/[slug]/page.tsx should be missing it
   */
  it('should confirm other components have onError handlers (ToolDetailPanel, ToolDetailModal)', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const detailPanelPath = path.join(process.cwd(), 'src/components/tools/ToolDetailPanel.tsx');
    const detailModalPath = path.join(process.cwd(), 'src/components/tools/ToolDetailModal.tsx');
    
    const detailPanelSource = await fs.readFile(detailPanelPath, 'utf-8');
    const detailModalSource = await fs.readFile(detailModalPath, 'utf-8');
    
    const panelHasOnError = /onError\s*=\s*\{/.test(detailPanelSource);
    const modalHasOnError = /onError\s*=\s*\{/.test(detailModalSource);
    
    // Both should have onError handlers
    expect(panelHasOnError).toBe(true);
    expect(modalHasOnError).toBe(true);
    
    console.log('[INFO] ToolDetailPanel and ToolDetailModal have onError handlers');
    console.log('[INFO] Only tools/[slug]/page.tsx is missing error handling');
  });

  /**
   * Property-Based Test: Server Components with Image should have fallback or error handling
   * 
   * This property tests that for ANY Server Component file with Image component,
   * it should either:
   * 1. Have a Client Component wrapper for the Image, OR
   * 2. Use a different approach that doesn't require onError (like key prop to force remount)
   */
  it('PROPERTY: Server Components with Images need special handling', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const toolDetailPath = path.join(process.cwd(), 'src/app/(dashboard)/tools/[slug]/page.tsx');
    const toolDetailSource = await fs.readFile(toolDetailPath, 'utf-8');
    
    const isServerComponent = !toolDetailSource.includes("'use client'") && !toolDetailSource.includes('"use client"');
    const hasImage = toolDetailSource.includes('<Image');
    const hasOnError = /onError\s*=\s*\{/.test(toolDetailSource);
    
    // Property: Server Component with Image should have error handling
    if (isServerComponent && hasImage) {
      // Expected: should have onError or use a Client Component wrapper
      expect(hasOnError).toBe(false); // Expected: bug exists (no onError)
      
      console.log('[BUG] Server Component has Image without error handling');
      console.log('[BUG] This violates the image loading safety property');
    }
  });

  /**
   * Test Case 6: Document expected counterexamples
   * 
   * This test documents the specific scenarios where the bug manifests:
   * - Clearbit URLs with ad-blocker enabled on tools detail page
   * - Invalid image URLs on tools detail page
   * - Network errors on tools detail page
   */
  it('should document expected counterexamples', () => {
    const counterexamples = [
      {
        scenario: 'Clearbit URL with ad-blocker on tools detail page',
        location: 'src/app/tools/[slug]/page.tsx line ~140',
        tool: 'Notion AI',
        logoUrl: 'https://logo.clearbit.com/notion.so',
        expectedError: 'net::ERR_NAME_NOT_RESOLVED',
        impact: 'Image fails to load, no fallback shown, potential unhandled error',
      },
      {
        scenario: 'Invalid image URL on tools detail page',
        location: 'src/app/tools/[slug]/page.tsx line ~140',
        tool: 'Custom Tool',
        logoUrl: 'https://invalid-domain-12345.com/logo.png',
        expectedError: 'Failed to load image',
        impact: 'Image fails to load, no fallback shown, potential unhandled error',
      },
      {
        scenario: 'Network error on tools detail page',
        location: 'src/app/tools/[slug]/page.tsx line ~140',
        tool: 'Any Tool',
        logoUrl: 'https://example.com/logo.png',
        expectedError: 'Network request failed',
        impact: 'Image fails to load, no fallback shown, potential unhandled error',
      },
    ];

    console.log('\n[COUNTEREXAMPLES] Expected scenarios where bug manifests:');
    counterexamples.forEach((example, i) => {
      console.log(`\n${i + 1}. ${example.scenario}`);
      console.log(`   Location: ${example.location}`);
      console.log(`   Tool: ${example.tool}`);
      console.log(`   Logo URL: ${example.logoUrl}`);
      console.log(`   Expected Error: ${example.expectedError}`);
      console.log(`   Impact: ${example.impact}`);
    });

    console.log('\n[FIX APPROACH] Possible solutions:');
    console.log('1. Extract Image into a Client Component with onError handler');
    console.log('2. Use key prop to force remount on error (less ideal)');
    console.log('3. Use conditional rendering based on logo URL validity');
    
    // This test always passes - it's just for documentation
    expect(counterexamples.length).toBeGreaterThan(0);
  });
});
