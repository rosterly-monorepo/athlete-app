"use client";

import { useMemo } from "react";
import { ArrowUpDown, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import type { OrderingMetric } from "@/services/types";

interface OrderingPanelProps {
  metrics: OrderingMetric[];
  selectedSports: string[];
  metricWeights: Record<string, number>;
  onWeightChange: (field: string, weight: number) => void;
  onClear: () => void;
}

export function OrderingPanel({
  metrics,
  selectedSports,
  metricWeights,
  onWeightChange,
  onClear,
}: OrderingPanelProps) {
  const visibleMetrics = useMemo(
    () => metrics.filter((m) => selectedSports.includes(m.sport_code)),
    [metrics, selectedSports]
  );

  const activeCount = useMemo(
    () => Object.values(metricWeights).filter((w) => w > 0).length,
    [metricWeights]
  );

  if (visibleMetrics.length === 0) return null;

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="text-muted-foreground h-4 w-4" />
            <h2 className="text-sm font-semibold">Ordering</h2>
            {activeCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {activeCount}
              </Badge>
            )}
          </div>
          {activeCount > 0 && (
            <button
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs"
              onClick={onClear}
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>

        <p className="text-muted-foreground text-[11px]">
          Control how athletes are ranked. Higher weight = more important.
        </p>

        <div className="space-y-4">
          {visibleMetrics.map((metric) => (
            <MetricWeightSlider
              key={metric.field}
              metric={metric}
              weight={metricWeights[metric.field] ?? 0}
              onChange={(w) => onWeightChange(metric.field, w)}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

// ── Individual metric slider ──

interface MetricWeightSliderProps {
  metric: OrderingMetric;
  weight: number;
  onChange: (weight: number) => void;
}

function MetricWeightSlider({ metric, weight, onChange }: MetricWeightSliderProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-muted-foreground text-xs">{metric.label}</label>
        <span className="text-muted-foreground text-[11px] tabular-nums">
          {weight > 0 ? `${weight}%` : "Off"}
        </span>
      </div>
      <Slider min={0} max={100} step={5} value={[weight]} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}
