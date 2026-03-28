"use client";

import { Loader2, Mail, RefreshCw, Unplug, Plug, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useNylasConnections,
  useConnectNylas,
  useTriggerNylasSync,
  useDisconnectNylas,
} from "@/hooks/use-nylas";
import type { NylasConnection } from "@/services/types";

export function NylasConnectionCard() {
  const { data: connections, isLoading } = useNylasConnections();
  const connect = useConnectNylas();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          <CardTitle className="text-lg">Email & Calendar</CardTitle>
        </div>
        <CardDescription>
          Connect your email and calendar to automatically track communications with athletes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="text-muted-foreground flex items-center gap-2 py-4 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading connections...
          </div>
        ) : connections && connections.length > 0 ? (
          connections.map((conn) => <ConnectionRow key={conn.id} connection={conn} />)
        ) : (
          <div className="text-muted-foreground py-2 text-sm">No email accounts connected yet.</div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => connect.mutate()}
          disabled={connect.isPending}
          className="mt-2"
        >
          {connect.isPending ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plug className="mr-1.5 h-3.5 w-3.5" />
          )}
          Connect Email Account
        </Button>
      </CardContent>
    </Card>
  );
}

function ConnectionRow({ connection }: { connection: NylasConnection }) {
  const sync = useTriggerNylasSync(connection.id);
  const disconnect = useDisconnectNylas(connection.id);

  const isConnected = connection.status === "active";
  const needsReconnect =
    connection.status === "expired" ||
    connection.status === "error" ||
    connection.status === "revoked";

  const handleDisconnect = () => {
    if (
      confirm(
        `Disconnect ${connection.email_address}? All synced emails and events will be deleted.`
      )
    ) {
      disconnect.mutate();
    }
  };

  const formatSyncTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const providerLabel =
    connection.provider === "google"
      ? "Google"
      : connection.provider === "microsoft"
        ? "Microsoft"
        : connection.provider;

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Mail className="text-muted-foreground h-3.5 w-3.5" />
            <span className="text-sm font-medium">{connection.email_address}</span>
          </div>
          {isConnected && (
            <Badge variant="secondary" className="text-xs">
              {providerLabel}
            </Badge>
          )}
          {needsReconnect && (
            <Badge variant="destructive" className="text-xs">
              Reconnect needed
            </Badge>
          )}
        </div>
        <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
          {connection.last_message_sync_at && (
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              Emails synced {formatSyncTime(connection.last_message_sync_at)}
            </span>
          )}
          {connection.last_event_sync_at && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Events synced {formatSyncTime(connection.last_event_sync_at)}
            </span>
          )}
          {!connection.last_message_sync_at && !connection.last_event_sync_at && (
            <span>Initial sync running...</span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 gap-2">
        {isConnected && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => sync.mutate()}
              disabled={sync.isPending}
            >
              {sync.isPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              )}
              Sync
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={handleDisconnect}
              disabled={disconnect.isPending}
            >
              <Unplug className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
