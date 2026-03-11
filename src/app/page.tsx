import { SignInButton, Show } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* ── Hero ── */}
      <section className="py-24 text-center sm:py-40">
        <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-7xl">Rosterly</h1>
        <p className="text-muted-foreground mx-auto mb-12 max-w-xl text-lg sm:text-xl">
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
