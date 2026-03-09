"use client";

import { Button } from "@/components/ui/button";
import { UserX } from "lucide-react";
import Link from "next/link";

export default function AthleteProfileError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
      <UserX className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <h2 className="text-2xl font-bold mb-2">Couldn&apos;t load this profile</h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        The athlete profile you&apos;re looking for might not exist or there was an error loading it.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/athletes">Browse Athletes</Link>
        </Button>
      </div>
    </div>
  );
}
