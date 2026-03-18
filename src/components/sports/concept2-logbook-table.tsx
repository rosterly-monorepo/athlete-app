"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useConcept2Logbook } from "@/hooks/use-sports";
import { formatDistance } from "@/lib/format";
import type { Concept2LogbookEntry } from "@/services/types";

const STANDARD_DISTANCE_LABELS: Record<number, string> = {
  2000: "2K",
  5000: "5K",
  6000: "6K",
};

function EntryTags({ entry }: { entry: Concept2LogbookEntry }) {
  const tags: { label: string; variant: "default" | "secondary" | "outline" }[] = [];

  if (entry.is_best_prorata && entry.prorata_standard_distance) {
    const label = STANDARD_DISTANCE_LABELS[entry.prorata_standard_distance] ?? "";
    tags.push({ label: `Best ${label}`, variant: "default" });
  }

  if (entry.is_selected) {
    tags.push({ label: "Selected", variant: "secondary" });
  }

  if (entry.is_erg_record) {
    tags.push({ label: "PR", variant: "outline" });
  }

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <Badge key={t.label} variant={t.variant} className="px-1.5 py-0 text-[10px]">
          {t.label}
        </Badge>
      ))}
    </div>
  );
}

function ProRataCell({ entry }: { entry: Concept2LogbookEntry }) {
  if (!entry.prorata_display || !entry.prorata_standard_distance) {
    return <span className="text-muted-foreground">&mdash;</span>;
  }

  const label = STANDARD_DISTANCE_LABELS[entry.prorata_standard_distance] ?? "";

  return (
    <span className="font-mono text-sm">
      {entry.prorata_display}
      <span className="text-muted-foreground ml-1 text-xs">({label})</span>
    </span>
  );
}

export function Concept2LogbookTable() {
  const { data, isLoading } = useConcept2Logbook();

  if (isLoading) return null;
  if (!data || data.entries.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          Concept2 Logbook
          <Badge variant="outline" className="text-xs font-normal">
            {data.entries.length} workouts
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-left">
                <th className="pr-4 pb-2 font-medium">Date</th>
                <th className="pr-4 pb-2 font-medium">Distance</th>
                <th className="pr-4 pb-2 font-medium">Time</th>
                <th className="pr-4 pb-2 font-medium">Pro-Rata</th>
                <th className="pr-4 pb-2 font-medium">Split</th>
                <th className="pr-4 pb-2 font-medium">Rate</th>
                <th className="pr-4 pb-2 font-medium">HR</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {new Date(entry.event_date).toLocaleDateString()}
                  </td>
                  <td className="py-2 pr-4 font-mono">
                    {entry.distance_meters != null
                      ? formatDistance(entry.distance_meters)
                      : "\u2014"}
                  </td>
                  <td className="py-2 pr-4 font-mono font-medium">{entry.result_display}</td>
                  <td className="py-2 pr-4">
                    <ProRataCell entry={entry} />
                  </td>
                  <td className="text-muted-foreground py-2 pr-4 font-mono">
                    {entry.split_display ?? "\u2014"}
                  </td>
                  <td className="text-muted-foreground py-2 pr-4">
                    {entry.stroke_rate_avg != null ? `${entry.stroke_rate_avg}` : "\u2014"}
                  </td>
                  <td className="text-muted-foreground py-2 pr-4">
                    {entry.heart_rate_avg != null ? `${entry.heart_rate_avg}` : "\u2014"}
                  </td>
                  <td className="py-2">
                    <EntryTags entry={entry} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
