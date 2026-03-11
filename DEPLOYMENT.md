# Deployment Guide

## Platform: Vercel

Vercel is the recommended deployment platform. It's made by the same team as Next.js, so every feature (SSR, ISR, Server Components, middleware, image optimization) works without configuration.

---

## Quick Deploy (< 5 minutes)

### Option A: Git-connected (recommended)

1. Push your repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variables (see below)
5. Click Deploy

Every push to `main` auto-deploys to production. Every PR gets a preview URL.

### Option B: CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (first time — links to your Vercel account)
vercel

# Deploy to production
vercel --prod
```

---

## Environment Variables

Set these in the Vercel Dashboard → Project → Settings → Environment Variables.

### Required

| Variable                            | Value         | Environments         |
| ----------------------------------- | ------------- | -------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` | Production           |
| `CLERK_SECRET_KEY`                  | `sk_live_...` | Production           |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_...` | Preview, Development |
| `CLERK_SECRET_KEY`                  | `sk_test_...` | Preview, Development |

### Recommended

| Variable                              | Value        | Notes                                      |
| ------------------------------------- | ------------ | ------------------------------------------ |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`       | `/sign-in`   |                                            |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`       | `/sign-up`   |                                            |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |                                            |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` |                                            |
| `NEXT_PUBLIC_API_URL`                 | `` (empty)   | Leave empty to use same-origin /api routes |

### When backend is connected

| Variable           | Value                        | Notes                                       |
| ------------------ | ---------------------------- | ------------------------------------------- |
| `EXTERNAL_API_URL` | `https://api.yourdomain.com` | Your REST API base URL                      |
| `API_SECRET_KEY`   | `your_secret`                | Server-side only — never exposed to browser |

> **Important:** Use separate Clerk applications for production vs development. Clerk's test keys (`pk_test_`, `sk_test_`) point to the development instance with test data.

---

## Production Checklist

### Before first deploy

- [ ] **Clerk production keys** — Create a production instance in Clerk Dashboard and copy the live keys
- [ ] **Custom domain** — Add your domain in Vercel → Project → Settings → Domains
- [ ] **Clerk domain** — Update the Clerk production instance with your custom domain
- [ ] **Environment variables** — All required vars set for Production environment in Vercel
- [ ] **T3 Env validation** — Run `npm run build` locally to verify env validation passes

### Security

- [ ] **Security headers** — Configured in `next.config.ts` (X-Frame-Options, CSP, etc.)
- [ ] **API routes protected** — All `/api/` routes check `auth()` before processing
- [ ] **Middleware active** — `clerkMiddleware()` protects dashboard routes
- [ ] **No secrets in client code** — Only `NEXT_PUBLIC_*` vars are used in client components
- [ ] **Webhook verification** — When Clerk Billing is enabled, verify webhook signatures

### Performance

- [ ] **ISR configured** — Public athlete pages use `revalidate: 60`
- [ ] **Images optimized** — Using Next.js `<Image>` component, remote patterns configured
- [ ] **Bundle size** — Run `npm run build` and check output for large pages
- [ ] **Loading states** — `loading.tsx` files in public route groups
- [ ] **Error boundaries** — `error.tsx` files in public route groups

### Monitoring (pre-launch priorities)

- [ ] **Error tracking** — Add Sentry (`@sentry/nextjs`) for production error monitoring
- [ ] **Analytics** — Add Vercel Analytics (`@vercel/analytics`) or PostHog
- [ ] **Speed Insights** — Add Vercel Speed Insights (`@vercel/speed-insights`)
- [ ] **Uptime monitoring** — Set up a health check on your domain

---

## Domain Setup

1. **Vercel:** Project → Settings → Domains → Add your domain
2. **DNS:** Point your domain to Vercel:
   - `A` record: `76.76.21.21`
   - `CNAME` for `www`: `cname.vercel-dns.com`
3. **Clerk:** Production instance → Domains → Add the same domain
4. **SSL:** Automatic via Vercel — no configuration needed

---

## Preview Deployments

Every pull request automatically gets a unique preview URL (e.g., `athlete-app-git-feature-xyz.vercel.app`). Preview deployments use the **Preview** environment variables, so they connect to your Clerk test instance.

This means:

- Designers can review UI changes on a real URL
- QA can test features before they hit production
- Clerk test users won't pollute production data

---

## Vercel Pricing Notes

| Plan           | Cost           | What you get                                     |
| -------------- | -------------- | ------------------------------------------------ |
| **Hobby**      | Free           | 1 project, 100GB bandwidth, serverless functions |
| **Pro**        | $20/user/month | Unlimited projects, 1TB bandwidth, team features |
| **Enterprise** | Custom         | SLA, advanced security, dedicated support        |

The Hobby plan is sufficient through launch and early growth. Move to Pro when you:

- Need team collaboration (multiple Vercel accounts)
- Hit bandwidth limits
- Need password-protected preview deployments

**Cost optimization tip:** Your architecture already minimizes Vercel costs because ISR pages are cached at the edge (fewer function invocations) and the service layer avoids redundant API calls via React `cache()`.

---

## When to reconsider Vercel

Vercel is the right choice until your bill exceeds ~$200-300/month consistently. At that point, evaluate:

- **Cloudflare Pages + Workers** — Dramatically cheaper at scale (free bandwidth), but requires adaptation for some Node.js APIs
- **Self-hosted (Docker + VPS)** — 10-20% of Vercel's cost, but you own the ops burden
- **Railway** — Managed hosting with predictable pricing, Docker-based

The architecture is designed to be portable — the service layer, components, and hooks work identically regardless of hosting platform. The only Vercel-specific files are `vercel.json` and any Vercel Analytics/Speed Insights integrations.
