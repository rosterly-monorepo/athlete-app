"use client";

import * as React from "react";
import { useAuth } from "@clerk/nextjs";
import { useDebounce } from "use-debounce";
import { useQuery } from "@tanstack/react-query";
import { searchAthletes } from "@/services/search";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AthleteSearchHit } from "@/services/types";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AthleteSearchProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  onSelect: (athlete: AthleteSearchHit) => void;
  placeholder?: string;
  minQueryLength?: number;
  debounceMs?: number;
  maxResults?: number;
  emptyMessage?: string;
  renderResult?: (athlete: AthleteSearchHit, onSelect: () => void) => React.ReactNode;
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
      maxResults = 10,
      emptyMessage = "No athletes found",
      renderResult,
      className,
      ...props
    },
    ref
  ) => {
    const [query, setQuery] = React.useState("");
    const [debouncedQuery] = useDebounce(query, debounceMs);
    const { getToken } = useAuth();

    const enabled = debouncedQuery.length >= minQueryLength;

    const { data, isLoading } = useQuery({
      queryKey: ["athlete-search-inline", debouncedQuery],
      queryFn: async () => {
        const token = await getToken();
        return searchAthletes(token!, {
          query: debouncedQuery,
          filters: {},
          sort_by: "_score",
          offset: 0,
          limit: maxResults,
        });
      },
      enabled,
    });

    const athletes = data?.hits ?? [];
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

                  const initials = (athlete.first_name?.[0] ?? "") + (athlete.last_name?.[0] ?? "");
                  return (
                    <button
                      key={athlete.id}
                      type="button"
                      onClick={() => onSelect(athlete)}
                      className="hover:bg-muted flex w-full items-center gap-3 p-3 text-left transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={athlete.avatar_url ?? undefined} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {athlete.first_name} {athlete.last_name}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {[
                            athlete.school ?? athlete.high_school_name,
                            athlete.graduation_year,
                            athlete.primary_sport,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
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
