# AI-DEX

AI-powered tool discovery platform — find, compare, and vote on the best AI tools across every category.

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- A **Supabase** project with Auth, Database, and Edge Functions enabled
- A **Resend** account for transactional email (optional — falls back to Supabase email)

## Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd aidex-app

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Open .env.local and fill in the values below
```

## Environment Variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous / public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server-side only, **never** expose to the client) |
| `NEXT_PUBLIC_SITE_URL` | Public site URL, e.g. `http://localhost:3000` |
| `RESEND_API_KEY` | Resend API key for transactional emails |

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing

```bash
npm test           # single run
npm run test:watch # watch mode
```

## Production Build

```bash
npm run build
npm start
```
