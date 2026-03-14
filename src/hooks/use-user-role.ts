"use client";

import { useAuth, useOrganization } from "@clerk/nextjs";
import type { OrgPermission } from "@/types/clerk.d";

/**
 * Hook to access the current user's role, org context, and permissions.
 *
 * Role is derived from org claims only: if the user has an active
 * organization they're a coach, otherwise they're an athlete.
 *
 * Usage:
 *   const { isAthlete, isCoach, hasPermission } = useUserRole();
 *   if (hasPermission("org:roster:manage")) { ... }
 */
export function useUserRole() {
  const { has } = useAuth();
  const { organization, membership } = useOrganization();

  const orgId = organization?.id ?? null;
  const orgRole = membership?.role ?? null;
  const isCoach = !!orgId;
  const isAthlete = !orgId;
  const isHeadCoach = orgRole === "org:head_coach" || orgRole === "org:admin";

  // Permission checker — delegates to Clerk's has() which reads JWT claims
  const hasPermission = (permission: OrgPermission): boolean => {
    if (!has) return false;
    return has({ permission }) ?? false;
  };

  return {
    isAthlete,
    isCoach,
    isHeadCoach,
    isAdmin: orgRole === "org:admin",
    orgId,
    orgRole,
    orgName: organization?.name ?? null,
    hasPermission,
  };
}
