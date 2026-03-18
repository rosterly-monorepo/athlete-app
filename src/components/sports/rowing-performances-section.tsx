"use client";

import { PerformanceCollection } from "./performance-collection";

interface RowingPerformancesSectionProps {
  sportId: number;
  sportCode: string;
}

/**
 * Rowing-specific performance content.
 *
 * All performances (manual + Concept2 synced) appear in a single unified table.
 * Extension point for adding race results, analytics, etc.
 */
export function RowingPerformancesSection({ sportId, sportCode }: RowingPerformancesSectionProps) {
  return (
    <div className="space-y-6">
      <PerformanceCollection sportId={sportId} sportCode={sportCode} />
    </div>
  );
}
