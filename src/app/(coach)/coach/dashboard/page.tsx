"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRole } from "@/hooks/use-user-role";
import { useMyPrograms } from "@/hooks/use-programs";
import { formatSportCode } from "@/lib/format";
import { findMinimum, formatRequirementValue, shortLabelFor } from "@/lib/requirements";

export default function CoachDashboardPage() {
  const { orgRole, orgName } = useUserRole();
  const { data: programs, isLoading: programsLoading } = useMyPrograms();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Coach Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          {orgName ? `Welcome back — ${orgName}` : "Welcome back"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orgName ?? "—"}</div>
            {orgRole && (
              <Badge variant="outline" className="mt-2">
                {orgRole}
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Athletes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-muted-foreground text-xs">Recruited athletes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-muted-foreground text-xs">Unread messages</p>
          </CardContent>
        </Card>
      </div>

      {/* Program Requirements */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Program Requirements</h2>
        <p className="text-muted-foreground mt-1 text-sm">Academic minimums for your programs</p>
      </div>

      {programsLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-48" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : programs && programs.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {programs.map((program) => {
            const minimums = program.requirements?.minimums ?? [];
            const gpa = findMinimum(program.requirements, "gpa_unweighted");
            const rai = findMinimum(program.requirements, "academic_index");
            return (
              <Card key={program.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">
                    {formatSportCode(program.sport_code)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {minimums.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No minimums configured</p>
                  ) : (
                    <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      {gpa && <span>GPA: {gpa.min_value.toFixed(2)}</span>}
                      {rai && <span>RAI: {Math.round(rai.min_value)}</span>}
                      {minimums
                        .filter(
                          (m) =>
                            m.field_name !== "gpa_unweighted" && m.field_name !== "academic_index"
                        )
                        .map((m) => (
                          <span key={m.field_name}>
                            {shortLabelFor(m.field_name)}:{" "}
                            {formatRequirementValue(m.min_value, null, null)}
                          </span>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-6">
            <p className="text-muted-foreground text-sm">No programs configured yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
