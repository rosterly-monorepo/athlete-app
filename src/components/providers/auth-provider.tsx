"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Wraps ClerkProvider with automatic dark mode support.
 * Clerk's sign-in, sign-up, and UserButton components will
 * match the current theme without any per-component config.
 *
 * Pattern from: next-forge (packages/auth/provider.tsx)
 */
export function AuthProvider(props: ComponentProps<typeof ClerkProvider>) {
  const { resolvedTheme } = useTheme();

  return (
    <ClerkProvider
      {...props}
      afterSignOutUrl="/"
      appearance={{
        baseTheme: resolvedTheme === "dark" ? dark : undefined,
        variables: {
          colorPrimary: resolvedTheme === "dark" ? "#e8e8e8" : "#1a1a1a",
        },
      }}
    />
  );
}
