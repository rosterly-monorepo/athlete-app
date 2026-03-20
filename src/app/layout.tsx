import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BrandImage } from "@/components/composed/brand-image";
import { Providers } from "@/components/providers";
import { GlobalNav } from "@/components/composed/global-nav";
import { CookieConsent } from "@/components/composed/cookie-consent";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rosterly | Athletic Data Platform",
  description: "Upload your athletic data, build your profile, and get discovered.",
  icons: {
    icon: [
      {
        url: "/branding/icon-light.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/branding/icon-dark.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: "/branding/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} flex min-h-screen flex-col`}>
        <Providers>
          {/* ── Global Navigation (role-aware) ── */}
          <header className="border-border/50 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
            <GlobalNav />
          </header>

          {/* ── Page Content ── */}
          <main className="flex-1">{children}</main>

          {/* ── Footer ── */}
          <footer className="border-border/50 border-t py-8">
            <div className="text-muted-foreground mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 text-center text-sm sm:px-6 lg:px-8">
              <BrandImage asset="icon" className="h-6 w-6" width={32} height={32} />
              <span>&copy; {new Date().getFullYear()} Rosterly. All rights reserved.</span>
            </div>
          </footer>

          {/* ── Cookie Consent Banner ── */}
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
