import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { GlobalNav } from "@/components/composed/global-nav";
import { CookieConsent } from "@/components/composed/cookie-consent";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rosterly | Athletic Data Platform",
  description:
    "Upload your athletic data, build your profile, and get discovered.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <Providers>
          {/* ── Global Navigation (role-aware) ── */}
          <header className="border-b bg-background">
            <GlobalNav />
          </header>

          {/* ── Page Content ── */}
          <main className="flex-1">{children}</main>

          {/* ── Footer ── */}
          <footer className="border-t py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Rosterly. All rights reserved.
            </div>
          </footer>

          {/* ── Cookie Consent Banner ── */}
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
