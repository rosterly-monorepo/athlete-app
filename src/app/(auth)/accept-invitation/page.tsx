import { SignIn } from "@clerk/nextjs";

/**
 * Coach invitation acceptance page.
 *
 * When an org admin invites a coach via Clerk, the invitation email links
 * to this page via the `redirect_url` parameter. The coach either:
 * - Signs in (if they already have an account)
 * - Signs up (if they're new)
 *
 * After auth, Clerk automatically accepts the pending invitation and adds
 * them to the organization. They're then redirected to the coach dashboard.
 *
 * Clerk invitation API call (from backend or dashboard):
 * POST /v1/organizations/{org_id}/invitations
 * {
 *   "email_address": "coach@school.edu",
 *   "role": "org:coach",
 *   "redirect_url": "https://yourapp.com/accept-invitation"
 * }
 */
export default function AcceptInvitationPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Welcome to AthleteHub</h1>
        <p className="text-muted-foreground">
          Sign in or create an account to accept your coaching invitation.
        </p>
      </div>

      <SignIn
        forceRedirectUrl="/coach/dashboard"
        appearance={{
          elements: {
            footerAction: { display: "none" },
          },
        }}
      />
    </div>
  );
}
