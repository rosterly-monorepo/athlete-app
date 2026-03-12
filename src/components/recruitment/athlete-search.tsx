"use client";

import * as React from "react";
import { useDebounce } from "use-debounce";
import { useAthletes } from "@/hooks/use-athlete";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Athlete } from "@/services/types";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AthleteSearchProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  onSelect: (athlete: Athlete) => void;
  placeholder?: string;
  minQueryLength?: number;
  debounceMs?: number;
  maxResults?: number;
  emptyMessage?: string;
  renderResult?: (athlete: Athlete, onSelect: () => void) => React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const AthleteSearch = React.forwardRef<HTMLDivElement, AthleteSearchProps>(
  (
    {
      onSelect,
      placeholder = "Search athletes by name, school, or sport...",
      minQueryLength = 2,
      debounceMs = 300,
      maxResults,
      emptyMessage = "No athletes found",
      renderResult,
      className,
      ...props
    },
    ref
  ) => {
    const [query, setQuery] = React.useState("");
    const [debouncedQuery] = useDebounce(query, debounceMs);

    const { data, isLoading } = useAthletes(
      debouncedQuery.length >= minQueryLength ? { sport: debouncedQuery } : undefined
    );

    let athletes = data?.data ?? [];
    if (maxResults && athletes.length > maxResults) {
      athletes = athletes.slice(0, maxResults);
    }

    const showResults = query.length >= minQueryLength;

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {showResults && (
          <div className="border-border max-h-[300px] overflow-y-auto rounded-md border">
            {isLoading ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : athletes.length === 0 ? (
              <p className="text-muted-foreground p-4 text-center text-sm">{emptyMessage}</p>
            ) : (
              <div className="divide-y">
                {athletes.map((athlete) => {
                  if (renderResult) {
                    return (
                      <React.Fragment key={athlete.id}>
                        {renderResult(athlete, () => onSelect(athlete))}
                      </React.Fragment>
                    );
                  }

                  const initials = `${athlete.firstName[0]}${athlete.lastName[0]}`;
                  return (
                    <button
                      key={athlete.id}
                      type="button"
                      onClick={() => onSelect(athlete)}
                      className="hover:bg-muted flex w-full items-center gap-3 p-3 text-left transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={athlete.avatarUrl ?? undefined} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {athlete.firstName} {athlete.lastName}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {athlete.school} · {athlete.graduationYear} · {athlete.sport}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);
AthleteSearch.displayName = "AthleteSearch";

export { AthleteSearch };
