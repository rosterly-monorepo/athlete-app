"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useExchangeNylasCode, useReportNylasOAuthError } from "@/hooks/use-nylas";

export default function NylasCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const exchange = useExchangeNylasCode();
  const reportError = useReportNylasOAuthError();

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  useEffect(() => {
    if (error) {
      // Report client-side OAuth error to backend for Logfire visibility
      reportError.mutate({
        error,
        error_description: errorDescription,
        had_code: !!code,
        had_state: !!state,
      });
      return;
    }
    if (code && state && !exchange.isPending && !exchange.isSuccess && !exchange.isError) {
      exchange.mutate(
        { code, state },
        {
          onSuccess: () => {
            router.push("/coach/settings");
          },
        }
      );
    }
  }, [code, state, error]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <CallbackLayout>
        <AlertCircle className="text-destructive mx-auto mb-4 h-8 w-8" />
        <h2 className="mb-2 text-lg font-semibold">Connection Failed</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          {errorDescription ||
            "The email provider rejected the connection request. Please try again."}
        </p>
        <Button onClick={() => router.push("/coach/settings")}>Back to Settings</Button>
      </CallbackLayout>
    );
  }

  if (!code || !state) {
    return (
      <CallbackLayout>
        <AlertCircle className="text-destructive mx-auto mb-4 h-8 w-8" />
        <h2 className="mb-2 text-lg font-semibold">Invalid Callback</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Missing authorization parameters. Please try connecting again.
        </p>
        <Button onClick={() => router.push("/coach/settings")}>Back to Settings</Button>
      </CallbackLayout>
    );
  }

  if (exchange.isError) {
    return (
      <CallbackLayout>
        <AlertCircle className="text-destructive mx-auto mb-4 h-8 w-8" />
        <h2 className="mb-2 text-lg font-semibold">Connection Failed</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          {exchange.error instanceof Error
            ? exchange.error.message
            : "Something went wrong. Please try again."}
        </p>
        <Button onClick={() => router.push("/coach/settings")}>Back to Settings</Button>
      </CallbackLayout>
    );
  }

  return (
    <CallbackLayout>
      <Loader2 className="text-muted-foreground mx-auto mb-4 h-8 w-8 animate-spin" />
      <h2 className="mb-2 text-lg font-semibold">Connecting your email...</h2>
      <p className="text-muted-foreground text-sm">
        Completing your Nylas connection. Please wait.
      </p>
    </CallbackLayout>
  );
}

function CallbackLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="py-12 text-center">{children}</CardContent>
      </Card>
    </div>
  );
}
