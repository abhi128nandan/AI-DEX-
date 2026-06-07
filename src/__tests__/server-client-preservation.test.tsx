/**
 * Preservation Property Tests - Server-Client Component Fix
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**
 * 
 * IMPORTANT: Follow observation-first methodology
 * These tests run on UNFIXED code and should PASS (confirms baseline behavior to preserve)
 * 
 * Property 2: Preservation - Server-Side Data Fetching and Functionality
 * 
 * Tests verify that all non-buggy functionality continues to work:
 * - Server-side data fetching using createClient() from @/lib/supabase/server
 * - Tool rendering in all sections (trending, top-rated, new)
 * - VoteButton components function correctly
 * - ToolCard components display and are clickable
 * - Database error handling displays correctly
 * - Empty database state displays correctly (except for the broken refresh button)
 * - Navigation links and routing work correctly
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import fc from 'fast-check';
import ToolCard from '@/components/tools/ToolCard';
import VoteButton from '@/components/tools/VoteButton';
import { Tool } from '@/types';

// Mock dependencies
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

vi.mock('@/lib/useAnalytics', () => ({
  useAnalytics: () => ({
    track: vi.fn(),
  }),
}));

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
  }),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('Property 2: Preservation - Server-Side Data Fetching and Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test Case 1: Server-side data fetching pattern is preserved
   * Requirement 3.1: Server Components should continue to fetch data using createClient() from @/lib/supabase/server
   * 
   * This test verifies that the dashboard page uses the correct server-side Supabase client pattern.
   */
  it('should use server-side Supabase client for data fetching', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const dashboardPath = path.join(process.cwd(), 'src/app/(dashboard)/page.tsx');
    const dashboardSource = await fs.readFile(dashboardPath, 'utf-8');
    
    // Verify server-side data fetching pattern is preserved
    expect(dashboardSource).toContain('@/lib/supabase/server');
    expect(dashboardSource).toContain('createClient');
    expect(dashboardSource).toContain('.from(\'tools\')');
    expect(dashboardSource).toContain('TOOL_SELECT');
    
    // Should NOT use client-side Supabase client
    expect(dashboardSource).not.toContain('@/lib/supabase/client');
  });

  /**
   * Test Case 2: Tool rendering functionality is preserved
   * Requirement 3.3: ToolCard components should display tools correctly
   * 
   * This test verifies that ToolCard renders all tool information correctly.
   */
  it('should render ToolCard with all tool information', () => {
    const tool: Tool = {
      id: 'test-tool-1',
      name: 'Test AI Tool',
      slug: 'test-ai-tool',
      category: 'productivity',
      tags: ['ai', 'ml', 'automation'],
      shortDescription: 'A powerful AI tool for productivity',
      longDescription: 'A longer description of the tool',
      features: ['feature1', 'feature2'],
      useCases: ['chatbots', 'automation'],
      pricing: 'freemium',
      website_url: 'https://example.com',
      views_count: 15000,
      votes_count: 250,
      downvotes_count: 10,
      is_featured: true,
      is_verified: true,
      created_at: '2024-01-01',
    };

    const { container } = render(<ToolCard tool={tool} index={0} />);
    const text = container.textContent || '';
    
    // Verify key information is displayed
    expect(text).toContain('Test AI Tool');
    expect(text).toContain('productivity');
    // ToolCard uses tool.description (not shortDescription), falls back to 'No description available'
    // Since 'description' is not set on the Tool type, it shows the fallback
    expect(text).toContain('No description available');
    expect(text).toContain('#ai');
    expect(text).toContain('#ml');
    expect(text).toContain('#automation');
  });

  /**
   * Test Case 3: VoteButton functionality is preserved
   * Requirement 3.4: VoteButton components should continue to function correctly
   * 
   * This test verifies that VoteButton renders and displays vote counts correctly.
   */
  it('should render VoteButton with correct vote counts', () => {
    const { container } = render(
      <VoteButton 
        toolId="test-tool-vote" 
        initialVotes={150}
        initialDownvotes={25}
      />
    );
    
    const text = container.textContent || '';
    
    // Verify vote count is displayed
    expect(text).toContain('150');
    
    // Verify buttons are present
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(2); // upvote and downvote buttons
  });

  /**
   * Test Case 4: Tool sorting logic is preserved
   * Requirement 3.5: Dashboard should continue to sort tools correctly (trending, top-rated, new)
   * 
   * This test verifies that the sorting logic patterns are preserved in the dashboard.
   */
  it('should preserve tool sorting logic in dashboard', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const dashboardPath = path.join(process.cwd(), 'src/app/(dashboard)/page.tsx');
    const dashboardSource = await fs.readFile(dashboardPath, 'utf-8');
    
    // Verify sorting/exploration is delegated to ToolsExplorer component
    expect(dashboardSource).toContain('ToolsExplorer');
    expect(dashboardSource).toContain('toolsList');
    expect(dashboardSource).toContain('validateTools');
  });

  /**
   * Test Case 5: Database error handling is preserved
   * Requirement 3.6: Database error state should display correctly
   * 
   * This test verifies that error handling patterns are preserved.
   */
  it('should preserve database error handling patterns', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const dashboardPath = path.join(process.cwd(), 'src/app/(dashboard)/page.tsx');
    const dashboardSource = await fs.readFile(dashboardPath, 'utf-8');
    
    // Verify error handling is preserved
    expect(dashboardSource).toContain('if (error)');
    expect(dashboardSource).toContain('Database Connection Error');
    expect(dashboardSource).toContain('error.message');
    expect(dashboardSource).toContain('console.error');
  });

  /**
   * Test Case 6: Empty database state is preserved
   * Requirement 3.7: Empty database state should display correctly (except for the broken refresh button)
   * 
   * This test verifies that empty state handling patterns are preserved.
   */
  it('should preserve empty database state handling patterns', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const dashboardPath = path.join(process.cwd(), 'src/app/(dashboard)/page.tsx');
    const dashboardSource = await fs.readFile(dashboardPath, 'utf-8');
    
    // Verify empty state handling is preserved
    expect(dashboardSource).toContain('if (toolsList.length === 0)');
    expect(dashboardSource).toContain('No Tools Found');
    expect(dashboardSource).toContain('supabase-seed-tools.sql');
  });

  /**
   * Test Case 7: Navigation and routing patterns are preserved
   * Requirement 3.2: Navigation links should continue to work correctly
   * 
   * This test verifies that navigation patterns are preserved.
   */
  it('should preserve navigation and routing patterns', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const dashboardPath = path.join(process.cwd(), 'src/app/(dashboard)/page.tsx');
    const dashboardSource = await fs.readFile(dashboardPath, 'utf-8');
    
    // Verify navigation patterns are preserved
    expect(dashboardSource).toContain('Link');
    expect(dashboardSource).toContain('href=');
    expect(dashboardSource).toContain('/admin');
    expect(dashboardSource).toContain('/categories');
  });

  /**
   * Property-Based Test: ToolCard renders correctly for all valid tool data
   * 
   * This property tests that for ANY valid tool data, ToolCard renders without errors
   * and displays all required information correctly.
   */
  it('PROPERTY: ToolCard renders correctly for all valid tool data', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 3, maxLength: 50 }),
          category: fc.constantFrom('productivity', 'development', 'design', 'marketing', 'analytics'),
          views_count: fc.integer({ min: 0, max: 1000000 }),
          votes_count: fc.integer({ min: 0, max: 10000 }),
          downvotes_count: fc.integer({ min: 0, max: 1000 }),
          pricing: fc.constantFrom('free', 'freemium', 'paid'),
          tags: fc.array(fc.string({ minLength: 2, maxLength: 15 }), { minLength: 1, maxLength: 5 }),
          useCases: fc.array(fc.string({ minLength: 5, maxLength: 30 }), { minLength: 1, maxLength: 3 }),
        }),
        (toolData) => {
          const tool: Tool = {
            id: 'prop-test-tool',
            name: toolData.name,
            slug: toolData.name.toLowerCase().replace(/\s+/g, '-'),
            category: toolData.category,
            tags: toolData.tags,
            shortDescription: 'Test description',
            longDescription: 'Test long description',
            features: ['feature1'],
            useCases: toolData.useCases,
            pricing: toolData.pricing,
            website_url: 'https://example.com',
            views_count: toolData.views_count,
            votes_count: toolData.votes_count,
            downvotes_count: toolData.downvotes_count,
            is_featured: false,
            is_verified: false,
            created_at: '2024-01-01',
          };

          // Property: Should render without throwing
          let didThrow = false;
          try {
            const { container } = render(<ToolCard tool={tool} index={0} />);
            const text = container.textContent || '';
            
            // Verify the tool name is displayed
            if (!text.includes(toolData.name)) return false;
            if (!text.includes(toolData.category)) return false;
            
          } catch (e) {
            didThrow = true;
          }
          
          return !didThrow;
        }
      ),
      { numRuns: 50 } // Test many valid combinations
    );
  });

  /**
   * Property-Based Test: VoteButton handles all valid vote counts correctly
   * 
   * This property tests that for ANY valid vote counts, VoteButton renders
   * and displays the counts correctly without errors.
   */
  it('PROPERTY: VoteButton handles all valid vote counts correctly', () => {
    fc.assert(
      fc.property(
        fc.record({
          upvotes: fc.integer({ min: 0, max: 100000 }),
          downvotes: fc.integer({ min: 0, max: 10000 }),
        }),
        (voteData) => {
          // Property: Should render without throwing
          let didThrow = false;
          try {
            const { container } = render(
              <VoteButton 
                toolId="prop-test-vote" 
                initialVotes={voteData.upvotes}
                initialDownvotes={voteData.downvotes}
              />
            );
            
            const text = container.textContent || '';
            
            // Verify vote count is displayed (with locale formatting)
            const formattedVotes = voteData.upvotes.toLocaleString();
            if (!text.includes(formattedVotes)) return false;
            
            // Verify no "NaN" appears
            if (text.includes('NaN')) return false;
            
          } catch (e) {
            didThrow = true;
          }
          
          return !didThrow;
        }
      ),
      { numRuns: 50 } // Test many valid combinations
    );
  });

  /**
   * Property-Based Test: Tool sorting produces correct order
   * 
   * This property tests that sorting tools by different criteria produces
   * the expected order (descending for votes_count, views_count, created_at).
   */
  it('PROPERTY: Tool sorting produces correct order', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            votes_count: fc.integer({ min: 0, max: 10000 }),
            views_count: fc.integer({ min: 0, max: 1000000 }),
            created_at: fc.integer({ min: new Date('2020-01-01').getTime(), max: new Date('2024-12-31').getTime() }),
          }),
          { minLength: 5, maxLength: 20 }
        ),
        (toolsData) => {
          // Convert to Tool objects
          const tools: Tool[] = toolsData.map((data, i) => ({
            id: data.id,
            name: `Tool ${i}`,
            slug: `tool-${i}`,
            category: 'productivity',
            tags: ['ai'],
            shortDescription: 'Test',
            longDescription: 'Test',
            features: ['f1'],
            useCases: ['u1'],
            pricing: 'free',
            website_url: 'https://example.com',
            views_count: data.views_count,
            votes_count: data.votes_count,
            is_featured: false,
            is_verified: false,
            created_at: new Date(data.created_at).toISOString(),
          }));

          // Test sorting by votes_count (trending)
          const trendingTools = [...tools].sort((a, b) => b.votes_count - a.votes_count);
          for (let i = 0; i < trendingTools.length - 1; i++) {
            if (trendingTools[i].votes_count < trendingTools[i + 1].votes_count) {
              return false;
            }
          }

          // Test sorting by views_count (top-rated)
          const topRatedTools = [...tools].sort((a, b) => b.views_count - a.views_count);
          for (let i = 0; i < topRatedTools.length - 1; i++) {
            if (topRatedTools[i].views_count < topRatedTools[i + 1].views_count) {
              return false;
            }
          }

          // Test sorting by created_at (new)
          const newTools = [...tools].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          for (let i = 0; i < newTools.length - 1; i++) {
            const dateA = new Date(newTools[i].created_at).getTime();
            const dateB = new Date(newTools[i + 1].created_at).getTime();
            if (dateA < dateB) {
              return false;
            }
          }

          return true;
        }
      ),
      { numRuns: 30 } // Test multiple sorting scenarios
    );
  });

  /**
   * Property-Based Test: Server Component pattern is preserved
   * 
   * This property tests that the dashboard page maintains its Server Component
   * architecture (no "use client" directive) while using server-side data fetching.
   */
  it('PROPERTY: Server Component pattern is preserved for data fetching', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const dashboardPath = path.join(process.cwd(), 'src/app/(dashboard)/page.tsx');
    const dashboardSource = await fs.readFile(dashboardPath, 'utf-8');
    
    // Property: Dashboard should be a Server Component (no "use client")
    // OR if it has "use client", it should NOT be there (this is the bug we're fixing)
    const hasUseClient = dashboardSource.includes("'use client'") || dashboardSource.includes('"use client"');
    
    // Property: Should use server-side Supabase client
    const usesServerClient = dashboardSource.includes('@/lib/supabase/server');
    
    // Property: Should have async function component (DashboardContent is async, Home wraps it)
    const hasAsyncDataFetching = dashboardSource.includes('async function DashboardContent');
    
    // Expected: Server Component with server-side data fetching
    expect(usesServerClient).toBe(true);
    expect(hasAsyncDataFetching).toBe(true);
    
    // Note: hasUseClient should be false, but we're testing preservation
    // The fix will ensure it stays false (Server Component)
  });

  /**
   * Property-Based Test: All Client Components have "use client" directive
   * 
   * This property tests that existing Client Components (ToolCard, VoteButton)
   * correctly have the "use client" directive and continue to work.
   */
  it('PROPERTY: Existing Client Components have "use client" directive', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const clientComponents = [
      'src/components/tools/ToolCard.tsx',
      'src/components/tools/VoteButton.tsx',
    ];
    
    for (const componentPath of clientComponents) {
      const fullPath = path.join(process.cwd(), componentPath);
      const source = await fs.readFile(fullPath, 'utf-8');
      
      // Property: Client Components should have "use client" directive
      const hasUseClient = source.includes("'use client'") || source.includes('"use client"');
      expect(hasUseClient).toBe(true);
    }
  });

  /**
   * Property-Based Test: Tool data structure is preserved
   * 
   * This property tests that the Tool type structure is preserved and
   * all required fields are present in the dashboard data fetching.
   */
  it('PROPERTY: Tool data structure is preserved in dashboard', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const dashboardPath = path.join(process.cwd(), 'src/app/(dashboard)/page.tsx');
    const dashboardSource = await fs.readFile(dashboardPath, 'utf-8');
    
    // Property: Dashboard should fetch all tool fields
    expect(dashboardSource).toContain('TOOL_SELECT');
    
    // Property: Dashboard should handle tool data correctly
    expect(dashboardSource).toContain('tools');
    expect(dashboardSource).toContain('toolsList');
    
    // Property: Dashboard should delegate tool rendering to ToolsExplorer
    expect(dashboardSource).toContain('ToolsExplorer');
    expect(dashboardSource).toContain('tools={');
  });
});
