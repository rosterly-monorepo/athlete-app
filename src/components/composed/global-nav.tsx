"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/use-user-role";
import { ThemeToggle } from "./theme-toggle";

/**
 * Role-aware global navigation.
 *
 * Athletes see: Dashboard, Performance
 * Coaches see: Coach Dashboard, Roster
 * Signed out users see: Browse Athletes, Sign In, Get Started
 */
export function GlobalNav() {
  const { isSignedIn, isLoaded } = useAuth();
  const { isCoach, orgId } = useUserRole();

  return (
    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold tracking-tight">
        Athlete<span className="text-primary">Hub</span>
      </Link>

      <div className="flex items-center gap-3">
        {!isLoaded ? (
          // Loading state - show nothing to prevent flash
          <div className="h-8 w-20" />
        ) : !isSignedIn ? (
          // Signed out
          <>
            <Link
              href="/athletes"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse Athletes
            </Link>
            <SignInButton>
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button size="sm">Get Started</Button>
            </SignUpButton>
          </>
        ) : (
          // Signed in
          <>
            {isCoach && orgId ? (
              // Coach navigation
              <>
                <Link
                  href="/coach/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/coach/roster"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Roster
                </Link>
              </>
            ) : (
              // Athlete navigation
              <>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/performance"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
