# Rosterly — College Athlete Platform

The platform for college athletes to showcase their profile, track performance, and connect with opportunities.

## Tech Stack

| Layer          | Technology                                     |
| -------------- | ---------------------------------------------- |
| Framework      | Next.js 15 (App Router, Turbopack)             |
| Auth & Billing | Clerk                                          |
| UI Components  | shadcn/ui (Radix + Tailwind)                   |
| Styling        | Tailwind CSS v4 + CSS variables                |
| Data Fetching  | TanStack Query (client) + React cache (server) |
| Env Validation | T3 Env + Zod                                   |
| Toasts         | Sonner                                         |
| Deployment     | Vercel                                         |
| Language       | TypeScript (strict)                            |

> **Architecture reference:** [next-forge](https://github.com/vercel/next-forge) by Vercel — our patterns for auth, theming, and env management are aligned with this production-grade template.

## Getting Started

```bash
cd athlete-app
npm install
```

### Set up Clerk

1. Create a free account at [clerk.com](https://clerk.com)
2. Create a new application in the Clerk Dashboard
3. Copy your API keys into `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY
CLERK_SECRET_KEY=sk_test_YOUR_KEY
```

> The app validates env vars at build time via T3 Env. It won't start with missing or malformed keys.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                          # Routes only — thin orchestrators
│   ├── layout.tsx                #   Root layout + compound Providers
│   ├── page.tsx                  #   Landing page (SSG)
│   ├── globals.css               #   shadcn theme tokens (swap from 21st.dev)
│   ├── (auth)/                   #   Sign-in / sign-up (Clerk components)
│   ├── (public)/                 #   SEO pages (ISR, Server Components)
│   │   └── athletes/
│   ├── (dashboard)/              #   Protected (Client Components + TanStack Query)
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── performance/
│   │   └── settings/
│   └── api/                      #   BFF proxy routes → external REST API
│
├── components/
│   ├── ui/                       # shadcn primitives (Button, Card, Avatar, etc.)
│   ├── composed/                 # App components (AthleteCard, StatsGrid, NavSidebar)
│   ├── forms/                    # Form components (React Hook Form + Zod)
│   └── providers/                # Compound provider (Theme → Auth → Query → Toaster)
│
├── services/                     # Data Access Layer — ALL API calls
│   ├── api-client.ts             #   Base fetch wrapper
│   ├── athlete.ts                #   Athlete CRUD
│   ├── performance.ts            #   Performance CRUD
│   └── types.ts                  #   Shared TypeScript interfaces
│
├── hooks/                        # TanStack Query wrappers + toast feedback
│   ├── use-athlete.ts
│   └── use-performance.ts
│
├── lib/                          # Pure utilities
│   ├── env.ts                    #   T3 Env validation (Zod schemas)
│   ├── utils.ts                  #   cn() helper
│   └── constants.ts              #   Sport lists, config values
│
└── middleware.ts                  # Clerk auth middleware
```

## Key Patterns

- **Design system:** shadcn/ui + CSS variables. Swap themes by pasting from [21st.dev](https://21st.dev/community/themes).
- **Data flow:** Services (pure TS) → TanStack Query hooks (client) or direct calls (server) → Composed components (props only).
- **Auth:** Clerk middleware protects dashboard routes. Theme-aware AuthProvider auto-matches dark mode.
- **Env safety:** T3 Env + Zod validates all environment variables at build time.
- **Toast feedback:** All mutations show success/error toasts via Sonner.
- **BFF proxy:** API routes attach auth tokens and transform responses for the external REST API.

## Deploy

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full guide. Quick version:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

Or connect your GitHub repo at [vercel.com/new](https://vercel.com/new) for automatic deployments on every push.

## Next Steps

- [ ] **Database** — Add Prisma + PostgreSQL (Neon or Supabase) for athlete profiles
- [ ] **Clerk Billing** — Enable subscription plans and add `<PricingTable />`
- [ ] **Data providers** — Build integrations to import competition results
- [ ] **Error tracking** — Add Sentry for production monitoring
- [ ] **Analytics** — Add Vercel Analytics or PostHog
- [ ] **Public profiles** — Connect `/athletes/[id]` to the database for SEO
- [ ] **Image uploads** — Athlete photos via Uploadthing or Vercel Blob
