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
    { step: "1", title: "Complete your athlete profile", description: "Add your sport, position, school, and bio.", href: "/profile" },
    { step: "2", title: "Add competition results", description: "Import or manually add your performance data.", href: "/performance" },
    { step: "3", title: "Make your profile public", description: "Share your profile with scouts and recruiters.", href: "/settings" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">
        Welcome back, {user?.firstName || "Athlete"}
      </h1>
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
              className="flex items-start gap-4 rounded-lg p-3 hover:bg-accent transition-colors"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                {action.step}
              </span>
              <div>
                <p className="font-medium text-sm">{action.title}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
