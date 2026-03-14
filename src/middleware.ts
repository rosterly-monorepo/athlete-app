import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Rosterly middleware — permission-based authorization.
 *
 * Clerk Dashboard setup required:
 *
 * 1. Roles & Permissions → Create custom roles:
 *    - org:coach       (default for invited members)
 *    - org:head_coach  (org admin equivalent)
 *
 * 2. Roles & Permissions → Create features + permissions:
 *    Feature: "roster"
 *      - org:roster:read    (assigned to org:coach, org:head_coach)
 *      - org:roster:manage  (assigned to org:head_coach only)
 *
 *    Feature: "recruiting"
 *      - org:recruiting:read    (assigned to org:coach, org:head_coach)
 *      - org:recruiting:manage  (assigned to org:head_coach only)
 *
 * Authorization strategy:
 * - Athletes: no active org → athlete routes
 * - Coaches: active org (orgId + orgRole present) → coach routes
 * - Public routes: no auth required
 */

// ── Route matchers ──
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/profile(.*)",
  "/performance(.*)",
  "/settings(.*)",
  "/coach(.*)",
]);

const isCoachRoute = createRouteMatcher(["/coach(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return;

  const { userId, orgId, orgRole } = await auth();

  // Not signed in → redirect to sign-in
  if (!userId) {
    await auth.protect();
    return;
  }

  // Coach = has an active org with a role
  const isCoach = !!orgId && !!orgRole;

  if (isCoachRoute(req)) {
    // ── Coach routes: require org membership ──
    if (!isCoach) {
      // Not a coach or no active org → send to athlete dashboard
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  } else {
    // ── Athlete routes: block coaches ──
    // Coaches should use /coach/* routes, not /dashboard
    if (isCoach) {
      return NextResponse.redirect(new URL("/coach/dashboard", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
