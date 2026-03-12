"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMyPrograms } from "@/hooks/use-programs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

function formatSportCode(code: string): string {
  return code
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function RecruitingPage() {
  const router = useRouter();
  const { data: programs, isLoading, error } = useMyPrograms();

  // If only one program, redirect directly to it
  useEffect(() => {
    if (programs?.length === 1) {
      router.replace(`/coach/recruiting/${programs[0].id}`);
    }
  }, [programs, router]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-2 h-5 w-72" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive py-8 text-center">
        Failed to load programs. Please try again.
      </div>
    );
  }

  if (!programs || programs.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recruiting</h1>
          <p className="text-muted-foreground mt-1">Manage your recruitment pipeline.</p>
        </div>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="text-lg font-medium">No Programs Found</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Your organization doesn&apos;t have any programs set up yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show program selection if multiple programs
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recruiting</h1>
        <p className="text-muted-foreground mt-1">
          Select a program to manage its recruitment board.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {programs.map((program) => (
          <Link key={program.id} href={`/coach/recruiting/${program.id}`}>
            <Card className="hover:border-primary cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  {formatSportCode(program.sport_code)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {program.division && <Badge variant="secondary">{program.division}</Badge>}
                  {program.conference && <Badge variant="outline">{program.conference}</Badge>}
                  {program.recruiting_status && (
                    <Badge
                      variant={program.recruiting_status === "active" ? "default" : "secondary"}
                    >
                      {program.recruiting_status}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
