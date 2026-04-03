"use client";

import { useAuth, useOrganizationList } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

/**
 * Auto-activates a Clerk organization when a signed-in user has
 * org memberships but no active org.
 *
 * This handles the case where an admin adds a user to an org via
 * the Clerk Dashboard (rather than the invitation flow), which
 * doesn't automatically set the org as "active" in the user's session.
 *
 * Blocks rendering of children while activation is in progress
 * to prevent a flash of the wrong role-based UI.
 */
export function OrgActivationGuard({ children }: { children: React.ReactNode }) {
  const { isSignedIn, orgId } = useAuth();
  const { userMemberships, setActive, isLoaded } = useOrganizationList({
    userMemberships: { infinite: true },
  });
  const activating = useRef(false);

  const memberships = userMemberships?.data;
  const needsActivation =
    isSignedIn && isLoaded && !orgId && !!memberships && memberships.length > 0;

  useEffect(() => {
    if (!needsActivation || activating.current) return;

    activating.current = true;
    setActive?.({ organization: memberships![0].organization.id }).finally(() => {
      activating.current = false;
    });
  }, [needsActivation, memberships, setActive]);

  if (needsActivation) {
    return null;
  }

  return <>{children}</>;
}
