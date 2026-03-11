import type { Metadata } from "next";
import Link from "next/link";
import { getAthletes } from "@/services/athlete";
import { AthleteCard } from "@/components/composed/athlete-card";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { SPORTS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Browse Athletes | Rosterly",
  description:
    "Discover college athletes across all sports. View profiles, stats, and competition results.",
};

// ISR: revalidate every 60 seconds
export const revalidate = 60;

interface SearchParams {
  sport?: string;
  page?: string;
}

export default async function AthletesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const sport = params.sport;
  const page = params.page ? parseInt(params.page, 10) : 1;

  let athletes: Awaited<ReturnType<typeof getAthletes>> | null = null;
  let error: string | null = null;

  try {
    athletes = await getAthletes({ sport, page });
  } catch (e) {
    // API not connected yet - show empty state
    error = e instanceof Error ? e.message : "Failed to load athletes";
  }

  const hasAthletes = athletes && athletes.data.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold">Browse Athletes</h1>
      <p className="text-muted-foreground mb-8">Discover college athletes across all sports.</p>

      {/* Search & Filters */}
      <form className="mb-8 flex flex-wrap gap-3">
        <Input
          name="q"
          placeholder="Search by name, school, or sport..."
          className="min-w-[250px] flex-1"
        />
        <Select name="sport" defaultValue={sport || ""}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Sports" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Sports</SelectItem>
            {SPORTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </form>

      {hasAthletes && athletes ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {athletes.data.map((athlete) => (
              <Link key={athlete.id} href={`/athletes/${athlete.id}`}>
                <AthleteCard athlete={athlete} />
              </Link>
            ))}
          </div>

          {/* Pagination info */}
          {athletes.total > athletes.pageSize && (
            <div className="text-muted-foreground mt-8 text-center text-sm">
              Showing {athletes.data.length} of {athletes.total} athletes
            </div>
          )}
        </>
      ) : (
        /* ── Empty State ── */
        <Card className="border-dashed">
          <CardContent className="p-16 text-center">
            <Search className="text-muted-foreground mx-auto mb-4 h-10 w-10" />
            <h3 className="mb-2 text-lg font-semibold">
              {error ? "API not connected" : "No athletes yet"}
            </h3>
            <p className="text-muted-foreground mx-auto max-w-md text-sm">
              {error
                ? "Connect the FastAPI backend to see athlete profiles here."
                : "Athlete profiles will appear here once users create and publish their profiles."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
