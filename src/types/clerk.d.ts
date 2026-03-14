/**
 * Augment Clerk's types for Rosterly.
 *
 * Org-level roles (Clerk Organizations):
 *   "org:coach" | "org:head_coach" | "org:admin"
 *
 * Custom permissions (Clerk Dashboard → Roles & Permissions):
 *   org:roster:read      — View coaching staff
 *   org:roster:manage    — Invite/remove coaching staff
 *   org:recruiting:read  — View recruited athletes
 *   org:recruiting:manage — Manage recruiting pipeline
 */

export type OrgPermission =
  | "org:roster:read"
  | "org:roster:manage"
  | "org:recruiting:read"
  | "org:recruiting:manage";
