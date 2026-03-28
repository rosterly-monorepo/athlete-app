"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  Loader2,
  Mail,
  MailX,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useNylasConnections, useAthleteCommunications, useEmailBody } from "@/hooks/use-nylas";
import type { CoachEmailRead } from "@/services/types";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// Email Body Viewer
// ─────────────────────────────────────────────────────────────────────────────

function EmailBodyViewer({ emailId }: { emailId: number }) {
  const { data, isLoading, error } = useEmailBody(emailId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (error || !data?.body) {
    return (
      <p className="text-muted-foreground py-4 text-center text-sm">Unable to load email body.</p>
    );
  }

  return (
    <iframe
      srcDoc={data.body}
      sandbox="allow-same-origin"
      className="w-full rounded border"
      style={{ minHeight: 200 }}
      onLoad={(e) => {
        const frame = e.currentTarget;
        const doc = frame.contentDocument;
        if (doc?.body) {
          frame.style.height = `${doc.body.scrollHeight + 16}px`;
        }
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Email List Item
// ─────────────────────────────────────────────────────────────────────────────

function EmailListItem({ email }: { email: CoachEmailRead }) {
  const [open, setOpen] = React.useState(false);
  const isSent = email.direction === "sent";
  const DirectionIcon = isSent ? ArrowUpRight : ArrowDownLeft;
  const timeAgo = formatDistanceToNow(new Date(email.date), { addSuffix: true });

  const participants = isSent ? email.to_emails.join(", ") : email.from_name || email.from_email;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors",
            "hover:bg-muted/50",
            open && "bg-muted/30"
          )}
        >
          <div
            className={cn(
              "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
              isSent
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
            )}
          >
            <DirectionIcon className="h-3.5 w-3.5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium">{email.subject || "(no subject)"}</p>
              <span className="text-muted-foreground shrink-0 text-xs">{timeAgo}</span>
            </div>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {isSent ? "To" : "From"}: {participants}
            </p>
            {email.snippet && (
              <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{email.snippet}</p>
            )}
          </div>

          <ChevronDown
            className={cn(
              "text-muted-foreground mt-1 h-4 w-4 shrink-0 transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-2 pt-2 pb-1">{open && <EmailBodyViewer emailId={email.id} />}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Communications Tab
// ─────────────────────────────────────────────────────────────────────────────

export function CommunicationsTab({ athleteId }: { athleteId: number }) {
  const { data: connections, isLoading: connectionsLoading } = useNylasConnections();
  const { data: comms, isLoading: commsLoading } = useAthleteCommunications(athleteId);

  const hasConnections = (connections?.length ?? 0) > 0;
  const isLoading = connectionsLoading || commsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!hasConnections) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Settings className="text-muted-foreground mb-3 h-8 w-8 opacity-40" />
        <p className="text-muted-foreground text-sm">
          Connect your email account to see communications with this athlete.
        </p>
        <Button variant="outline" size="sm" className="mt-3" asChild>
          <Link href="/coach/settings">Go to Settings</Link>
        </Button>
      </div>
    );
  }

  const emails = comms?.emails ?? [];

  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MailX className="text-muted-foreground mb-3 h-8 w-8 opacity-40" />
        <p className="text-muted-foreground text-sm">
          No email communications found with this athlete.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-muted-foreground flex items-center gap-2 px-1 pb-1 text-xs">
        <Mail className="h-3.5 w-3.5" />
        <span>
          {emails.length} email{emails.length !== 1 ? "s" : ""}
        </span>
      </div>
      {emails.map((email) => (
        <EmailListItem key={email.id} email={email} />
      ))}
    </div>
  );
}
