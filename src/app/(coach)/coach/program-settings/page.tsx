"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyPrograms, useUpdateProgram } from "@/hooks/use-programs";
import { useUserRole } from "@/hooks/use-user-role";
import { formatSportCode } from "@/lib/format";
import { RequirementsEditor } from "@/components/coach/requirements-editor";
import { ProgramScoringConfig } from "@/components/composed/program-scoring-config";
import type { ProgramRequirements, ScoringConfig } from "@/services/types";

export default function ProgramSettingsPage() {
  const { isHeadCoach } = useUserRole();
  const { data: programs, isLoading } = useMyPrograms();
  const updateProgram = useUpdateProgram();

  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);

  // Set initial tab once programs load
  const effectiveTab =
    activeTab ?? (programs && programs.length > 0 ? String(programs[0].id) : undefined);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!programs || programs.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Program Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure academic requirements and performance benchmarks for your programs.
          </p>
        </div>
        <Card>
          <CardContent className="py-6">
            <p className="text-muted-foreground text-sm">
              No programs configured yet. Contact your administrator to set up a program.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSaveRequirements = (programId: number, requirements: ProgramRequirements) => {
    updateProgram.mutate({ programId, data: { requirements } });
  };

  const handleSaveScoring = (programId: number, data: { scoring_config: ScoringConfig }) => {
    updateProgram.mutate({ programId, data });
  };

  // Single program — no tabs needed
  if (programs.length === 1) {
    const program = programs[0];
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Program Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure academic requirements and performance benchmarks for{" "}
            {formatSportCode(program.sport_code)}.
          </p>
        </div>
        <div className="space-y-6">
          <RequirementsEditor
            key={`req-${program.updated_at}`}
            program={program}
            isEditable={isHeadCoach}
            onSave={(requirements) => handleSaveRequirements(program.id, requirements)}
            isSaving={updateProgram.isPending}
          />
          <ProgramScoringConfig
            key={`score-${program.updated_at}`}
            program={program}
            isEditable={isHeadCoach}
            onSave={(data) => handleSaveScoring(program.id, data)}
            isSaving={updateProgram.isPending}
          />
        </div>
      </div>
    );
  }

  // Multiple programs — use tabs
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Program Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure academic requirements and performance benchmarks for your programs.
        </p>
      </div>

      <Tabs value={effectiveTab} onValueChange={setActiveTab}>
        <TabsList>
          {programs.map((program) => (
            <TabsTrigger key={program.id} value={String(program.id)}>
              {formatSportCode(program.sport_code)}
            </TabsTrigger>
          ))}
        </TabsList>

        {programs.map((program) => (
          <TabsContent key={program.id} value={String(program.id)}>
            <div className="space-y-6">
              <RequirementsEditor
                key={`req-${program.updated_at}`}
                program={program}
                isEditable={isHeadCoach}
                onSave={(requirements) => handleSaveRequirements(program.id, requirements)}
                isSaving={updateProgram.isPending}
              />
              <ProgramScoringConfig
                key={`score-${program.updated_at}`}
                program={program}
                isEditable={isHeadCoach}
                onSave={(data) => handleSaveScoring(program.id, data)}
                isSaving={updateProgram.isPending}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
