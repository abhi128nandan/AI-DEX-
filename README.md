# AI-DEX

AI-DEX is an AI-powered tool discovery platform designed to help users find, compare, and organize the best AI tools across every category. With seamless search and filtering, category browsing, and a community-driven voting system, discovering the right AI tool for your workflow has never been easier. Users can save tools to their personal collections, track trending tools, and even submit new AI tools for the community to review.

---

## Features

* AI Tool Discovery
* Search and Filtering
* Category Browsing
* Trending Tools
* Top Rated Tools
* User Authentication
* Save Favorites
* Community Voting
* Tool Submission
* Responsive Design

---

## Tech Stack

| Technology | Description |
| --- | --- |
| **Next.js** | React framework for building fast and scalable applications |
| **TypeScript** | Strongly typed programming language that builds on JavaScript |
| **Tailwind CSS** | Utility-first CSS framework for rapid UI development |
| **Supabase** | Open-source Firebase alternative for backend services |
| **PostgreSQL** | Powerful, open source object-relational database system |
| **Resend** | Email API for developers to send transactional emails |

---

## Architecture

```text
Next.js App Router
↓
Supabase Auth
↓
PostgreSQL Database
↓
Tool Discovery Platform
```

---

## Project Structure

A brief overview of the project's primary directories:

* `src/` - Application source code including Next.js app router, components, hooks, and types
* `public/` - Static assets like images and icons
* `supabase_scripts/` - SQL migration and database initialization scripts

---

## Quick Start

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

## Production Build

```bash
npm run build
npm start
```

---

## Future Improvements

* Advanced tool comparison
* Personalized recommendations
* Enhanced analytics
* More discovery features

---

## License

This project is provided for educational and portfolio purposes.
