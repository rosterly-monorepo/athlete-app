"use client";

import { useUser } from "@clerk/nextjs";
import { ArrowRight, EyeOff } from "lucide-react";
import Link from "next/link";
import { StatsGrid } from "@/components/composed/stats-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyProfile } from "@/hooks/use-athlete";
import { useAllFormSchemas } from "@/hooks/use-form-schema";
import { getOverallCompletion } from "@/lib/profile-completion";

export default function DashboardPage() {
  const { user } = useUser();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: schemas, isLoading: schemasLoading } = useAllFormSchemas();

  const profileData = profile as Record<string, unknown> | undefined;

  const sectionIds = schemas
    ? Object.entries(schemas)
        .filter(([, schema]) => !schema["x-ui-embedded-in"])
        .map(([id]) => id)
    : [];

  const isReady = !profileLoading && !schemasLoading;
  const completionPct = isReady ? getOverallCompletion(sectionIds, profileData) : 0;
  const isRecruitable = completionPct >= 100;

  const stats = [
    { label: "Profile Views", value: "—", note: "Coming soon" },
    { label: "Competition Results", value: "0", note: "Add your first result" },
    {
      label: "Profile Completion",
      value: isReady ? `${completionPct}%` : "—",
      note: isReady
        ? isRecruitable
          ? "Visible to coaches"
          : "Complete your profile"
        : "Loading...",
    },
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
      title: "Add your sports",
      description: "Select your sports and fill in your athletic profile.",
      href: "/sports",
    },
  ];

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Welcome back, {user?.firstName || "Athlete"}</h1>
      <p className="text-muted-foreground mb-8">
        Here&apos;s an overview of your athlete profile and recent activity.
      </p>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Profile completion</CardTitle>
            {isReady ? (
              <span className="text-sm font-medium">{completionPct}%</span>
            ) : (
              <Skeleton className="h-4 w-10" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isReady ? (
            <>
              <Progress value={completionPct} className="mb-4 h-2" />
              {isRecruitable ? (
                <p className="text-sm font-medium text-emerald-700">
                  Your profile is complete — you&apos;re visible to coaches and recruitable.
                </p>
              ) : (
                <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                  <EyeOff className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">You&apos;re not yet discoverable by coaches.</p>
                    <p className="text-amber-800">
                      Finish every required section to appear in coach search and become
                      recruitable.
                    </p>
                  </div>
                  <Button asChild size="sm" className="shrink-0 gap-1.5">
                    <Link href="/profile">
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              <Skeleton className="mb-4 h-2 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          )}
        </CardContent>
      </Card>

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
