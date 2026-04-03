"use client";

import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "./auth-provider";
import { OrgActivationGuard } from "./org-activation-guard";
import { QueryProvider } from "./query-provider";
import { Toaster } from "@/components/ui/sonner";

/**
 * Compound provider that wraps the entire app.
 * Composes: Theme → Auth (Clerk w/ dark mode) → OrgActivationGuard → Query (TanStack) → Toaster
 *
 * Adding a new provider? Wrap it here — layout.tsx stays clean.
 * Pattern from: next-forge (packages/design-system/provider.tsx)
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <OrgActivationGuard>
          <QueryProvider>
            {children}
            <Toaster richColors position="bottom-right" />
          </QueryProvider>
        </OrgActivationGuard>
      </AuthProvider>
    </ThemeProvider>
  );
}
