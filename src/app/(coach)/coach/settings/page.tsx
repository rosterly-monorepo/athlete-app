"use client";

import { OrganizationProfile } from "@clerk/nextjs";
import { NylasConnectionCard } from "@/components/integrations/nylas/nylas-connection-card";

export default function CoachSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile, integrations, and organization settings.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Integrations</h2>
        <NylasConnectionCard />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Organization</h2>
        <OrganizationProfile
          routing="hash"
          appearance={{
            elements: {
              rootBox: "w-full",
              cardBox: "w-full shadow-none",
            },
          }}
        />
      </section>
    </div>
  );
}
