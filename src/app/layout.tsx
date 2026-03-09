import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { GlobalNav } from "@/components/composed/global-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "AthleteHub | College Athlete Platform",
  description:
    "The platform for college athletes to showcase their profile, track performance, and connect with opportunities.",
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
              &copy; {new Date().getFullYear()} AthleteHub. All rights reserved.
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
