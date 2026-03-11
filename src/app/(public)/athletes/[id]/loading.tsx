import { Skeleton } from "@/components/ui/skeleton";

export default function AthleteProfileLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-start gap-6">
        <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>

      {/* Competition Results */}
      <Skeleton className="h-48 w-full rounded-xl" />

      {/* About */}
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}
