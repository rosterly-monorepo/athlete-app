import { Skeleton } from "@/components/ui/skeleton";

export default function AthletesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Skeleton className="mb-2 h-10 w-64" />
      <Skeleton className="mb-8 h-5 w-96" />

      {/* Search & Filters skeleton */}
      <div className="mb-8 flex flex-wrap gap-3">
        <Skeleton className="h-10 min-w-[250px] flex-1" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Grid of athlete cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
