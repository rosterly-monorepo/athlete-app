"use client";

import { useCallback, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RosterlyLoader } from "@/components/ui/dot-loader";
import { useFileUpload } from "@/hooks/use-file-upload";
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
  { label: string; field: string; icon: LucideIcon; urlKey: string }
> = {
  transcript: {
    label: "Transcript",
    field: "transcript_url",
    icon: GraduationCap,
    urlKey: "transcriptUrl",
  },
  sat: {
    label: "SAT Score Report",
    field: "sat_score_url",
    icon: BookOpen,
    urlKey: "satScoreUrl",
  },
  act: {
    label: "ACT Score Report",
    field: "act_score_url",
    icon: BookOpen,
    urlKey: "actScoreUrl",
  },
};

const DOC_TYPES: DocType[] = ["transcript", "sat", "act"];

// ---------------------------------------------------------------------------
// DocumentSlot — manages a single document type
// ---------------------------------------------------------------------------

interface DocumentSlotProps {
  docType: DocType;
  currentUrl: string | null;
  isExtracting: boolean;
  extractionResult: {
    status: ExtractionPollingStatus;
    fieldsCount: number;
    error: string | null;
  } | null;
  onExtractionStart: () => void;
  onFileChange: () => void;
}

function DocumentSlot({
  docType,
  currentUrl,
  isExtracting,
  extractionResult,
  onExtractionStart,
  onFileChange,
}: DocumentSlotProps) {
  const config = DOC_CONFIG[docType];
  const Icon = config.icon;
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

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
  const displayName = fileName || (currentUrl ? currentUrl.split("/").pop() : null);

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
            <span className="flex-1 truncate text-sm">{displayName}</span>
            {currentUrl && (
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
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
            <div className="flex items-center gap-2">
              <RosterlyLoader className="min-h-[60px] w-16" dotCount={25} columns={5} />
              <span className="text-muted-foreground text-xs">Analyzing document...</span>
            </div>
          )}

          {extractionResult?.status === "complete" && extractionResult.fieldsCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <Check className="h-3.5 w-3.5" />
              Extracted {extractionResult.fieldsCount}{" "}
              {extractionResult.fieldsCount === 1 ? "field" : "fields"}
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
  extractedCount: number;
  extractionError: string | null;
}

export function AcademicUploadHero({
  initialData,
  onExtractionStart,
  extractionStatus,
  extractedCount,
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
    extractionStatus === "empty";

  const getUrlForDoc = (docType: DocType): string | null => {
    if (!initialData) return null;
    return (initialData[DOC_CONFIG[docType].urlKey] as string | null) ?? null;
  };

  const getExtractionResult = (docType: DocType): DocumentSlotProps["extractionResult"] => {
    if (activeExtractionDoc !== docType) return null;
    if (!isDone) return null;
    return {
      status: extractionStatus,
      fieldsCount: extractedCount,
      error: extractionError,
    };
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
