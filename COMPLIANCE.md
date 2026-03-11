# Frontend Compliance Documentation

**Frameworks:** SOC2 Type 2, GDPR
**Scope:** Frontend application (Next.js)
**Last Review:** 2026-03-10

---

## Table of Contents

1. [SOC2 Type 2 Controls](#soc2-type-2-controls)
2. [GDPR Requirements](#gdpr-requirements)
3. [Security Headers](#security-headers)
4. [Remediation Roadmap](#remediation-roadmap)

---

## SOC2 Type 2 Controls

### CC6.1 - Logical Access Controls ✅

**Status:** Implemented

The application uses Clerk for authentication with role-based access control (RBAC).

**User-Level Roles** (via `publicMetadata.role`):

- `athlete` - Individual athlete users
- `coach` - Coaching staff
- `admin` - System administrators

**Organization-Level Permissions** (Clerk Organizations):

- `org:roster:read` - View coaching staff roster
- `org:roster:manage` - Invite/remove staff members
- `org:recruiting:read` - View recruited athletes
- `org:recruiting:manage` - Manage recruiting pipeline

**Route Protection:**

All protected routes require authentication via middleware (`src/middleware.ts:34-40`):

```
/dashboard/*   - Athlete dashboard
/profile/*     - User profile
/performance/* - Performance data
/settings/*    - User settings
/coach/*       - Coach-only routes (requires org membership)
```

**Implementation Files:**

- `src/middleware.ts` - Route protection & role enforcement
- `src/hooks/use-user-role.ts` - Client-side permission checking
- `src/types/clerk.d.ts` - Role & permission type definitions

---

### CC6.6 - System Boundaries ✅

**Status:** Implemented

**Implemented Headers** (`next.config.ts:25-41`):

| Header                 | Value                                    | Purpose                   |
| ---------------------- | ---------------------------------------- | ------------------------- |
| X-Frame-Options        | DENY                                     | Prevents clickjacking     |
| X-Content-Type-Options | nosniff                                  | Prevents MIME sniffing    |
| Referrer-Policy        | strict-origin-when-cross-origin          | Controls referrer leakage |
| Permissions-Policy     | camera=(), microphone=(), geolocation=() | Disables browser features |

**Content-Security-Policy (CSP)** ✅

Configured in `next.config.ts:6-17` with environment-aware directives:

**Production:**

```
default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://*.clerk.com https://*.clerk.accounts.dev; frame-src https://*.clerk.accounts.dev https://challenges.cloudflare.com; worker-src 'self' blob:
```

**Development:** Adds `http://localhost:*` and `ws://localhost:*` for HMR and local API.

> Note: `'unsafe-inline'` and `'unsafe-eval'` are required for Clerk's auth UI. Consider using nonces for stricter CSP in the future.

---

### CC6.7 - Transmission Security ✅

**Status:** Implemented

**HTTPS:** Enforced at infrastructure level (Vercel deployment)

**Strict-Transport-Security (HSTS)** ✅

Configured in `next.config.ts:38-41`:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains
```

> Note: `preload` directive not included. Add it after verifying HTTPS works correctly across all subdomains, then submit to hstspreload.org.

---

### CC7.2 - System Monitoring ✅

**Status:** Implemented

**Implemented:**

- Clerk provides authentication event logs (sign-in, sign-out, failed attempts)
- Next.js logs API requests with full URLs (`next.config.ts`)
- **Backend database audit logging** - all data changes are audited at the database level

---

## GDPR Requirements

### Cookies & Consent ✅

**Status:** Compliant

**Current State:**

- Clerk authentication cookies (httpOnly, secure) - strictly necessary
- No analytics or tracking cookies
- No third-party cookies

**Implementation:**

- Cookie consent banner at `src/components/composed/cookie-consent.tsx`
- Consent stored in localStorage (`rosterly-cookie-consent`)
- Links to `/privacy` policy page
- Banner appears on first visit until user accepts

> Note: Clerk auth cookies are "strictly necessary" for the service to function and do not legally require consent to set. The banner informs users and provides transparency.

---

### Client-Side Data Storage ✅

**Status:** Compliant

| Storage Type         | Personal Data    | Notes                   |
| -------------------- | ---------------- | ----------------------- |
| localStorage         | None             | Not used for PII        |
| sessionStorage       | None             | Not used for PII        |
| Cookies              | Auth tokens only | Clerk-managed, httpOnly |
| Memory (React Query) | Cached API data  | Cleared on page close   |

The application does not persist personal data in browser storage beyond Clerk's authentication cookies.

---

### Privacy Controls ✅

**Status:** Compliant

**Implemented:**

- `isPublic` flag controls visibility to accredited university recruiters (not public internet)
- Profile sharing limited to onboarded, verified schools
- No analytics or tracking scripts

**Data Sharing Model:**
Athlete profiles are **not publicly accessible**. The `isPublic` flag enables visibility only to:

- Accredited universities onboarded to the platform
- Verified coaching staff with organization membership

This B2B controlled sharing model has a clear lawful basis (legitimate interest / contractual necessity for recruiting).

**Remaining Gaps:**

1. **No in-app data export**
   Users cannot self-service export their data. May be handled via support request.

**Completed:**

- Privacy policy page at `/privacy`

---

### Data Minimization ✅

**Status:** Compliant

The frontend collects only data necessary for the application's purpose:

- Athletic profile information
- Performance metrics
- Contact information for coaches

No excessive data collection. No hidden tracking or analytics.

---

## Security Headers

### Current Configuration

Location: `next.config.ts`

All security headers are configured and environment-aware:

| Header                    | Value                                    | Status |
| ------------------------- | ---------------------------------------- | ------ |
| X-Frame-Options           | DENY                                     | ✅     |
| X-Content-Type-Options    | nosniff                                  | ✅     |
| Referrer-Policy           | strict-origin-when-cross-origin          | ✅     |
| Permissions-Policy        | camera=(), microphone=(), geolocation=() | ✅     |
| Strict-Transport-Security | max-age=63072000; includeSubDomains      | ✅     |
| Content-Security-Policy   | Environment-aware (see CC6.6 above)      | ✅     |

### Header Verification

Test headers after deployment:

```bash
curl -I https://your-domain.com | grep -E "(X-Frame|X-Content|Content-Security|Strict-Transport|Referrer|Permissions)"
```

Or use: https://securityheaders.com

---

## Remediation Roadmap

| Priority | Item                      | Framework    | Impact                      | Status     |
| -------- | ------------------------- | ------------ | --------------------------- | ---------- |
| **P1**   | ~~Add CSP header~~        | SOC2 CC6.6   | Prevents XSS/injection      | ✅ Done    |
| **P1**   | ~~Add HSTS header~~       | SOC2 CC6.7   | Enforces HTTPS              | ✅ Done    |
| **P1**   | ~~Audit logging~~         | SOC2 CC7.2   | Monitoring & accountability | ✅ Backend |
| **P2**   | ~~Cookie consent banner~~ | GDPR Art. 7  | Legal compliance for EU     | ✅ Done    |
| **P2**   | ~~Privacy policy page~~   | GDPR Art. 13 | Transparency requirement    | ✅ Done    |

---

## References

- [SOC2 Trust Services Criteria](https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/trustservices)
- [GDPR Full Text](https://gdpr-info.eu/)
- [Clerk Security Documentation](https://clerk.com/docs/security/overview)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
