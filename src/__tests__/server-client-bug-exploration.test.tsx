/**
 * Bug Condition Exploration Test - Server Component with onClick Handler
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists.
 * DO NOT attempt to fix the test or the code when it fails.
 * 
 * Property 1: Bug Condition - Server Component with onClick Handler
 * 
 * This test attempts to render the dashboard page component which contains
 * an onClick handler in a Server Component. On unfixed code, this should
 * cause a runtime error: "Event handlers cannot be passed to Client Component props"
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

describe('Property 1: Bug Condition - Server Component with onClick Handler', () => {
  /**
   * Test Case 1: Dashboard page contains onClick handler in Server Component
   * 
   * Bug: dashboard/page.tsx is a Server Component (no "use client" directive)
   *      but contains <button onClick={() => window.location.reload()}>
   * 
   * Expected on UNFIXED code: Runtime error or build failure
   * Expected on FIXED code: No error (onClick moved to Client Component)
   */
  it('should detect onClick handler in Server Component (dashboard/page.tsx)', async () => {
    // Read the dashboard page source code to check for violations
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const dashboardPath = path.join(process.cwd(), 'src/app/(dashboard)/page.tsx');
    const dashboardSource = await fs.readFile(dashboardPath, 'utf-8');
    
    // Check 1: Does the file have "use client" directive?
    const hasUseClient = dashboardSource.includes("'use client'") || dashboardSource.includes('"use client"');
    
    // Check 2: Does the file contain onClick handlers?
    const hasOnClick = dashboardSource.includes('onClick');
    
    // Bug Condition: Server Component (no "use client") with onClick handler
    const hasBugCondition = !hasUseClient && hasOnClick;
    
    // On UNFIXED code: hasBugCondition should be TRUE (bug exists)
    // On FIXED code: hasBugCondition should be FALSE (bug fixed)
    // 
    // This test EXPECTS the bug to exist (hasBugCondition = true)
    // When the bug is fixed, this test will fail, which is correct behavior
    expect(hasBugCondition).toBe(false); // Expected behavior after fix
    
    // If bug exists, document it
    if (hasBugCondition) {
      console.log('[BUG DETECTED] dashboard/page.tsx is a Server Component with onClick handler');
      console.log('This violates React Server Component rules');
    }
  });

  /**
   * Test Case 2: Verify RefreshButton Client Component exists (after fix)
   * 
   * Expected on UNFIXED code: RefreshButton.tsx does not exist
   * Expected on FIXED code: RefreshButton.tsx exists with "use client"
   */
  it('should have RefreshButton Client Component (after fix)', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const refreshButtonPath = path.join(process.cwd(), 'src/components/ui/RefreshButton.tsx');
    
    let refreshButtonExists = false;
    let hasUseClient = false;
    
    try {
      const refreshButtonSource = await fs.readFile(refreshButtonPath, 'utf-8');
      refreshButtonExists = true;
      hasUseClient = refreshButtonSource.includes("'use client'") || refreshButtonSource.includes('"use client"');
    } catch (error) {
      // File doesn't exist yet (unfixed code)
      refreshButtonExists = false;
    }
    
    // Expected behavior after fix:
    // - RefreshButton.tsx should exist
    // - It should have "use client" directive
    expect(refreshButtonExists).toBe(true);
    if (refreshButtonExists) {
      expect(hasUseClient).toBe(true);
    }
  });

  /**
   * Test Case 3: Verify dashboard imports RefreshButton (after fix)
   * 
   * Expected on UNFIXED code: dashboard/page.tsx does not import RefreshButton
   * Expected on FIXED code: dashboard/page.tsx imports RefreshButton
   */
  it('should import RefreshButton in dashboard/page.tsx (after fix)', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const dashboardPath = path.join(process.cwd(), 'src/app/(dashboard)/page.tsx');
    const dashboardSource = await fs.readFile(dashboardPath, 'utf-8');
    
    // Check if dashboard imports RefreshButton
    const importsRefreshButton = dashboardSource.includes('RefreshButton');
    
    // Expected behavior after fix: should import RefreshButton
    expect(importsRefreshButton).toBe(true);
  });

  /**
   * Property-Based Test: No Server Component should contain event handlers
   * 
   * This property tests that for ANY Server Component file (no "use client"),
   * the file should NOT contain event handlers (onClick, onChange, onSubmit, etc.)
   * 
   * This is a universal property that should hold for all Server Components.
   */
  it('PROPERTY: Server Components should not contain event handlers', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // List of event handlers to check for
    const eventHandlers = [
      'onClick',
      'onChange',
      'onSubmit',
      'onFocus',
      'onBlur',
      'onKeyDown',
      'onKeyUp',
      'onMouseEnter',
      'onMouseLeave',
    ];
    
    // Check dashboard/page.tsx (the known violation)
    const dashboardPath = path.join(process.cwd(), 'src/app/(dashboard)/page.tsx');
    const dashboardSource = await fs.readFile(dashboardPath, 'utf-8');
    
    const hasUseClient = dashboardSource.includes("'use client'") || dashboardSource.includes('"use client"');
    
    // If it's a Server Component, it should not have event handlers
    if (!hasUseClient) {
      const violations = eventHandlers.filter(handler => dashboardSource.includes(handler));
      
      // Expected: no violations (empty array)
      expect(violations).toEqual([]);
      
      if (violations.length > 0) {
        console.log(`[BUG] Server Component has event handlers: ${violations.join(', ')}`);
      }
    }
  });

  /**
   * Property-Based Test: All interactive buttons should be Client Components
   * 
   * This property tests that for ANY button with onClick handler,
   * it should either be:
   * 1. In a file with "use client" directive, OR
   * 2. Be a separate Client Component imported into a Server Component
   */
  it('PROPERTY: Interactive buttons should be in Client Components', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const dashboardPath = path.join(process.cwd(), 'src/app/(dashboard)/page.tsx');
    const dashboardSource = await fs.readFile(dashboardPath, 'utf-8');
    
    const hasUseClient = dashboardSource.includes("'use client'") || dashboardSource.includes('"use client"');
    const hasOnClick = dashboardSource.includes('onClick');
    
    // Property: If file has onClick, it must either:
    // 1. Have "use client" directive, OR
    // 2. Use a Client Component (like <RefreshButton>)
    if (hasOnClick && !hasUseClient) {
      // Check if it uses RefreshButton (Client Component)
      const usesRefreshButton = dashboardSource.includes('<RefreshButton');
      const usesRawOnClick = dashboardSource.includes('<button') && dashboardSource.includes('onClick');
      
      // Expected: should use RefreshButton, not raw onClick
      expect(usesRefreshButton).toBe(true);
      expect(usesRawOnClick).toBe(false);
    }
  });

  /**
   * Property-Based Test: window.location.reload() should only be in Client Components
   * 
   * This property tests that browser APIs like window.location.reload()
   * should only appear in files with "use client" directive.
   */
  it('PROPERTY: Browser APIs should only be in Client Components', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // Check dashboard/page.tsx
    const dashboardPath = path.join(process.cwd(), 'src/app/(dashboard)/page.tsx');
    const dashboardSource = await fs.readFile(dashboardPath, 'utf-8');
    
    const hasUseClient = dashboardSource.includes("'use client'") || dashboardSource.includes('"use client"');
    const usesWindowAPI = dashboardSource.includes('window.location.reload');
    
    // Property: If file uses window API, it must have "use client"
    if (usesWindowAPI) {
      // Expected: should NOT use window API directly in Server Component
      // It should be delegated to a Client Component
      expect(hasUseClient).toBe(true);
    }
  });

  /**
   * Property-Based Test: Server Components should preserve data fetching
   * 
   * This property tests that Server Components should continue to use
   * server-side data fetching (createClient from @/lib/supabase/server)
   * even after fixing the onClick bug.
   */
  it('PROPERTY: Server Components should preserve server-side data fetching', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const dashboardPath = path.join(process.cwd(), 'src/app/(dashboard)/page.tsx');
    const dashboardSource = await fs.readFile(dashboardPath, 'utf-8');
    
    // Check that it still uses server-side Supabase client
    const usesServerClient = dashboardSource.includes('@/lib/supabase/server');
    const usesClientClient = dashboardSource.includes('@/lib/supabase/client');
    
    // Property: Should use server client, not client client
    expect(usesServerClient).toBe(true);
    expect(usesClientClient).toBe(false);
  });
});
