# AI-DEX 🤖

A community-driven platform for discovering, voting on, and submitting AI tools.
Built as a modern "Product Hunt for AI" with a glassmorphic UI, server-side search,
and real-time interactions powered by Supabase.

## Tech stack

- **Framework:** Next.js 16 (App Router, Server Components)
- **UI:** React 19, Tailwind CSS v4, Framer Motion, Radix UI, Lucide React
- **Backend:** Supabase (PostgreSQL + Row Level Security + Auth)
- **Email:** Resend (with Supabase native fallback)
- **Data fetching:** TanStack Query v5
- **Testing:** Vitest, React Testing Library, Fast-Check

## Features

- Tool discovery explorer with client-side filtering and server-side full-text search
- Community voting (upvote / downvote) with atomic database RPC
- Bookmarking, comments, and tool submission
- Admin moderation dashboard (approve / reject submissions)
- Glassmorphic dark UI with Framer Motion animations

---

## Local development setup

### 1. Prerequisites

- Node.js >= 18
- A [Supabase](https://supabase.com/) project (free tier is fine)
- A [Resend](https://resend.com/) account (required for email verification)

### 2. Clone and install

```bash
git clone https://github.com/abhi128nandan/AI-DEX-.git
cd AI-DEX-
npm install
```

### 3. Environment variables

Create a `.env.local` file in the root directory:

```env
# Supabase — get from: Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase service role — ⚠️ NEVER commit the real value, keep server-side only
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Your app URL (use localhost for dev, your domain for production)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Resend — get from: resend.com → API Keys
RESEND_API_KEY=your-resend-api-key

# The "from" address shown in emails (must match a verified Resend domain)
EMAIL_FROM=AI-DEX <noreply@yourdomain.com>
```

> **Note on SUPABASE_SERVICE_ROLE_KEY:** This key bypasses all Row Level Security.
> Never expose it in the browser. Never commit it to git. Treat it like a database root password.

### 4. Set up the database

Go to **Supabase Dashboard → SQL Editor** and run these files in order.
Each file is in the `supabase_scripts/` folder. Paste the contents and click Run.
Wait for "Success" before running the next one.

| Step | File | What it does |
|------|------|-------------|
| 1 | `supabase-schema.sql` | Creates all base tables (tools, profiles, votes) |
| 2 | `supabase-production-fixes.sql` | Adds role column, fixes user trigger |
| 3 | `migration-add-description-website-url.sql` | Adds website_url + description columns |
| 4 | `migration-add-username-support.sql` | Username handling in profiles |
| 5 | `supabase-migration-add-slug.sql` | Adds slug column for tool URLs |
| 6 | `migration-fix-tool-id-types.sql` | Ensures UUID types throughout |
| 7 | `migration-phase1-search.sql` | GIN index for full-text search |
| 8 | `supabase-migration-handle-vote.sql` | Atomic handle_vote() RPC function |
| 9 | `setup-auth-rate-limits.sql` | Rate limiting table for auth emails |
| 10 | `setup_comments.sql` | Comments table with RLS |
| 11 | `setup_tags_and_saves.sql` | Tags and bookmarks tables |
| 12 | `database-indexes.sql` | Performance indexes |
| 13 | `fix-rls-policies.sql` | Correct public read policy on tools |
| 14 | `seed-ai-tools-production.sql` | Seed data — run last |

> **Do NOT run** the files starting with `test-`, `verify-`, or `VOTING-VERIFICATION` —
> those are development utilities. Use `seed-ai-tools-production.sql` (not the other seed files).

### 5. Make yourself an admin

After registering your account, run this in the Supabase SQL Editor:

```sql
-- Find your user ID
SELECT id, email FROM auth.users WHERE email = 'your@email.com';

-- Set admin role (paste your UUID from above)
UPDATE profiles SET role = 'admin' WHERE id = 'your-user-uuid';
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to production

### 1. Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. In **Settings → Environment Variables**, add all 6 variables from the table below:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` |
| `RESEND_API_KEY` | Your Resend API key |
| `EMAIL_FROM` | `AI-DEX <noreply@yourdomain.com>` |

4. Deploy

### 2. Supabase auth settings

In **Supabase Dashboard → Authentication → URL Configuration**:

- **Site URL:** `https://yourdomain.com`
- **Redirect URLs:** Add `https://yourdomain.com/auth/callback`

### 3. Resend domain verification

1. Go to [resend.com](https://resend.com) → Domains → Add Domain
2. Add your domain and follow the DNS instructions (TXT + MX + DKIM records)
3. Wait for verification (usually under 30 minutes)
4. Update `EMAIL_FROM` in Vercel to use your verified domain

### 4. Error monitoring (recommended)

```bash
npx @sentry/wizard@latest -i nextjs
```

Add the `SENTRY_DSN` to your Vercel environment variables.

---

## Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest test suite |

---

## License

Proprietary and confidential.
