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
    <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 lg:px-8">
      <UserX className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
      <h2 className="mb-2 text-2xl font-bold">Couldn&apos;t load this profile</h2>
      <p className="text-muted-foreground mx-auto mb-6 max-w-md">
        The athlete profile you&apos;re looking for might not exist or there was an error loading
        it.
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
