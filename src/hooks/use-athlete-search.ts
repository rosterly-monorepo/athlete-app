"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { getSearchFilters, searchAthletes } from "@/services/search";
import type {
  AthleteSearchRequest,
  AthleteSearchResponse,
  SearchFiltersResponse,
  SearchFilterSchema,
} from "@/services/types";

// ── Query Keys ──

export const searchKeys = {
  all: ["search"] as const,
  filters: ["search", "filters"] as const,
  results: (params: AthleteSearchRequest) => ["search", "results", params] as const,
};

// ── Filter Schema Hook ──

export function useSearchFilters() {
  const { getToken } = useAuth();

  return useQuery<SearchFiltersResponse>({
    queryKey: searchKeys.filters,
    queryFn: async () => {
      const token = await getToken();
      return getSearchFilters(token!);
    },
    staleTime: Infinity,
  });
}

// ── Search Results Hook ──

export function useAthleteSearch(params: AthleteSearchRequest | null) {
  const { getToken } = useAuth();

  return useQuery<AthleteSearchResponse>({
    queryKey: params ? searchKeys.results(params) : searchKeys.all,
    queryFn: async () => {
      const token = await getToken();
      return searchAthletes(token!, params!);
    },
    enabled: !!params,
    placeholderData: keepPreviousData,
  });
}

// ── URL Serialization ──

type FilterValues = Record<string, unknown>;
type MetricWeights = Record<string, number>;

function serializeFiltersToParams(
  filters: FilterValues,
  schemas: SearchFilterSchema[],
  query: string,
  sortBy: string,
  page: number,
  metricWeights: MetricWeights
): URLSearchParams {
  const params = new URLSearchParams();

  if (query) params.set("q", query);
  if (sortBy !== "_score") params.set("sort", sortBy);
  if (page > 1) params.set("page", String(page));

  // Serialize metric weights: "field1:60,field2:40"
  const weightEntries = Object.entries(metricWeights).filter(([, w]) => w > 0);
  if (weightEntries.length > 0) {
    params.set("weights", weightEntries.map(([f, w]) => `${f}:${w}`).join(","));
  }

  const schemaMap = new Map(schemas.map((s) => [s.field, s]));

  for (const [key, value] of Object.entries(filters)) {
    if (value === null || value === undefined) continue;
    const schema = schemaMap.get(key);
    if (!schema) continue;

    switch (schema.value_type) {
      case "range":
        if (Array.isArray(value) && value.length === 2) {
          params.set(key, `${value[0]},${value[1]}`);
        }
        break;
      case "set":
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(","));
        }
        break;
      case "boolean":
        if (value === true) params.set(key, "true");
        break;
    }
  }

  return params;
}

function parseParamsToFilters(
  searchParams: URLSearchParams,
  filterSchemas: SearchFilterSchema[]
): {
  filters: FilterValues;
  query: string;
  sortBy: string;
  page: number;
  metricWeights: MetricWeights;
} {
  const filters: FilterValues = {};
  const query = searchParams.get("q") || "";
  const sortBy = searchParams.get("sort") || "_score";
  const page = Number(searchParams.get("page")) || 1;

  // Parse metric weights: "field1:60,field2:40"
  const metricWeights: MetricWeights = {};
  const weightsRaw = searchParams.get("weights");
  if (weightsRaw) {
    for (const pair of weightsRaw.split(",")) {
      const colonIdx = pair.lastIndexOf(":");
      if (colonIdx > 0) {
        const field = pair.slice(0, colonIdx);
        const weight = Number(pair.slice(colonIdx + 1));
        if (!isNaN(weight) && weight > 0) {
          metricWeights[field] = weight;
        }
      }
    }
  }

  for (const schema of filterSchemas) {
    const raw = searchParams.get(schema.field);
    if (!raw) continue;

    switch (schema.value_type) {
      case "range": {
        const parts = raw.split(",").map(Number);
        if (parts.length === 2 && parts.every((n) => !isNaN(n))) {
          filters[schema.field] = parts;
        }
        break;
      }
      case "set":
        filters[schema.field] = raw.split(",");
        break;
      case "boolean":
        filters[schema.field] = raw === "true";
        break;
    }
  }

  return { filters, query, sortBy, page, metricWeights };
}

// ── Search State Hook ──

const PAGE_SIZE = 20;

