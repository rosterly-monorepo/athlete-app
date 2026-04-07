"use client";

import { useCallback, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RosterlyLoader } from "@/components/ui/dot-loader";
import { useFileUpload } from "@/hooks/use-file-upload";
import { getDocumentViewUrl } from "@/services/upload";
import {
  Sparkles,
  GraduationCap,
  BookOpen,
  Check,
  AlertCircle,
  FileText,
  Upload,
  X,
  ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ExtractionPollingStatus } from "@/hooks/use-extraction-polling";

type DocType = "transcript" | "sat" | "act";

const DOC_CONFIG: Record<
  DocType,
  { label: string; field: string; icon: LucideIcon; timestampKey: string }
> = {
  transcript: {
    label: "Transcript",
    field: "transcript_url",
    icon: GraduationCap,
    timestampKey: "transcript_uploaded_at",
  },
  sat: {
    label: "SAT Score Report",
    field: "sat_score_url",
    icon: BookOpen,
    timestampKey: "sat_score_uploaded_at",
  },
  act: {
    label: "ACT Score Report",
    field: "act_score_url",
    icon: BookOpen,
    timestampKey: "act_score_uploaded_at",
  },
};

const DOC_TYPES: DocType[] = ["transcript", "sat", "act"];

/** Human-readable labels for extracted field names (snake_case API keys). */
const FIELD_LABELS: Record<string, string> = {
  high_school_name: "High School Name",
  high_school_city: "High School City",
  high_school_state: "High School State",
  high_school_ceeb: "High School CEEB",
  graduation_year: "Graduation Year",
  gpa_unweighted: "GPA Unweighted",
  gpa_weighted: "GPA Weighted",
  gpa_scale: "GPA Scale",
  academic_honors: "Academic Honors",
  class_rank: "Class Rank",
  class_size: "Class Size",
  sat_total: "SAT Total",
  sat_reading_writing: "SAT Reading & Writing",
  sat_math: "SAT Math",
  sat_date: "SAT Date",
  act_composite: "ACT Composite",
  act_english: "ACT English",
  act_math: "ACT Math",
  act_reading: "ACT Reading",
  act_science: "ACT Science",
  act_writing: "ACT Writing",
  act_date: "ACT Date",
  ap_scores: "AP Scores",
};

/** Reverse map: camelCase form keys → snake_case API keys. */
const FORM_KEY_TO_API: Record<string, string> = {
  highSchoolName: "high_school_name",
  highSchoolCity: "high_school_city",
  highSchoolState: "high_school_state",
  graduationYear: "graduation_year",
  gpaUnweighted: "gpa_unweighted",
  gpaWeighted: "gpa_weighted",
  gpaScale: "gpa_scale",
  classRank: "class_rank",
  classSize: "class_size",
  satTotal: "sat_total",
  satReadingWriting: "sat_reading_writing",
  satMath: "sat_math",
  actComposite: "act_composite",
  actEnglish: "act_english",
  actMath: "act_math",
  actReading: "act_reading",
  actScience: "act_science",
  apScores: "ap_scores",
};

// ---------------------------------------------------------------------------
// DocumentSlot — manages a single document type
// ---------------------------------------------------------------------------

interface DocumentSlotProps {
  docType: DocType;
  currentUrl: string | null;
  uploadedAt: string | null;
  isExtracting: boolean;
  extractionResult: {
    status: ExtractionPollingStatus;
    fields: string[];
    error: string | null;
  } | null;
  onExtractionStart: () => void;
  onFileChange: () => void;
}

