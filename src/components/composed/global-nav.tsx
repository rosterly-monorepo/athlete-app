"use client";

import Link from "next/link";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/use-user-role";
import { ThemeToggle } from "./theme-toggle";

/**
 * Role-aware global navigation.
 *
 * Athletes see: Dashboard, Performance
 * Coaches see: Coach Dashboard, Roster
 * Signed out users see: Sign In
 */
export function GlobalNav() {
  const { isSignedIn, isLoaded } = useAuth();
  const { isCoach, orgId } = useUserRole();

  return (
    <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <Link href="/" className="text-xl font-bold tracking-tight">
        Rosterly
      </Link>

      <div className="flex items-center gap-3">
        {!isLoaded ? (
          // Loading state - show nothing to prevent flash
          <div className="h-8 w-20" />
        ) : !isSignedIn ? (
          // Signed out
          <SignInButton>
            <Button size="sm">Sign In</Button>
          </SignInButton>
        ) : (
          // Signed in
          <>
            {isCoach && orgId ? (
              // Coach navigation
              <>
                <Link
                  href="/coach/dashboard"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/coach/roster"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Roster
                </Link>
              </>
            ) : (
              // Athlete navigation
              <>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/performance"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Performance
                </Link>
              </>
            )}
            <UserButton />
          </>
        )}
        <ThemeToggle />
      </div>
    </nav>
  );
}
