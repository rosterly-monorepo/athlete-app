import { currentUser } from "@clerk/nextjs/server";
import { StatsGrid } from "@/components/composed/stats-grid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await currentUser();

  const stats = [
    { label: "Profile Views", value: "—", note: "Coming soon" },
    { label: "Competition Results", value: "0", note: "Add your first result" },
    { label: "Profile Completion", value: "20%", note: "Complete your profile" },
  ];

  const steps = [
    {
      step: "1",
      title: "Complete your athlete profile",
      description: "Add your sport, position, school, and bio.",
      href: "/profile",
    },
    {
      step: "2",
      title: "Add competition results",
      description: "Import or manually add your performance data.",
      href: "/performance",
    },
    {
      step: "3",
      title: "Make your profile public",
      description: "Share your profile with scouts and recruiters.",
      href: "/settings",
    },
  ];

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Welcome back, {user?.firstName || "Athlete"}</h1>
      <p className="text-muted-foreground mb-8">
        Here&apos;s an overview of your athlete profile and recent activity.
      </p>

      <div className="mb-8">
        <StatsGrid stats={stats} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Get started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {steps.map((action) => (
            <Link
              key={action.step}
              href={action.href}
              className="hover:bg-accent flex items-start gap-4 rounded-lg p-3 transition-colors"
            >
              <span className="bg-primary text-primary-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                {action.step}
              </span>
              <div>
                <p className="text-sm font-medium">{action.title}</p>
                <p className="text-muted-foreground text-xs">{action.description}</p>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
