"use client";

import { useMyResults, useDeleteResult } from "@/hooks/use-performance";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AddResultDialog } from "@/components/forms/add-result-dialog";
import { Trophy, Trash2 } from "lucide-react";

export default function PerformancePage() {
  const { data: results, isLoading } = useMyResults();
  const deleteResult = useDeleteResult();

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this result?")) {
      deleteResult.mutate(id);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold">Performance</h1>
          <p className="text-muted-foreground">
            Track your competition results and training progress.
          </p>
        </div>
        {results && results.length > 0 && <AddResultDialog />}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : results && results.length > 0 ? (
        <div className="space-y-3">
          {results.map((result) => (
            <Card key={result.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium">{result.competitionName}</p>
                  <p className="text-muted-foreground text-xs">
                    {result.event} &middot; {new Date(result.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">
                    {result.result} {result.unit}
                  </span>
                  <Badge variant={result.source === "imported" ? "default" : "secondary"}>
                    {result.source}
                  </Badge>
                  {result.source === "manual" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive h-8 w-8"
                      onClick={() => handleDelete(result.id)}
                      disabled={deleteResult.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* ── Empty State ── */
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Trophy className="text-muted-foreground mx-auto mb-4 h-10 w-10" />
            <h3 className="mb-2 text-lg font-semibold">No results yet</h3>
            <p className="text-muted-foreground mx-auto mb-6 max-w-md text-sm">
              Add your competition results manually or connect a data provider to automatically
              import your athletic performance data.
            </p>
            <div className="flex items-center justify-center gap-3">
              <AddResultDialog />
              <Button variant="outline">Connect Data Provider</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
