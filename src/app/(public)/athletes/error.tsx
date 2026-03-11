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
    <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
      <AlertCircle className="text-destructive mx-auto mb-4 h-12 w-12" />
      <h2 className="mb-2 text-2xl font-bold">Something went wrong</h2>
      <p className="text-muted-foreground mx-auto mb-6 max-w-md">
        We couldn&apos;t load the athlete directory. Please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
