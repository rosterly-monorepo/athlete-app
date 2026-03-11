import { Show } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default async function CoachRosterPage() {
  // orgId may be used in future to fetch roster data
  const { orgId: _orgId } = await auth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Roster</h1>
        <p className="text-muted-foreground mt-1">Manage your coaching staff and athletes.</p>
      </div>

      {/* All coaches with roster:read can see the list */}
      <Show
        when={{ permission: "org:roster:read" }}
        fallback={
          <p className="text-muted-foreground">
            You don&apos;t have permission to view the roster.
          </p>
        }
      >
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Users className="text-muted-foreground mx-auto mb-4 h-10 w-10" />
            <h3 className="mb-2 text-lg font-semibold">No team members yet</h3>
            <p className="text-muted-foreground mx-auto max-w-md text-sm">
              Your roster will appear here once you add coaching staff and athletes.
            </p>
          </CardContent>
        </Card>
      </Show>

      {/* Only head coaches / admins see management controls */}
      <Show when={{ permission: "org:roster:manage" }}>
        <Card>
          <CardHeader>
            <CardTitle>Manage Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              As head coach, you can invite new coaching staff and manage roles.
            </p>
            <p className="text-muted-foreground text-sm">
              Use the Organization settings to invite new team members.
            </p>
          </CardContent>
        </Card>
      </Show>
    </div>
  );
}
