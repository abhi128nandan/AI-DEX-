# AI-DEX

AI-DEX is a premium, community-driven platform for discovering, voting on, and submitting the latest AI tools. Designed as a modern "Product Hunt for AI," it features an immersive glassmorphic UI, robust server-side search, and real-time interaction powered by Supabase.

## 🚀 Tech Stack

AI-DEX is built using a bleeding-edge, highly optimized stack tailored for performance and developer experience:

### Frontend
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Server Components)
- **UI Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Components:** [Radix UI](https://www.radix-ui.com/) (Headless accessible primitives)
- **Icons:** [Lucide React](https://lucide.dev/)

### Backend & Data
- **Database / Auth:** [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security)
- **Data Fetching:** [TanStack Query v5](https://tanstack.com/query/latest) (React Query)
- **Transactional Emails:** [Resend](https://resend.com/)

### Testing Suite
- **Unit & Integration:** [Vitest](https://vitest.dev/)
- **UI Testing:** React Testing Library & JSDOM
- **Property-Based Testing:** [Fast-Check](https://github.com/dubzzz/fast-check)
- **E2E & Scraping:** Puppeteer

## 🌟 Key Features

- **Dynamic Discovery Explorer:** A blazing-fast interface for browsing AI tools with real-time client-side filtering and robust server-side search (powered by PostgreSQL GIN indexing).
- **Community Driven:** Users can upvote tools, bookmark their favorites, and leave comments.
- **Admin Dashboard:** Secure portal for admins to review, approve, or reject community tool submissions.
- **Immersive Design:** Next-gen aesthetics utilizing glassmorphism, subtle gradients, and fluid micro-animations via Framer Motion.
- **SEO Optimized:** Dynamic and static metadata generation to ensure maximum visibility across search engines.

## 🛠️ Getting Started

### Prerequisites
- Node.js >= 18
- npm or yarn
- A [Supabase](https://supabase.com/) project
- A [Resend](https://resend.com/) API Key (optional, for email)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/abhi128nandan/AI-DEX-.git
   cd aidex-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root directory and add your keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   RESEND_API_KEY=your_resend_api_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🧪 Testing

We take quality seriously. The project includes a comprehensive testing suite combining standard unit testing with property-based boundary testing.

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch
```

## 📜 License
This project is proprietary and confidential.

---
*Built with modern web standards and high-end design aesthetics.*
