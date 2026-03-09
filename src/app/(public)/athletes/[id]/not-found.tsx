import { Button } from "@/components/ui/button";
import { UserX } from "lucide-react";
import Link from "next/link";

export default function AthleteNotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
      <UserX className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <h2 className="text-2xl font-bold mb-2">Athlete not found</h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        This athlete profile doesn&apos;t exist or may have been removed.
      </p>
      <Button asChild>
        <Link href="/athletes">Browse Athletes</Link>
      </Button>
    </div>
  );
}