export function useSearchState(filterSchemas: SearchFilterSchema[]) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse initial state from URL
  const initial = useMemo(
    () => parseParamsToFilters(searchParams, filterSchemas),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // Only parse on mount
  );

  // Draft filter values — updated instantly as the user interacts
  const [filterValues, setFilterValues] = useState<FilterValues>(initial.filters);
  // Applied filter values — only updated on "Apply" click, drives the actual search
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>(initial.filters);

  const [query, setQuery] = useState(initial.query);
  const [sortBy, setSortBy] = useState(initial.sortBy);
  const [page, setPage] = useState(initial.page);
  const [metricWeights, setMetricWeightsState] = useState<MetricWeights>(initial.metricWeights);

  // Debounce query only (text search still auto-fires)
  const [debouncedQuery] = useDebounce(query, 300);

  // Whether any metric weights are active
  const hasActiveWeights = useMemo(
    () => Object.values(metricWeights).some((w) => w > 0),
    [metricWeights]
  );

  // Track whether draft differs from applied
  const hasUnappliedChanges = useMemo(() => {
    const draftKeys = Object.keys(filterValues);
    const appliedKeys = Object.keys(appliedFilters);
    if (draftKeys.length !== appliedKeys.length) return true;
    for (const key of draftKeys) {
      if (JSON.stringify(filterValues[key]) !== JSON.stringify(appliedFilters[key])) {
        return true;
      }
    }
    return false;
  }, [filterValues, appliedFilters]);

  // Build the API request params from APPLIED filters
  const searchParams_ = useMemo<AthleteSearchRequest>(() => {
    // Convert UI weights (0-100) to API weights (0-1) and filter out zeros
    const apiWeights: Record<string, number> = {};
    for (const [field, weight] of Object.entries(metricWeights)) {
      if (weight > 0) {
        apiWeights[field] = weight / 100;
      }
    }
    const hasWeights = Object.keys(apiWeights).length > 0;

    return {
      query: debouncedQuery || undefined,
      filters: appliedFilters,
      sort_by: hasWeights ? "_score" : sortBy,
      metric_weights: hasWeights ? apiWeights : undefined,
      offset: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
    };
  }, [appliedFilters, debouncedQuery, sortBy, page, metricWeights]);

  // Sync to URL
  const syncUrl = useCallback(
    (filters: FilterValues, q: string, sort: string, p: number, weights: MetricWeights) => {
      const params = serializeFiltersToParams(filters, filterSchemas, q, sort, p, weights);
      const paramString = params.toString();
      const newUrl = paramString ? `?${paramString}` : window.location.pathname;
      router.replace(newUrl, { scroll: false });
    },
    [router, filterSchemas]
  );

  // Update draft filter (does NOT trigger search)
  const setFilter = useCallback((field: string, value: unknown) => {
    setFilterValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const clearFilter = useCallback((field: string) => {
    setFilterValues((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilterValues({});
    setAppliedFilters({});
    setPage(1);
    syncUrl({}, query, sortBy, 1, metricWeights);
  }, [query, sortBy, metricWeights, syncUrl]);

  const clearGroupFilters = useCallback(
    (groupKey: string) => {
      setFilterValues((prev) => {
        const next = { ...prev };
        for (const schema of filterSchemas) {
          if (schema.group === groupKey) {
            delete next[schema.field];
          }
        }
        return next;
      });
    },
    [filterSchemas]
  );

  // Apply: commit draft → applied, trigger search + URL sync
  const applyFilters = useCallback(() => {
    setAppliedFilters(filterValues);
    setPage(1);
    syncUrl(filterValues, query, sortBy, 1, metricWeights);
  }, [filterValues, query, sortBy, metricWeights, syncUrl]);

  const handleSetQuery = useCallback(
    (q: string) => {
      setQuery(q);
      setPage(1);
      syncUrl(appliedFilters, q, sortBy, 1, metricWeights);
    },
    [appliedFilters, sortBy, metricWeights, syncUrl]
  );

  const handleSetSortBy = useCallback(
    (sort: string) => {
      setSortBy(sort);
      setPage(1);
      syncUrl(appliedFilters, query, sort, 1, metricWeights);
    },
    [appliedFilters, query, metricWeights, syncUrl]
  );

  const handleSetPage = useCallback(
    (p: number) => {
      setPage(p);
      syncUrl(appliedFilters, query, sortBy, p, metricWeights);
    },
    [appliedFilters, query, sortBy, metricWeights, syncUrl]
  );

  // Metric weight handlers — fire immediately (like sort)
  const setMetricWeight = useCallback(
    (field: string, weight: number) => {
      setMetricWeightsState((prev) => {
        const next = { ...prev };
        if (weight <= 0) {
          delete next[field];
        } else {
          next[field] = weight;
        }
        setPage(1);
        syncUrl(appliedFilters, query, sortBy, 1, next);
        return next;
      });
    },
    [appliedFilters, query, sortBy, syncUrl]
  );

  const clearMetricWeights = useCallback(() => {
    setMetricWeightsState({});
    setPage(1);
    syncUrl(appliedFilters, query, sortBy, 1, {});
  }, [appliedFilters, query, sortBy, syncUrl]);

  // Compute active filter counts from draft values
  const activeFilterCount = useMemo(() => {
    let total = 0;
    const byGroup: Record<string, number> = {};

    for (const schema of filterSchemas) {
      const value = filterValues[schema.field];
      if (value != null) {
        total++;
        byGroup[schema.group] = (byGroup[schema.group] || 0) + 1;
      }
    }

    return { total, byGroup };
  }, [filterValues, filterSchemas]);

  return {
    filterValues,
    query,
    sortBy,
    page,
    pageSize: PAGE_SIZE,
    searchParams: searchParams_,
    activeFilterCount,
    hasUnappliedChanges,
    metricWeights,
    hasActiveWeights,
    setFilter,
    clearFilter,
    clearAllFilters,
    clearGroupFilters,
    applyFilters,
    setQuery: handleSetQuery,
    setSortBy: handleSetSortBy,
    setPage: handleSetPage,
    setMetricWeight,
    clearMetricWeights,
  };
}
