"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { exportRecruitsToARMS, type ARMSExportConfig } from "@/services/arms";
import { ApiClientError } from "@/services/api-client";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function useARMSExport() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (config: ARMSExportConfig) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return exportRecruitsToARMS(token, config);
    },
    onSuccess: ({ blob, filename }, config) => {
      const fallback = `arms_recruits_${config.program_id}_${
        new Date().toISOString().split("T")[0]
      }.${config.output_format === "xlsx" ? "xlsx" : "csv"}`;
      triggerDownload(blob, filename ?? fallback);
      toast.success("ARMS export ready");
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError ? error.userMessage : "Export failed, try again.";
      toast.error("Failed to export to ARMS", { description: message });
    },
  });
}
