"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function AthletesError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        We couldn&apos;t load the athlete directory. Please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
