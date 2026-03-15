"use client";

import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { SportSelector } from "@/components/sports/sport-selector";
import { SportTabContent } from "@/components/sports/sport-tab-content";
import { useMySports } from "@/hooks/use-sports";

export default function SportsPage() {
  const { data: sports, isLoading, isError, error } = useMySports();
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);

  // Resolve the active tab — default to first sport
  const resolvedTab =
    activeTab && sports?.some((s) => s.sport_code === activeTab)
      ? activeTab
      : sports?.[0]?.sport_code;

  if (isLoading) {
    return <SportsPageSkeleton />;
  }

  if (isError) {
    return (
      <div className="max-w-2xl">
        <h1 className="mb-2 text-2xl font-bold">Sports</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive text-sm font-medium">
              Failed to load sports: {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold">Sports</h1>
          <p className="text-muted-foreground text-sm">
            Add your sports and fill in your athletic profile.
          </p>
        </div>
        <SportSelector existingSports={sports ?? []} />
      </div>

      {!sports || sports.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Dumbbell className="text-muted-foreground mx-auto mb-4 h-10 w-10" />
            <h3 className="mb-2 text-lg font-semibold">No sports yet</h3>
            <p className="text-muted-foreground mx-auto mb-6 max-w-md text-sm">
              Add a sport to start building your athletic profile. Coaches will be able to find you
              based on your sport-specific information.
            </p>
            <SportSelector existingSports={[]} />
          </CardContent>
        </Card>
      ) : sports.length === 1 ? (
        <SportTabContent sport={sports[0]} />
      ) : (
        <Tabs value={resolvedTab} onValueChange={setActiveTab}>
          <TabsList variant="line" className="mb-4 w-full justify-start">
            {sports.map((sport) => (
              <TabsTrigger key={sport.sport_code} value={sport.sport_code}>
                {sport.sport_name}
              </TabsTrigger>
            ))}
          </TabsList>
          {sports.map((sport) => (
            <TabsContent key={sport.sport_code} value={sport.sport_code}>
              <SportTabContent sport={sport} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

function SportsPageSkeleton() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Skeleton className="mb-2 h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      <Skeleton className="h-10 w-48" />
      <Skeleton className="mt-4 h-64 w-full rounded-xl" />
    </div>
  );
}
