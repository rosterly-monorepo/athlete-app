"use client";

import { useCallback } from "react";
import { AlertCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RosterlyLoader } from "@/components/ui/dot-loader";
import { SearchResultCard } from "./search-result-card";
import { SearchSortSelect } from "./search-sort-select";
import type { AthleteSearchResponse, SortOption } from "@/services/types";

interface SearchResultsPanelProps {
  query: string;
  sortBy: string;
  sortOptions: SortOption[];
  page: number;
  pageSize: number;
  data: AthleteSearchResponse | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  pipelineAthleteIds?: Set<number>;
  addingAthleteId?: number | null;
  hasActiveWeights?: boolean;
  onQueryChange: (q: string) => void;
  onSortChange: (sort: string) => void;
  onPageChange: (page: number) => void;
  onAddToBoard?: (athleteId: number) => void;
}

export function SearchResultsPanel({
  query,
  sortBy,
  sortOptions,
  page,
  pageSize,
  data,
  isLoading,
  isFetching,
  error,
  pipelineAthleteIds,
  addingAthleteId,
  hasActiveWeights,
  onQueryChange,
  onSortChange,
  onPageChange,
  onAddToBoard,
}: SearchResultsPanelProps) {
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  const renderPagination = useCallback(() => {
    if (totalPages <= 1) return null;

    const pages: (number | "...")[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }

    return (
      <div className="flex items-center justify-center gap-1 pt-4">
        <Button
          variant="ghost"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="text-muted-foreground px-2">
              ...
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "default" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          )
        )}
        <Button
          variant="ghost"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    );
  }, [totalPages, page, onPageChange]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search by name, school, or sport..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {data ? (
            <>
              {data.total.toLocaleString()} athlete{data.total !== 1 && "s"} found
              {isFetching && !isLoading && <span className="ml-2 text-xs">Updating...</span>}
            </>
          ) : isLoading ? (
            "Searching..."
          ) : (
            "Enter search criteria"
          )}
        </p>
        {hasActiveWeights ? (
          <span className="bg-muted text-muted-foreground rounded-md px-3 py-1 text-xs font-medium">
            Performance Ranking
          </span>
        ) : (
          <SearchSortSelect value={sortBy} options={sortOptions} onChange={onSortChange} />
        )}
      </div>

      {/* Results list */}
      {error ? (
        <div className="text-muted-foreground flex flex-col items-center justify-center py-16">
          <AlertCircle className="mb-3 h-10 w-10 opacity-40" />
          <p className="text-sm">Search failed</p>
          <p className="mt-1 text-xs">Please try again or adjust your filters</p>
        </div>
      ) : isLoading ? (
        <RosterlyLoader />
      ) : data && data.hits.length > 0 ? (
        <div className="space-y-2">
          {data.hits.map((hit) => (
            <SearchResultCard
              key={hit.id}
              hit={hit}
              inPipeline={pipelineAthleteIds?.has(hit.id)}
              isAdding={addingAthleteId === hit.id}
              onAddToBoard={onAddToBoard}
            />
          ))}
        </div>
      ) : data ? (
        <div className="text-muted-foreground flex flex-col items-center justify-center py-16">
          <Search className="mb-3 h-10 w-10 opacity-40" />
          <p className="text-sm">No athletes match your criteria</p>
          <p className="mt-1 text-xs">Try adjusting your filters or search query</p>
        </div>
      ) : null}

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
}
