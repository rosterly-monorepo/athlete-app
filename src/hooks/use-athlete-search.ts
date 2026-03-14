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

function serializeFiltersToParams(
  filters: FilterValues,
  schemas: SearchFilterSchema[],
  query: string,
  sortBy: string,
  page: number
): URLSearchParams {
  const params = new URLSearchParams();

  if (query) params.set("q", query);
  if (sortBy !== "_score") params.set("sort", sortBy);
  if (page > 1) params.set("page", String(page));

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
} {
  const filters: FilterValues = {};
  const query = searchParams.get("q") || "";
  const sortBy = searchParams.get("sort") || "_score";
  const page = Number(searchParams.get("page")) || 1;

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

  return { filters, query, sortBy, page };
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

  // Debounce query only (text search still auto-fires)
  const [debouncedQuery] = useDebounce(query, 300);

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
  const searchParams_ = useMemo<AthleteSearchRequest>(
    () => ({
      query: debouncedQuery || undefined,
      filters: appliedFilters,
      sort_by: sortBy,
      offset: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
    }),
    [appliedFilters, debouncedQuery, sortBy, page]
  );

  // Sync to URL
  const syncUrl = useCallback(
    (filters: FilterValues, q: string, sort: string, p: number) => {
      const params = serializeFiltersToParams(filters, filterSchemas, q, sort, p);
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
    syncUrl({}, query, sortBy, 1);
  }, [query, sortBy, syncUrl]);

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
    syncUrl(filterValues, query, sortBy, 1);
  }, [filterValues, query, sortBy, syncUrl]);

  const handleSetQuery = useCallback(
    (q: string) => {
      setQuery(q);
      setPage(1);
      syncUrl(appliedFilters, q, sortBy, 1);
    },
    [appliedFilters, sortBy, syncUrl]
  );

  const handleSetSortBy = useCallback(
    (sort: string) => {
      setSortBy(sort);
      setPage(1);
      syncUrl(appliedFilters, query, sort, 1);
    },
    [appliedFilters, query, syncUrl]
  );

  const handleSetPage = useCallback(
    (p: number) => {
      setPage(p);
      syncUrl(appliedFilters, query, sortBy, p);
    },
    [appliedFilters, query, sortBy, syncUrl]
  );

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
    setFilter,
    clearFilter,
    clearAllFilters,
    clearGroupFilters,
    applyFilters,
    setQuery: handleSetQuery,
    setSortBy: handleSetSortBy,
    setPage: handleSetPage,
  };
}
