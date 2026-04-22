"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAvailableMetrics } from "@/hooks/use-programs";
import { useSearchFilters } from "@/hooks/use-athlete-search";
import { formatRequirementValue } from "@/lib/requirements";
import type {
  OrganizationProgram,
  ProgramMinimum,
  ProgramRequirements,
  SearchFilterSchema,
} from "@/services/types";

interface RequirementsEditorProps {
  program: OrganizationProgram;
  isEditable: boolean;
  isSaving: boolean;
  onSave: (requirements: ProgramRequirements) => void;
}

function parseOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function buildRequirements(
  gpa: string,
  rai: string,
  sportMetrics: Record<string, number | null>
): ProgramRequirements {
  const minimums: ProgramMinimum[] = [];
  const gpaVal = parseOrNull(gpa);
  if (gpaVal !== null) {
    minimums.push({ field_name: "gpa_unweighted", min_value: gpaVal });
  }
  const raiVal = parseOrNull(rai);
  if (raiVal !== null) {
    minimums.push({ field_name: "academic_index", min_value: raiVal });
  }
  for (const [field_name, min_value] of Object.entries(sportMetrics)) {
    if (min_value !== null) minimums.push({ field_name, min_value });
  }
  return { minimums };
}

function initialFromProgram(program: OrganizationProgram) {
  const minimums = program.requirements?.minimums ?? [];
  const byField = new Map(minimums.map((m) => [m.field_name, m.min_value]));
  return {
    gpa: byField.has("gpa_unweighted") ? String(byField.get("gpa_unweighted")) : "",
    rai: byField.has("academic_index") ? String(byField.get("academic_index")) : "",
    sportMetrics: Object.fromEntries(
      [...byField.entries()]
        .filter(([k]) => k !== "gpa_unweighted" && k !== "academic_index")
        .map(([k, v]) => [k, v])
    ) as Record<string, number | null>,
  };
}

export function RequirementsEditor({
  program,
  isEditable,
  isSaving,
  onSave,
}: RequirementsEditorProps) {
  const { data: metrics } = useAvailableMetrics(program.id);
  const { data: filterData } = useSearchFilters();
  const schemaByField = React.useMemo(() => {
    const schemas: SearchFilterSchema[] = filterData?.filters ?? [];
    return new Map(schemas.map((s) => [s.field, s]));
  }, [filterData]);

  const initial = React.useMemo(() => initialFromProgram(program), [program]);
  const [gpa, setGpa] = React.useState(initial.gpa);
  const [rai, setRai] = React.useState(initial.rai);
  const [sportMetrics, setSportMetrics] = React.useState<Record<string, number | null>>(
    initial.sportMetrics
  );

  const handleSave = () => {
    onSave(buildRequirements(gpa, rai, sportMetrics));
  };

  const setMetric = (field: string, value: number | null) => {
    setSportMetrics((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recruiting Minimums</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Academic minimums */}
        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`gpa-${program.id}`}>Minimum unweighted GPA</Label>
              <Input
                id={`gpa-${program.id}`}
                type="number"
                step="0.01"
                min="0"
                max="4"
                placeholder="e.g. 3.5"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                disabled={!isEditable || isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`rai-${program.id}`}>Minimum Rosterly Academic Index</Label>
              <Input
                id={`rai-${program.id}`}
                type="number"
                step="1"
                min="96"
                max="260"
                placeholder="e.g. 200"
                value={rai}
                onChange={(e) => setRai(e.target.value)}
                disabled={!isEditable || isSaving}
              />
            </div>
          </div>
        </section>

        {/* Sport metric minimums */}
        {metrics?.metrics?.length ? (
          <section className="space-y-4">
            <h3 className="text-sm font-medium">Performance minimums</h3>
            {metrics.metrics.map((m) => {
              const schema = schemaByField.get(m.field_name);
              const min = schema?.min ?? 0;
              const max = schema?.max ?? 100;
              const step = schema?.step ?? 1;
              const current = sportMetrics[m.field_name] ?? null;
              const enabled = current !== null;
              const value = current ?? (min + max) / 2;

              return (
                <div
                  key={m.field_name}
                  className="border-border/50 space-y-3 rounded-md border p-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{m.label}</p>
                      <p className="text-muted-foreground text-xs">{m.scorer_label}</p>
                    </div>
                    <Switch
                      checked={enabled}
                      disabled={!isEditable || isSaving}
                      onCheckedChange={(on) => setMetric(m.field_name, on ? value : null)}
                    />
                  </div>
                  {enabled && (
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-muted-foreground text-xs">Minimum</span>
                        <span className="text-sm font-medium tabular-nums">
                          {formatRequirementValue(value, m.display_format, m.unit)}
                        </span>
                      </div>
                      <Slider
                        min={min}
                        max={max}
                        step={step}
                        value={[value]}
                        onValueChange={(v) => setMetric(m.field_name, v[0])}
                        disabled={!isEditable || isSaving}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        ) : null}

        {isEditable && (
          <div>
            <Button onClick={handleSave} disabled={isSaving} size="sm">
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
