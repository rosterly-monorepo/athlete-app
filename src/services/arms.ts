import { apiClientBlob } from "./api-client";

export interface ARMSExportConfig {
  program_id: number;
  output_format?: "csv" | "xlsx";
  athlete_ids?: number[];
}

export async function exportRecruitsToARMS(
  token: string,
  config: ARMSExportConfig
): Promise<{ blob: Blob; filename: string | null }> {
  return apiClientBlob("/api/v1/arms/export/recruits", token, {
    method: "POST",
    body: JSON.stringify(config),
  });
}
