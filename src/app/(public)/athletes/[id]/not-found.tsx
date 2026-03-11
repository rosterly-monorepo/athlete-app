import { Button } from "@/components/ui/button";
import { UserX } from "lucide-react";
import Link from "next/link";

export default function AthleteNotFound() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 lg:px-8">
      <UserX className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
      <h2 className="mb-2 text-2xl font-bold">Athlete not found</h2>
      <p className="text-muted-foreground mx-auto mb-6 max-w-md">
        This athlete profile doesn&apos;t exist or may have been removed.
      </p>
      <Button asChild>
        <Link href="/athletes">Browse Athletes</Link>
      </Button>
    </div>
  );
}
