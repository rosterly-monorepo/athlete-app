"use client";

import { Loader2, RefreshCw, Unplug, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useIntegrationsForSport,
  useMyConnections,
  useConnectIntegration,
  useTriggerSync,
  useDisconnect,
} from "@/hooks/use-integrations";
import type { IntegrationConnection, IntegrationProviderInfo } from "@/services/types";

interface IntegrationConnectionCardProps {
  sportCode: string;
}

export function IntegrationConnectionCard({ sportCode }: IntegrationConnectionCardProps) {
  const { data: providers, isLoading: loadingProviders } = useIntegrationsForSport(sportCode);
  const { data: connections } = useMyConnections();

  if (loadingProviders) return null;
  if (!providers || providers.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Connected Accounts</h3>
      {providers.map((provider) => {
        const connection = connections?.find((c) => c.provider_code === provider.code);
        return <ProviderCard key={provider.code} provider={provider} connection={connection} />;
      })}
    </div>
  );
}

function ProviderCard({
  provider,
  connection,
}: {
  provider: IntegrationProviderInfo;
  connection?: IntegrationConnection;
}) {
  const connect = useConnectIntegration();
  const sync = useTriggerSync(provider.code);
  const disconnect = useDisconnect(provider.code);

  const isConnected = connection?.status === "active";
  const needsReconnect =
    connection?.status === "expired" ||
    connection?.status === "error" ||
    connection?.status === "revoked";

  const handleDisconnect = () => {
    if (confirm(`Disconnect ${provider.name}? Imported performances will not be deleted.`)) {
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

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{provider.name}</p>
            {isConnected && (
              <Badge variant="secondary" className="text-xs">
                Connected
              </Badge>
            )}
            {needsReconnect && (
              <Badge variant="destructive" className="text-xs">
                Disconnected
              </Badge>
            )}
          </div>
          {isConnected && connection ? (
            <p className="text-muted-foreground mt-0.5 text-xs">
              {connection.external_username && `${connection.external_username} · `}
              {connection.last_sync_at
                ? `Last synced ${formatSyncTime(connection.last_sync_at)}`
                : "Not synced yet"}
            </p>
          ) : needsReconnect ? (
            <p className="text-muted-foreground mt-0.5 text-xs">
              Connection lost. Reconnect to sync new performances.
            </p>
          ) : (
            <p className="text-muted-foreground mt-0.5 text-xs">{provider.description}</p>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          {isConnected ? (
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
                <Unplug className="mr-1.5 h-3.5 w-3.5" />
                Disconnect
              </Button>
            </>
          ) : (
            <Button
              variant={needsReconnect ? "default" : "outline"}
              size="sm"
              onClick={() => connect.mutate(provider.code)}
              disabled={connect.isPending}
            >
              {connect.isPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plug className="mr-1.5 h-3.5 w-3.5" />
              )}
              {needsReconnect ? "Reconnect" : "Connect"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
