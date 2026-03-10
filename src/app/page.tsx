import { SignInButton, Show } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ── Hero ── */}
      <section className="py-24 sm:py-40 text-center">
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6">
          Rosterly
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-12">
          Upload your athletic data. Build your profile. Get discovered.
        </p>

        <Show
          when="signed-out"
          fallback={
            <Button size="lg" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          }
        >
          <SignInButton>
            <Button size="lg" className="w-48">
              Sign In
            </Button>
          </SignInButton>
        </Show>
      </section>
    </div>
  );
}
