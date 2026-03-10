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
 * 3. Sessions → Customize session token:
 *    {
 *      "metadata": "{{user.public_metadata}}"
 *    }
 *
 * Authorization strategy:
 * - Athletes: checked via publicMetadata.role (no org needed)
 * - Coaches: checked via org permissions using has()
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

  const { userId, sessionClaims, orgId } = await auth();

  // Not signed in → redirect to sign-in
  if (!userId) {
    await auth.protect();
    return;
  }

  // Extract user-level role from publicMetadata
  const metadata = sessionClaims?.metadata as { role?: string } | undefined;
  const role = metadata?.role;

  if (isCoachRoute(req)) {
    // ── Coach routes: require org membership ──
    // Coaches must have an active organization (school).
    // The org permissions (has()) handle fine-grained access
    // within the coach pages themselves (see <Protect> in components).
    if (!orgId || role !== "coach") {
      // Not a coach or no active org → send to athlete dashboard
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  } else {
    // ── Athlete routes: block coaches ──
    // Coaches should use /coach/* routes, not /dashboard
    if (role === "coach" && orgId) {
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
