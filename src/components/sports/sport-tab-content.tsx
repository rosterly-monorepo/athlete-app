"use client";

import { Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SportConfigForm } from "./sport-config-form";
import { ReferenceCoachesSection } from "./reference-coaches-section";
import { IntegrationConnectionCard } from "@/components/integrations/integration-connection-card";
import { useRemoveSport, useUpdateSport } from "@/hooks/use-sports";
import type { AthleteSportDetail } from "@/services/types";

interface SportTabContentProps {
  sport: AthleteSportDetail;
}

export function SportTabContent({ sport }: SportTabContentProps) {
  const removeSport = useRemoveSport();
  const updateSport = useUpdateSport();

  const handleRemove = () => {
    if (
      confirm(`Remove ${sport.sport_name} from your profile? This will delete all associated data.`)
    ) {
      removeSport.mutate(sport.id);
    }
  };

  const handleSetPrimary = () => {
    updateSport.mutate({ sportId: sport.id, data: { is_primary: true } });
  };

  return (
    <div className="space-y-6">
      {/* Sport header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{sport.sport_name}</h2>
          {sport.is_primary && (
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3" />
              Primary
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {!sport.is_primary && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSetPrimary}
              disabled={updateSport.isPending}
            >
              Set as Primary
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={handleRemove}
            disabled={removeSport.isPending}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Remove
          </Button>
        </div>
      </div>

      {/* Sport-specific config form */}
      <SportConfigForm sportCode={sport.sport_code} />

      {/* Reference coaches */}
      <ReferenceCoachesSection sportId={sport.id} />

      {/* External integrations (e.g., Concept2 for rowing) */}
      <IntegrationConnectionCard sportCode={sport.sport_code} />
    </div>
  );
}
