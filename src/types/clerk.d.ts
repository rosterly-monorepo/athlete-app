/**
 * Augment Clerk's types for AthleteHub.
 *
 * User-level roles (via publicMetadata):
 *   "athlete" | "coach" | "admin"
 *
 * Org-level roles (Clerk Organizations):
 *   "org:coach" | "org:head_coach" | "org:admin"
 *
 * Custom permissions (Clerk Dashboard → Roles & Permissions):
 *   org:roster:read      — View coaching staff
 *   org:roster:manage    — Invite/remove coaching staff
 *   org:recruiting:read  — View recruited athletes
 *   org:recruiting:manage — Manage recruiting pipeline
 *
 * Session token customization (Clerk Dashboard → Sessions):
 *   { "metadata": "{{user.public_metadata}}" }
 */

export type UserRole = "athlete" | "coach" | "admin";

export type OrgPermission =
  | "org:roster:read"
  | "org:roster:manage"
  | "org:recruiting:read"
  | "org:recruiting:manage";

// Augment Clerk's global types
declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: UserRole;
    };
  }
}
