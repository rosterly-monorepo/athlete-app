"use client";

import { useEffect, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useExchangeCode } from "@/hooks/use-integrations";

export default function IntegrationCallbackPage({
  params,
}: {
  params: Promise<{ provider: string }>;
}) {
  const { provider } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const exchange = useExchangeCode(provider);

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  useEffect(() => {
    if (code && state && !exchange.isPending && !exchange.isSuccess && !exchange.isError) {
      exchange.mutate(
        { code, state },
        {
          onSuccess: () => {
            router.push("/sports");
          },
        }
      );
    }
  }, [code, state]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!code || !state) {
    return (
      <CallbackLayout>
        <AlertCircle className="text-destructive mx-auto mb-4 h-8 w-8" />
        <h2 className="mb-2 text-lg font-semibold">Invalid Callback</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Missing authorization parameters. Please try connecting again.
        </p>
        <Button onClick={() => router.push("/sports")}>Back to Sports</Button>
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
        <Button onClick={() => router.push("/sports")}>Back to Sports</Button>
      </CallbackLayout>
    );
  }

  return (
    <CallbackLayout>
      <Loader2 className="text-muted-foreground mx-auto mb-4 h-8 w-8 animate-spin" />
      <h2 className="mb-2 text-lg font-semibold">Connecting...</h2>
      <p className="text-muted-foreground text-sm">
        Completing your {provider} connection. Please wait.
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
