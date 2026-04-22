import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatRequirementValue, type MatchResult } from "@/lib/requirements";

interface MatchBadgeProps {
  match: MatchResult;
  className?: string;
}

function variantFor(match: MatchResult): "success" | "muted" {
  return match.status === "met" ? "success" : "muted";
}

export function MatchBadge({ match, className }: MatchBadgeProps) {
  const variant = variantFor(match);
  const minText = formatRequirementValue(match.min_value, match.display_format, match.unit);
  const athleteText =
    match.athlete_value === null
      ? "—"
      : formatRequirementValue(match.athlete_value, match.display_format, match.unit);

  return (
    <Badge
      variant={variant}
      className={cn("gap-1 font-medium tabular-nums", className)}
      title={
        match.status === "unknown"
          ? `${match.label}: no data — minimum ${minText}`
          : `${match.label}: ${athleteText} (minimum ${minText})`
      }
    >
      <span className="text-[0.65rem] tracking-wide uppercase opacity-70">{match.label}</span>
      <span>{athleteText}</span>
      <span className="opacity-50">/ {minText}</span>
    </Badge>
  );
}

interface MatchBadgeStackProps {
  matches: MatchResult[];
  className?: string;
}

export function MatchBadgeStack({ matches, className }: MatchBadgeStackProps) {
  if (!matches.length) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {matches.map((m) => (
        <MatchBadge key={m.field_name} match={m} />
      ))}
    </div>
  );
}
