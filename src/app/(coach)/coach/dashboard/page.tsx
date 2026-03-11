"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserRole } from "@/hooks/use-user-role";

export default function CoachDashboardPage() {
  const { orgRole, orgName } = useUserRole();

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
    </div>
  );
}
