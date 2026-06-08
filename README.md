# AI-DEX

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![Tailwind_CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](#)

AI-DEX is a community-driven platform for discovering, comparing, saving, and ranking AI tools. Built with Next.js, TypeScript, Supabase, and PostgreSQL, it provides fast search, category-based discovery, user authentication, voting, and personal tool collections.

---

## Live Demo
[View Live Application](#) *(Deployment link pending)*

---

## Screenshots

### Homepage Dashboard
![Homepage Dashboard](.github/assets/homepage.png)

### Search & Discovery
![Search & Discovery](.github/assets/search.png)

### Tool Detail View
![Tool Detail View](.github/assets/tool-detail.png)

### Saved Tools Collection
![Saved Tools Collection](.github/assets/saved-tools.png)

### Tool Submission Workflow
![Tool Submission Workflow](.github/assets/submit-tool.png)

---

## System Architecture

```text
User
│
▼
Next.js App Router
│
├─ Server Components
├─ Client Components
│
▼
Supabase
├─ Authentication
├─ PostgreSQL
└─ Storage
│
▼
AI-DEX Platform
```

---

## Database Architecture

```text
Users
│
├── Saved Tools
├── Votes
└── Submissions

Tools
│
├── Categories
├── Tags
└── Votes
```

---

## Key Learnings

* Building authenticated applications with Supabase
* Managing Server and Client Components in Next.js
* Designing relational database schemas
* Implementing URL-synchronized search and filtering
* Creating responsive interfaces with Tailwind CSS
* Handling user-generated content workflows

---

## Technical Highlights

- **Next.js App Router**: Utilizes React Server Components (RSC) for fast initial data fetching and Client Components for interactivity.
- **TypeScript**: End-to-end type safety protecting data models, API payloads, and component props.
- **Supabase Authentication**: Integrated secure authentication with session management and route protection.
- **PostgreSQL**: Relational database handling complex queries, aggregation, and foreign-key constraints.
- **Voting System**: Interactive UI allowing authenticated users to upvote tools and influence community rankings.
- **Saved Tools System**: Authorized users can persist tools to their personal collections for later access.
- **Search and Filtering**: Client-side state synchronization with URL parameters (`/?search=keyword`) for shareable search queries.
- **Responsive Design**: Mobile-first Tailwind CSS implementation prioritizing accessibility and fluid layout adjustments.

---

## Challenges Solved

- **State Synchronization**: Maintained UI consistency between URL search parameters and client-side filtering without redundant component re-renders.
- **Layout Shift Prevention**: Engineered exact dimensions for skeleton loading states to match the resolved UI, ensuring a stable user experience.
- **Secure Data Access**: Leveraged Supabase Row Level Security (RLS) policies to ensure users can only modify their own votes and saved tool collections.

---

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/abhi128nandan/AI-DEX-.git
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



---

## Testing

```bash
npm test           # single run
npm run test:watch # watch mode
```

---

## Deployment

### Vercel Deployment
For production hosting, deploying to Vercel is highly recommended to leverage native Next.js optimizations.

1. Push your code to a GitHub repository.
2. Import the project in Vercel.
3. Add the required environment variables (see below) in the Vercel dashboard.
4. Deploy.

```bash
npm run build
npm start
```

---

## Deployment Checklist

* Environment variables configured
* Supabase project configured
* SQL scripts executed
* Production build passes
* Authentication flow verified
* Tool submission flow verified

---

## Repository Topics

* nextjs
* typescript
* supabase
* postgresql
* tailwindcss
* ai-tools
* tool-discovery
* full-stack

---

## License

This project is provided for educational and portfolio purposes.
