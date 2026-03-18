"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SportHeader } from "./sport-header";
import { SportConfigForm } from "./sport-config-form";
import { ReferenceCoachesSection } from "./reference-coaches-section";
import { RowingPerformancesSection } from "./rowing-performances-section";
import { IntegrationConnectionCard } from "@/components/integrations/integration-connection-card";
import type { AthleteSportDetail } from "@/services/types";

interface SportTabContentProps {
  sport: AthleteSportDetail;
}

export function SportTabContent({ sport }: SportTabContentProps) {
  return (
    <div className="space-y-6">
      <SportHeader sport={sport} />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="performances">Performances</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4 space-y-6">
          <SportConfigForm sportCode={sport.sport_code} />
          <ReferenceCoachesSection sportId={sport.id} />
        </TabsContent>

        <TabsContent value="performances" className="mt-4 space-y-6">
          <IntegrationConnectionCard sportCode={sport.sport_code} />
          {sport.sport_code === "rowing" && (
            <RowingPerformancesSection sportId={sport.id} sportCode={sport.sport_code} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
