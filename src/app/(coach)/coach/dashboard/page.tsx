"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRole } from "@/hooks/use-user-role";
import { useMyPrograms } from "@/hooks/use-programs";
import { formatSportCode } from "@/lib/format";

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
          {programs.map((program) => (
            <Card key={program.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">
                  {formatSportCode(program.sport_code)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground flex gap-4 text-sm">
                  <span>GPA: {program.minimum_gpa != null ? program.minimum_gpa : "—"}</span>
                  <span>SAT: {program.minimum_sat != null ? program.minimum_sat : "—"}</span>
                  <span>ACT: {program.minimum_act != null ? program.minimum_act : "—"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
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
