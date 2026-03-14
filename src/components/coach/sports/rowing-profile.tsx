"use client";

import { Award, Clock, Mail, Phone, Ruler, User, Weight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatErgTimeDetailed } from "@/lib/format";
import type { SportProfileProps } from "./sport-renderer";
import type { RowingConfigView, RowingPerformanceView } from "@/services/types";

const BOAT_LABELS: Record<string, string> = {
  "1x": "Single",
  "2x": "Double",
  "2-": "Pair",
  "4x": "Quad",
  "4+": "Coxed Four",
  "4-": "Straight Four",
  "8+": "Eight",
};

function formatBoatClass(code: string): string {
  return BOAT_LABELS[code] ?? code;
}

function ErgScoreItem({
  label,
  seconds,
  date,
  isNA,
}: {
  label: string;
  seconds: number | null;
  date: string | null;
  isNA: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-muted-foreground text-sm">{label}</span>
      <div className="text-right">
        {isNA ? (
          <span className="text-muted-foreground text-sm">N/A</span>
        ) : seconds != null ? (
          <>
            <span className="font-mono text-sm font-medium">{formatErgTimeDetailed(seconds)}</span>
            {date && (
              <span className="text-muted-foreground ml-2 text-xs">
                ({new Date(date).toLocaleDateString()})
              </span>
            )}
          </>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </div>
    </div>
  );
}

function ErgScoresCard({ config }: { config: RowingConfigView }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4" />
          Erg Scores
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y">
        <ErgScoreItem
          label="2k"
          seconds={config.best_2k_seconds}
          date={config.best_2k_date}
          isNA={config.erg_2k_na}
        />
        <ErgScoreItem
          label="5k"
          seconds={config.best_5k_seconds}
          date={config.best_5k_date}
          isNA={config.erg_5k_na}
        />
        <ErgScoreItem
          label="6k"
          seconds={config.best_6k_seconds}
          date={config.best_6k_date}
          isNA={config.erg_6k_na}
        />
        {config.best_2k_split != null && (
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground text-sm">2k Split</span>
            <span className="font-mono text-sm font-medium">
              {formatErgTimeDetailed(config.best_2k_split)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RowingDetailsCard({ config }: { config: RowingConfigView }) {
  const styles = [
    config.is_sculler && "Sculler",
    config.is_sweep && "Sweep",
    config.can_cox && "Cox",
  ].filter(Boolean);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-4 w-4" />
          Rowing Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Weight Class</span>
          <Badge variant="outline" className="capitalize">
            {config.weight_class === "lwt" ? "Lightweight" : "Open"}
          </Badge>
        </div>
        {config.primary_side && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Primary Side</span>
            <span className="capitalize">{config.primary_side}</span>
          </div>
        )}
        {styles.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Style</span>
            <span>{styles.join(" / ")}</span>
          </div>
        )}
        {config.primary_boats.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Primary Boats</span>
            <div className="flex flex-wrap gap-1">
              {config.primary_boats.map((b) => (
                <Badge key={b} variant="secondary" className="text-xs">
                  {formatBoatClass(b)}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {config.wingspan_inches != null && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Ruler className="h-3 w-3" />
              Wingspan
            </span>
            <span>
              {Math.floor(config.wingspan_inches / 12)}&apos;
              {config.wingspan_inches % 12}&quot;
            </span>
          </div>
        )}
        {config.seat_racing_weight_lbs != null && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Weight className="h-3 w-3" />
              Racing Weight
            </span>
            <span>{config.seat_racing_weight_lbs} lbs</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PerformanceTable({ performances }: { performances: RowingPerformanceView[] }) {
  if (performances.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="h-4 w-4" />
          Performance History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-left">
                <th className="pr-4 pb-2 font-medium">Date</th>
                <th className="pr-4 pb-2 font-medium">Event</th>
                <th className="pr-4 pb-2 font-medium">Time</th>
                <th className="pr-4 pb-2 font-medium">Split</th>
                <th className="pr-4 pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Place</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {performances.map((p) => (
                <tr key={p.id}>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {new Date(p.event_date).toLocaleDateString()}
                  </td>
                  <td className="py-2 pr-4">
                    <div>{p.event_name}</div>
                    {p.boat_class && (
                      <span className="text-muted-foreground text-xs">
                        {formatBoatClass(p.boat_class)}
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-4 font-mono">
                    {p.result_display}
                    {(p.is_personal_record || p.is_erg_record) && (
                      <Badge variant="secondary" className="ml-1 px-1 text-[10px]">
                        PR
                      </Badge>
                    )}
                  </td>
                  <td className="text-muted-foreground py-2 pr-4 font-mono">
                    {p.split_display ?? "—"}
                  </td>
                  <td className="py-2 pr-4">
                    <Badge variant="outline" className="text-xs capitalize">
                      {p.event_category}
                    </Badge>
                  </td>
                  <td className="py-2">{p.place != null ? `#${p.place}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function ReferenceCoachesList({
  coaches,
}: {
  coaches: { first_name: string; last_name: string; email: string | null; phone: string | null }[];
}) {
  if (coaches.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Reference Coaches</CardTitle>
      </CardHeader>
      <CardContent className="divide-y">
        {coaches.map((c, i) => (
          <div key={i} className="flex items-center justify-between py-2 text-sm">
            <span className="font-medium">
              {c.first_name} {c.last_name}
            </span>
            <div className="text-muted-foreground flex items-center gap-3">
              {c.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {c.email}
                </span>
              )}
              {c.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {c.phone}
                </span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function RowingProfile({ sport }: SportProfileProps) {
  const config = sport.config as unknown as RowingConfigView | null;
  const performances = (sport.performances ?? []) as unknown as RowingPerformanceView[];

  return (
    <div className="space-y-4">
      {config && (
        <div className="grid gap-4 sm:grid-cols-2">
          <ErgScoresCard config={config} />
          <RowingDetailsCard config={config} />
        </div>
      )}
      <PerformanceTable performances={performances} />
      <ReferenceCoachesList coaches={sport.reference_coaches} />
    </div>
  );
}
