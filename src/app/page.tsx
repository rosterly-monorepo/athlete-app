import { SignUpButton, Show } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const features = [
  {
    title: "Athlete Profile",
    description: "Create a public profile that showcases your sport, stats, achievements, and academic record. SEO-optimized so scouts and recruiters can find you.",
  },
  {
    title: "Performance Tracking",
    description: "Connect your competition results and training data from providers. Track progress over time and share verified stats.",
  },
  {
    title: "Opportunity Management",
    description: "Manage NIL deals, track outreach, and organize the opportunities that come your way — all in one place.",
  },
];

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ── Hero ── */}
      <section className="py-20 sm:py-32 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
          Your Athletic Career,{" "}
          <span className="text-primary">One Platform</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Build your athlete profile, track your performance data, and connect
          with the opportunities you deserve.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Show
            when="signed-out"
            fallback={
              <Button size="lg" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            }
          >
            <SignUpButton>
              <Button size="lg">Create Your Profile</Button>
            </SignUpButton>
            <Button variant="outline" size="lg" asChild>
              <Link href="/athletes">Browse Athletes</Link>
            </Button>
          </Show>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 border-t">
        <h2 className="text-2xl font-bold text-center mb-12">
          Everything you need to stand out
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:border-primary transition-colors">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
