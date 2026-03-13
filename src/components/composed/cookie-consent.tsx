"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "rosterly-cookie-consent";

export function CookieConsent() {
  // null = not yet checked, true = show banner, false = consent given
  const [showBanner, setShowBanner] = useState<boolean | null>(null);

  useEffect(() => {
    // Check localStorage after mount (client-side only)
    // This is a legitimate hydration-safe pattern for client-only state
    const consent = localStorage.getItem(CONSENT_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowBanner(!consent);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setShowBanner(false);
  };

  // Don't render until we've checked localStorage
  if (showBanner !== true) return null;

  return (
    <div className="bg-card/95 border-border/50 fixed right-0 bottom-0 left-0 z-50 border-t p-4 shadow-lg backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-muted-foreground text-center text-sm sm:text-left">
          We use cookies to keep you signed in and improve your experience. By continuing, you agree
          to our{" "}
          <Link href="/privacy" className="hover:text-foreground underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/privacy">Learn More</Link>
          </Button>
          <Button size="sm" onClick={handleAccept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
