"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { RosterlyLoader } from "@/components/ui/dot-loader";
import { useSearchFilters, useAthleteSearch, useSearchState } from "@/hooks/use-athlete-search";
import { useMyPrograms } from "@/hooks/use-programs";
import { useAddRecord, usePipelineAthleteIds } from "@/hooks/use-recruitment";
import { seedFiltersFromRequirements } from "@/lib/requirements";
import { SearchFilterPanel } from "./search-filter-panel";
import { OrderingPanel } from "./ordering-panel";
import { SearchProgramPicker } from "./search-program-picker";
import { SearchResultsPanel } from "./search-results-panel";

function SearchPageContent() {
  const {
    data: filterData,
    isLoading: filtersLoading,
    error: filtersError,
    refetch: refetchFilters,
  } = useSearchFilters();
  const { data: programs } = useMyPrograms();
  const urlSearchParams = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filterSchemas = useMemo(() => filterData?.filters ?? [], [filterData]);
  const filterGroups = filterData?.groups ?? [];
  const sortOptions = useMemo(() => filterData?.sort_options ?? [], [filterData]);

  const {
    filterValues,
    query,
    sortBy,
    page,
    pageSize,
    searchParams,
    activeFilterCount,
    hasUnappliedChanges,
    metricWeights,
    hasActiveWeights,
    setFilter,
    clearFilter,
    clearAllFilters,
    clearGroupFilters,
    applyFilters,
    setQuery,
    setSortBy,
    setPage,
    setMetricWeight,
    clearMetricWeights,
  } = useSearchState(filterSchemas);

  const orderingMetrics = useMemo(() => filterData?.ordering_metrics ?? [], [filterData]);

  const {
    data: searchData,
    isLoading: searchLoading,
    isFetching: searchFetching,
    error: searchError,
  } = useAthleteSearch(searchParams);

  const aggregations = searchData?.aggregations ?? {};

  // Filter sort options by selected sports
  const selectedSports = useMemo(
    () => (filterValues.sports as string[] | undefined) ?? [],
    [filterValues.sports]
  );
  const visibleSortOptions = useMemo(
    () => sortOptions.filter((o) => o.sport_code === null || selectedSports.includes(o.sport_code)),
    [sortOptions, selectedSports]
  );

  // Reset sort to relevance if current sort's sport is deselected
  useEffect(() => {
    const currentSort = sortOptions.find((o) => o.value === sortBy);
    if (currentSort?.sport_code && !selectedSports.includes(currentSort.sport_code)) {
      setSortBy("_score");
    }
  }, [selectedSports, sortBy, sortOptions, setSortBy]);

  // Resolve the active program from the URL (?program=<id>), falling back to the first program.
  const selectedProgram = useMemo(() => {
    if (!programs?.length) return null;
    const raw = urlSearchParams.get("program");
    const id = raw ? Number(raw) : NaN;
    return (id && programs.find((p) => p.id === id)) || programs[0];
  }, [programs, urlSearchParams]);

  // One-shot defaults applied when the page mounts with a resolved program + schemas.
  const defaultsApplied = useRef(false);
  useEffect(() => {
    if (defaultsApplied.current) return;
    if (!selectedProgram) return;
    if (!filterSchemas.length) return;

    // Sport filter: program's sport_code, unless the URL overrides.
    if (!urlSearchParams.has("sports")) {
      setFilter("sports", [selectedProgram.sport_code]);
    }

    // Requirement-driven range defaults (URL values win — seed checks `existing` first).
    const seeded = seedFiltersFromRequirements(filterSchemas, selectedProgram.requirements, {});
    for (const [field, value] of Object.entries(seeded)) {
      if (urlSearchParams.has(field)) continue;
      setFilter(field, value);
    }

    defaultsApplied.current = true;
  }, [selectedProgram, filterSchemas, urlSearchParams, setFilter]);

  const handleFilterChange = useCallback(
    (field: string, value: unknown) => {
      if (value === undefined || value === null) {
        clearFilter(field);
      } else {
        setFilter(field, value);
      }
    },
    [setFilter, clearFilter]
  );

  // ── Pipeline state ──
  const programIds = useMemo(() => (programs ?? []).map((p) => p.id), [programs]);
  const { data: pipelineAthleteIdList } = usePipelineAthleteIds(programIds);
  const pipelineAthleteIds = useMemo(
    () => new Set(pipelineAthleteIdList ?? []),
    [pipelineAthleteIdList]
  );

  // Adding-to-board uses the actively selected program.
  const defaultProgramId = selectedProgram?.id;
  const addRecord = useAddRecord(defaultProgramId ?? 0);
  const [addingAthleteId, setAddingAthleteId] = useState<number | null>(null);

  const handleAddToBoard = useCallback(
    (athleteId: number) => {
      if (!defaultProgramId) return;
      setAddingAthleteId(athleteId);
      addRecord.mutate(
        { athlete_id: athleteId },
        {
          onSettled: () => setAddingAthleteId(null),
          onSuccess: () => {
            // Optimistically add to local pipeline set
            pipelineAthleteIds.add(athleteId);
          },
        }
      );
    },
    [defaultProgramId, addRecord, pipelineAthleteIds]
  );

  if (filtersLoading) {
    return <RosterlyLoader />;
  }

  if (filtersError) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center py-16">
        <AlertCircle className="mb-3 h-10 w-10 opacity-40" />
        <p className="text-sm">Failed to load search filters</p>
        <Button variant="ghost" size="sm" className="mt-2" onClick={() => refetchFilters()}>
          Try again
        </Button>
      </div>
    );
  }

  const filterPanel = (
    <SearchFilterPanel
      filters={filterSchemas}
      groups={filterGroups}
      filterValues={filterValues}
      aggregations={aggregations}
      activeFilterCount={activeFilterCount}
      hasUnappliedChanges={hasUnappliedChanges}
      onFilterChange={handleFilterChange}
      onClearGroup={clearGroupFilters}
      onClearAll={clearAllFilters}
      onApply={applyFilters}
    />
  );

  const orderingPanel = (
    <OrderingPanel
      metrics={orderingMetrics}
      selectedSports={selectedSports}
      metricWeights={metricWeights}
      onWeightChange={setMetricWeight}
      onClear={clearMetricWeights}
    />
  );

  return (
    <div className="flex h-full gap-6">
      {/* Desktop sidebar — Filters and Ordering as distinct cards */}
      <aside className="hidden w-72 shrink-0 space-y-4 overflow-y-auto pr-4 md:block">
        {filterPanel}
        {orderingPanel}
      </aside>

      {/* Mobile filter trigger */}
      <div className="fixed right-4 bottom-20 z-40 md:hidden">
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetTrigger asChild>
            <Button size="sm" className="gap-2 shadow-lg">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount.total > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                  {activeFilterCount.total}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters & Ordering</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              {filterPanel}
              {orderingPanel}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Results */}
      <SearchResultsPanel
        query={query}
        sortBy={sortBy}
        sortOptions={visibleSortOptions}
        page={page}
        pageSize={pageSize}
        data={searchData}
        isLoading={searchLoading}
        isFetching={searchFetching}
        error={searchError}
        pipelineAthleteIds={pipelineAthleteIds}
        addingAthleteId={addingAthleteId}
        hasActiveWeights={hasActiveWeights}
        onQueryChange={setQuery}
        onSortChange={setSortBy}
        onPageChange={setPage}
        onAddToBoard={defaultProgramId ? handleAddToBoard : undefined}
        programPicker={
          programs && programs.length > 0 ? (
            <SearchProgramPicker
              programs={programs}
              selectedProgramId={selectedProgram?.id ?? null}
            />
          ) : null
        }
        requirements={selectedProgram?.requirements ?? null}
        filterSchemas={filterSchemas}
      />
    </div>
  );
}

export function AthleteSearchPage() {
  return (
    <Suspense fallback={<RosterlyLoader />}>
      <SearchPageContent />
    </Suspense>
  );
}