function DocumentSlot({
  docType,
  currentUrl,
  uploadedAt,
  isExtracting,
  extractionResult,
  onExtractionStart,
  onFileChange,
}: DocumentSlotProps) {
  const config = DOC_CONFIG[docType];
  const Icon = config.icon;
  const { getToken } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoadingView, setIsLoadingView] = useState(false);

  const {
    status: uploadStatus,
    progress,
    error: uploadError,
    upload,
    remove,
  } = useFileUpload({
    field: config.field,
    section: "academics",
    uploadConfig: { accept: "application/pdf", maxSizeMB: 10 },
    onSuccess: () => {
      onExtractionStart();
      onFileChange();
    },
  });

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setFileName(file.name);
      const url = await upload(file);
      if (!url) setFileName(null);
    },
    [upload]
  );

  const handleRemove = useCallback(async () => {
    const success = await remove();
    if (success) {
      setFileName(null);
      onFileChange();
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [remove, onFileChange]);

  const handleView = useCallback(async () => {
    try {
      setIsLoadingView(true);
      const token = await getToken();
      if (!token) return;
      const viewUrl = await getDocumentViewUrl(token, config.field, "academics");
      window.open(viewUrl, "_blank", "noopener,noreferrer");
    } catch {
      // Silently fail — the file may have been deleted
    } finally {
      setIsLoadingView(false);
    }
  }, [getToken, config.field]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (!file || !file.type.includes("pdf")) return;
      setFileName(file.name);
      upload(file).then((url) => {
        if (!url) setFileName(null);
      });
    },
    [upload]
  );

  const isUploading = uploadStatus === "uploading";
  const hasFile = currentUrl || fileName;
  const displayName = fileName || (currentUrl ? `${config.label}.pdf` : null);
  const formattedDate = uploadedAt
    ? new Date(uploadedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div
      className={`rounded-lg border p-3 transition-colors ${
        isDragOver
          ? "border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20"
          : "border-border"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragOver(false);
      }}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex items-center gap-2 text-sm font-medium">
        <Icon className="text-muted-foreground h-4 w-4" />
        {config.label}
      </div>

      {/* Empty state */}
      {!hasFile && !isUploading && (
        <div className="mt-2 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            className="gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload
          </Button>
          <span className="text-muted-foreground text-xs">or drop PDF here</span>
        </div>
      )}

      {/* Uploading */}
      {isUploading && (
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <FileText className="text-muted-foreground h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{displayName}</span>
          </div>
          <Progress value={progress} className="h-1.5" />
          <p className="text-muted-foreground text-xs">{progress}%</p>
        </div>
      )}

      {/* File uploaded */}
      {hasFile && !isUploading && (
        <div className="mt-2 space-y-2">
          {/* File info row */}
          <div className="flex items-center gap-2">
            <FileText className="text-muted-foreground h-4 w-4 flex-shrink-0" />
            <div className="flex flex-1 flex-col truncate">
              <span className="truncate text-sm">{displayName}</span>
              {formattedDate && !fileName && (
                <span className="text-muted-foreground text-xs">Uploaded {formattedDate}</span>
              )}
            </div>
            {currentUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-6 w-6 p-0"
                onClick={handleView}
                disabled={isLoadingView}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive h-6 w-6 p-0"
              onClick={handleRemove}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Extraction status */}
          {isExtracting && (
            <div className="flex items-center gap-3">
              <RosterlyLoader
                className="min-h-0 w-14 flex-shrink-0"
                dotClassName="size-1 rounded-px"
              />
              <p className="text-muted-foreground text-xs">
                We&apos;ll read your document and fill in the forms for you. This can take up to a
                minute — feel free to fill in other sections while we work on it.
              </p>
            </div>
          )}

          {extractionResult?.status === "complete" && extractionResult.fields.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <Check className="h-3.5 w-3.5" />
                Successfully extracted
              </div>
              <p className="text-muted-foreground text-xs">
                {extractionResult.fields.map((f) => FIELD_LABELS[f] ?? f).join(", ")}
              </p>
            </div>
          )}

          {extractionResult?.status === "empty" && (
            <p className="text-muted-foreground text-xs">
              No data could be extracted from this document.
            </p>
          )}

          {extractionResult?.status === "failed" && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="h-3.5 w-3.5" />
              {extractionResult.error || "Extraction failed"}
            </div>
          )}

          {extractionResult?.status === "pending" && (
            <div className="flex items-center gap-3">
              <RosterlyLoader
                className="min-h-0 w-14 flex-shrink-0"
                dotClassName="size-1 rounded-px"
              />
              <p className="text-muted-foreground text-xs">
                Still reading your document — this can take up to a minute. Feel free to fill in
                other sections while we work on it.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Upload error */}
      {uploadError && <p className="text-destructive mt-1 text-xs">{uploadError}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AcademicUploadHero — renders all three document slots
// ---------------------------------------------------------------------------

interface AcademicUploadHeroProps {
  initialData?: Record<string, unknown>;
  onExtractionStart: () => void;
  extractionStatus: ExtractionPollingStatus;
  extractedFields: string[];
  extractionError: string | null;
}

export function AcademicUploadHero({
  initialData,
  onExtractionStart,
  extractionStatus,
  extractedFields,
  extractionError,
}: AcademicUploadHeroProps) {
  // Track which doc type triggered the current extraction
  const [activeExtractionDoc, setActiveExtractionDoc] = useState<DocType | null>(null);

  const handleExtractionStart = useCallback(
    (docType: DocType) => {
      setActiveExtractionDoc(docType);
      onExtractionStart();
    },
    [onExtractionStart]
  );

  // Reset active doc when extraction finishes
  const isPolling = extractionStatus === "polling";
  const isDone =
    extractionStatus === "complete" ||
    extractionStatus === "failed" ||
    extractionStatus === "empty" ||
    extractionStatus === "pending";

  const getUrlForDoc = (docType: DocType): string | null => {
    if (!initialData) return null;
    return (initialData[DOC_CONFIG[docType].field] as string | null) ?? null;
  };

  const getUploadedAt = (docType: DocType): string | null => {
    if (!initialData) return null;
    return (initialData[DOC_CONFIG[docType].timestampKey] as string | null) ?? null;
  };

  const getExtractionResult = (docType: DocType): DocumentSlotProps["extractionResult"] => {
    // Active polling result takes priority — convert camelCase form keys to snake_case
    if (activeExtractionDoc === docType && isDone) {
      const apiFields = extractedFields.map((f) => FORM_KEY_TO_API[f] ?? f);
      return {
        status: extractionStatus,
        fields: apiFields,
        error: extractionError,
      };
    }

    // Show persisted extraction status for documents with a stored URL
    if (!initialData || activeExtractionDoc === docType) return null;
    const hasUrl = getUrlForDoc(docType);
    if (!hasUrl) return null;

    const persistedStatus = initialData.extraction_status as string | null;
    if (persistedStatus === "complete") {
      const fields = (initialData.extraction_fields as string[] | null) ?? [];
      return {
        status: fields.length > 0 ? "complete" : "empty",
        fields,
        error: null,
      };
    }
    if (persistedStatus === "failed") {
      return {
        status: "failed",
        fields: [],
        error: (initialData.extraction_error as string | null) ?? "Extraction failed",
      };
    }
    if (persistedStatus === "pending") {
      return {
        status: "pending",
        fields: [],
        error: null,
      };
    }

    return null;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-500" />
          <div>
            <h3 className="text-sm font-semibold">Auto-fill with your documents</h3>
            <p className="text-muted-foreground text-xs">
              Upload documents and we&apos;ll extract your academic data automatically
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {DOC_TYPES.map((docType) => (
            <DocumentSlot
              key={docType}
              docType={docType}
              currentUrl={getUrlForDoc(docType)}
              uploadedAt={getUploadedAt(docType)}
              isExtracting={activeExtractionDoc === docType && isPolling}
              extractionResult={getExtractionResult(docType)}
              onExtractionStart={() => handleExtractionStart(docType)}
              onFileChange={() => {}}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
