# AI-DEX

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![Tailwind_CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](#)

A modern discovery platform to find, compare, and organize the best AI tools across every category.

AI-DEX simplifies the rapidly expanding AI landscape by providing a curated, searchable directory of AI tools. Whether you're looking for the latest LLM wrappers or specialized AI agents, AI-DEX helps you discover the right tool for your workflow through a community-driven platform featuring real-time search, category browsing, and user voting.

---

## Features

- **AI Tool Discovery**: Browse a comprehensive directory of AI tools.
- **Search and Filtering**: Instantly search tools by name, description, or tags.
- **Category Browsing**: Navigate tools across predefined categories (e.g., Code, Writing, Image).
- **Trending Tools**: Discover what's hot right now based on community engagement.
- **Top Rated Tools**: Find the highest-quality tools backed by user votes.
- **User Authentication**: Secure signup and login via Supabase.
- **Save Favorites**: Bookmark your favorite tools to a personal collection.
- **Community Voting**: Upvote tools to help them gain visibility.
- **Tool Submission**: Submit new tools to the directory for community review.
- **Responsive Design**: Beautiful, modern interface optimized for all devices.

---

## Screenshots

### Homepage
*(Placeholder: Add homepage screenshot here)*

### Search & Discovery
*(Placeholder: Add search and filtering screenshot here)*

### Tool Details
*(Placeholder: Add tool detail modal screenshot here)*

### Saved Tools
*(Placeholder: Add saved tools collection screenshot here)*

### Submit Tool
*(Placeholder: Add tool submission form screenshot here)*

---

## Architecture

AI-DEX is built on a modern, serverless architecture utilizing Next.js App Router and Supabase.

```text
User Request
    ↓
Next.js Frontend (React Server Components + Client Hooks)
    ↓
Supabase Database Client & Auth
    ├ Authentication (Session Management)
    ├ PostgreSQL Database (Tools, Votes, Saves, Profiles)
    └ Storage (Optional asset hosting)
```

---

## Tech Stack

| Technology | Role |
| --- | --- |
| **Next.js** | React framework for Server-Side Rendering and routing |
| **TypeScript** | Type-safe JavaScript for robust development |
| **Tailwind CSS** | Utility-first styling and responsive design |
| **Supabase** | Backend-as-a-Service (Auth, Database) |
| **PostgreSQL** | Relational database (managed by Supabase) |
| **Resend** | Transactional email provider for authentication (optional fallback) |

---

## Project Structure

A brief overview of the project's primary directories:

- `src/app/` - Next.js App Router pages and API routes.
- `src/components/` - Reusable React components (UI elements, layout, tool panels).
- `src/lib/` - Shared utilities, database schema definitions, and Supabase client configurations.
- `public/` - Static assets, images, and icons.
- `supabase_scripts/` - SQL migrations and database initialization scripts (schema, rate limits).

---

## Quick Start

### 1. Clone the repository
```bash
git clone <repo-url>
cd aidex-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env.local
```

---

## Supabase Setup

Run the SQL files in `supabase_scripts/` in the Supabase SQL editor in this order:
1. `supabase-schema.sql`
2. `setup-auth-rate-limits.sql`

---

## Environment Variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous / public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server-side only, **never** expose to the client) |
| `NEXT_PUBLIC_SITE_URL` | Public site URL, e.g. `http://localhost:3000` |
| `RESEND_API_KEY` | Resend API key for transactional emails |
| `EMAIL_FROM` | Verified sender address, e.g. `AIDex <noreply@yourdomain.com>` |

---

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing

```bash
npm test           # single run
npm run test:watch # watch mode
```

---

## Production Deployment

```bash
npm run build
npm start
```

For production hosting, deploying to Vercel is highly recommended for seamless Next.js support. Set your environment variables in your hosting dashboard before deploying.

---

## Future Roadmap

- Advanced tool comparison and side-by-side matrices
- Personalized tool recommendations based on user saves
- Enhanced analytics for tool creators and submitters
- Expanded discovery features (developer APIs, integration tagging)

---

## License

This project is provided for educational and portfolio purposes.
