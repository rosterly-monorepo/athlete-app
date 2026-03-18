"use client";

import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAvailableMetrics } from "@/hooks/use-programs";
import type { OrganizationProgram, ScoringConfig, MetricWeight } from "@/services/types";

interface ProgramScoringConfigProps {
  program: OrganizationProgram;
  isEditable: boolean;
  onSave: (data: { scoring_config: ScoringConfig }) => void;
  isSaving: boolean;
}

/**
 * Card for configuring performance metric weights on a program.
 *
 * To reset local form state when the program data changes externally,
 * pass a `key` prop from the parent that changes on save (e.g. `program.updated_at`).
 */
export function ProgramScoringConfig({
  program,
  isEditable,
  onSave,
  isSaving,
}: ProgramScoringConfigProps) {
  const { data: availableMetrics, isLoading } = useAvailableMetrics(program.id);

  // Build initial metrics once from available + saved config.
  // Parent should use `key` prop to remount when program data changes.
  const initialMetrics = useMemo(() => {
    if (!availableMetrics) return [];
    const existing = program.scoring_config?.metrics ?? [];
    return availableMetrics.metrics.map((available) => {
      const saved = existing.find((m) => m.field_name === available.field_name);
      return {
        field_name: available.field_name,
        weight: saved?.weight ?? available.default_weight,
        enabled: saved?.enabled ?? false,
      };
    });
  }, [availableMetrics, program.scoring_config]);

  const [metrics, setMetrics] = useState<MetricWeight[]>(initialMetrics);

  // Keep metrics in sync with initialMetrics when it goes from empty to populated
  // (first load of available metrics). This is safe because we only go [] -> [items].
  if (metrics.length === 0 && initialMetrics.length > 0) {
    setMetrics(initialMetrics);
  }

  const toggleMetric = useCallback((fieldName: string) => {
    setMetrics((prev) =>
      prev.map((m) => (m.field_name === fieldName ? { ...m, enabled: !m.enabled } : m))
    );
  }, []);

  const updateWeight = useCallback((fieldName: string, weight: number) => {
    setMetrics((prev) => prev.map((m) => (m.field_name === fieldName ? { ...m, weight } : m)));
  }, []);

  // Compute total weight of enabled metrics for normalization display
  const totalWeight = useMemo(
    () => metrics.filter((m) => m.enabled).reduce((sum, m) => sum + m.weight, 0),
    [metrics]
  );

  const getPercentage = useCallback(
    (weight: number, enabled: boolean) => {
      if (!enabled || totalWeight === 0) return 0;
      return Math.round((weight / totalWeight) * 100);
    },
    [totalWeight]
  );

  const handleSave = () => {
    onSave({ scoring_config: { metrics } });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance Benchmarks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-5 w-9" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!availableMetrics || availableMetrics.metrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance Benchmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No configurable performance metrics available for this sport.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Performance Benchmarks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {availableMetrics.metrics.map((available) => {
            const metric = metrics.find((m) => m.field_name === available.field_name);
            if (!metric) return null;

            const percentage = getPercentage(metric.weight, metric.enabled);

            return (
              <div key={available.field_name} className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={metric.enabled}
                      onCheckedChange={() => toggleMetric(available.field_name)}
                      disabled={!isEditable || isSaving}
                      aria-label={`Toggle ${available.label}`}
                    />
                    <div>
                      <Label className="text-sm font-medium">{available.label}</Label>
                      {available.unit && (
                        <span className="text-muted-foreground ml-1 text-xs">
                          ({available.unit})
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-muted-foreground w-12 text-right text-sm tabular-nums">
                    {metric.enabled ? `${percentage}%` : "off"}
                  </span>
                </div>

                {metric.enabled && (
                  <div className="flex items-center gap-3 pl-12">
                    <Slider
                      value={[metric.weight]}
                      onValueChange={([val]) => updateWeight(available.field_name, val)}
                      min={1}
                      max={100}
                      step={1}
                      disabled={!isEditable || isSaving}
                      className="flex-1"
                    />
                    <span className="text-muted-foreground w-8 text-right text-xs tabular-nums">
                      {metric.weight}
                    </span>
                  </div>
                )}

                <p className="text-muted-foreground pl-12 text-xs">{available.scorer_label}</p>
              </div>
            );
          })}
        </div>

        {isEditable && (
          <div className="mt-6">
            <Button onClick={handleSave} disabled={isSaving} size="sm">
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
