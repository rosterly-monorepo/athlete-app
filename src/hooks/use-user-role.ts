"use client";

import { useAuth, useOrganization, useUser } from "@clerk/nextjs";
import type { UserRole, OrgPermission } from "@/types/clerk.d";

/**
 * Hook to access the current user's role, org context, and permissions.
 *
 * Usage:
 *   const { role, isAthlete, isCoach, hasPermission } = useUserRole();
 *   if (hasPermission("org:roster:manage")) { ... }
 */
export function useUserRole() {
  const { has } = useAuth();
  const { user } = useUser();
  const { organization, membership } = useOrganization();

  // Role from publicMetadata (set by webhook on signup / org join)
  const role = (user?.publicMetadata as { role?: UserRole } | undefined)?.role ?? null;

  // Organization context (coaches only)
  const orgId = organization?.id ?? null;
  const orgRole = membership?.role ?? null;

  // Permission checker — delegates to Clerk's has() which reads JWT claims
  const hasPermission = (permission: OrgPermission): boolean => {
    if (!has) return false;
    return has({ permission }) ?? false;
  };

  return {
    role,
    isAthlete: role === "athlete" || role === null, // null = pre-webhook, treat as athlete
    isCoach: role === "coach",
    isAdmin: role === "admin",
    orgId,
    orgRole,
    orgName: organization?.name ?? null,
    hasPermission,
  };
}
