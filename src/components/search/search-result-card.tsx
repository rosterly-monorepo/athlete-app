"use client";

import React from "react";
import Link from "next/link";
import { Check, GraduationCap, Loader2, MapPin, Ruler, Trophy, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatHeight } from "@/lib/format";
import type { MatchResult } from "@/lib/requirements";
import type { AthleteSearchHit } from "@/services/types";
import { MatchBadgeStack } from "./match-badge";

interface SearchResultCardProps {
  hit: AthleteSearchHit;
  inPipeline?: boolean;
  isAdding?: boolean;
  onAddToBoard?: (athleteId: number) => void;
  matches?: MatchResult[];
}

export const SearchResultCard = React.memo(function SearchResultCard({
  hit,
  inPipeline,
  isAdding,
  onAddToBoard,
  matches = [],
}: SearchResultCardProps) {
  const initials = (hit.first_name?.[0] ?? "") + (hit.last_name?.[0] ?? "");

  return (
    <Card className="hover:bg-muted/30 flex gap-3 p-3 transition-colors">
      <Link href={`/coach/athletes/${hit.id}`} className="flex flex-1 gap-3">
        <Avatar className="h-12 w-12 shrink-0">
          {hit.avatar_url && <AvatarImage src={hit.avatar_url} alt={hit.full_name} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-medium">
              {hit.full_name || `${hit.first_name} ${hit.last_name}`}
            </h3>
          </div>

          {hit.primary_sport && (
            <div className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
              <Trophy className="h-3 w-3" />
              <span className="capitalize">{hit.primary_sport.replace(/_/g, " ")}</span>
              {hit.position && (
                <span className="text-muted-foreground/60">&middot; {hit.position}</span>
              )}
            </div>
          )}

          <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
            {hit.high_school_name && (
              <span className="flex items-center gap-1">
                <GraduationCap className="h-3 w-3" />
                {hit.high_school_name}
              </span>
            )}
            {hit.high_school_state && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {hit.high_school_state}
              </span>
            )}
            {hit.height_inches && (
              <span className="flex items-center gap-1">
                <Ruler className="h-3 w-3" />
                {formatHeight(hit.height_inches)}
              </span>
            )}
            {hit.graduation_year && <span>Class of {hit.graduation_year}</span>}
          </div>

          {matches.length > 0 && <MatchBadgeStack matches={matches} className="mt-2" />}
        </div>
      </Link>

      {inPipeline ? (
        <Badge variant="secondary" className="shrink-0 gap-1 self-center text-xs">
          <Check className="h-3 w-3" />
          In Pipeline
        </Badge>
      ) : onAddToBoard ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 self-center"
          disabled={isAdding}
          onClick={(e) => {
            e.preventDefault();
            onAddToBoard(hit.id);
          }}
          title="Add to recruitment pipeline"
        >
          {isAdding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
        </Button>
      ) : null}
    </Card>
  );
});
