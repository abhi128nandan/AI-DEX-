/**
 * Admin Auth — Real Integration-Style Tests
 *
 * These tests mock the Supabase modules at the module level, then import
 * and call the real GET/POST route handlers. This means verifyAdmin() is
 * actually exercised — not a hand-rolled copy of it.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ─── Module-level mocks (must be before imports) ───────────────────────────
const { mockGetUser, mockFrom } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}));

vi.mock('@/lib/supabase/admin', () => {
  const queryBuilder: any = {};
  queryBuilder.select = vi.fn().mockReturnValue(queryBuilder);
  queryBuilder.eq = vi.fn().mockReturnValue(queryBuilder);
  queryBuilder.order = vi.fn().mockReturnValue(queryBuilder);
  queryBuilder.range = vi.fn().mockReturnValue(queryBuilder);
  queryBuilder.gte = vi.fn().mockReturnValue(queryBuilder);
  queryBuilder.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
  queryBuilder.then = function (resolve: any) {
    return Promise.resolve({ data: [], count: 10, error: null }).then(resolve);
  };

  return {
    createAdminClient: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(queryBuilder),
        insert: vi.fn().mockResolvedValue({ error: null }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
      auth: {
        admin: {
          generateLink: vi.fn().mockResolvedValue({
            data: { properties: { action_link: 'https://example.com/magic' } },
            error: null,
          }),
        },
      },
    }),
  };
});

// Import AFTER mocks are registered
import { GET } from '@/app/api/admin/tools/route';
// ───────────────────────────────────────────────────────────────────────────

function makeRequest(url = 'http://localhost/api/admin/tools') {
  return new NextRequest(url);
}

function mockAdminUser() {
  mockGetUser.mockResolvedValue({
    data: { user: { id: 'admin-id', email: 'admin@test.com' } },
    error: null,
  });
  mockFrom.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({
          data: { role: 'admin' },
          error: null,
        }),
      }),
    }),
  });
}

function mockRegularUser() {
  mockGetUser.mockResolvedValue({
    data: { user: { id: 'user-id', email: 'user@test.com' } },
    error: null,
  });
  mockFrom.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({
          data: { role: 'user' },
          error: null,
        }),
      }),
    }),
  });
}

function mockUnauthenticated() {
  mockGetUser.mockResolvedValue({
    data: { user: null },
    error: { message: 'Not authenticated' },
  });
}

function mockMissingProfile() {
  mockGetUser.mockResolvedValue({
    data: { user: { id: 'no-profile-id', email: 'ghost@test.com' } },
    error: null,
  });
  mockFrom.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    }),
  });
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('GET /api/admin/tools — verifyAdmin via real route handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 403 for unauthenticated requests', async () => {
    mockUnauthenticated();
    const res = await GET(makeRequest());
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('returns 403 for authenticated non-admin users', async () => {
    mockRegularUser();
    const res = await GET(makeRequest());
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('returns 403 when user has no profile row', async () => {
    mockMissingProfile();
    const res = await GET(makeRequest());
    expect(res.status).toBe(403);
  });

  it('returns 200 for authenticated admin users', async () => {
    mockAdminUser();
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it('returns 403 when profile query returns a DB error', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'err-id', email: 'err@test.com' } },
      error: null,
    });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'DB connection lost' },
          }),
        }),
      }),
    });
    const res = await GET(makeRequest());
    expect(res.status).toBe(403);
  });

  it('returns 200 with paginated data structure for admin', async () => {
    mockAdminUser();
    const res = await GET(makeRequest('http://localhost/api/admin/tools?page=1&limit=10'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('success', true);
  });
});
