"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFileUpload } from "@/hooks/use-file-upload";
import { Upload, X, FileText, ExternalLink } from "lucide-react";
import type { ControllerRenderProps } from "react-hook-form";
import type { FormSchemaProperty } from "@/types/form-schema";
import { FieldLabel } from "../FieldLabel";

interface DocumentUploadWidgetProps {
  field: ControllerRenderProps;
  property: FormSchemaProperty;
  fieldKey: string;
  error?: string;
  required?: boolean;
}

export function DocumentUploadWidget({
  field,
  property,
  fieldKey,
  error,
  required,
}: DocumentUploadWidgetProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const uploadConfig = property["x-ui-upload"];

  const {
    status,
    progress,
    error: uploadError,
    upload,
    remove,
  } = useFileUpload({
    field: fieldKey,
    uploadConfig,
    onSuccess: (url) => {
      field.onChange(url);
    },
  });

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setFileName(file.name);
      const url = await upload(file);
      if (!url) {
        setFileName(null);
      }
    },
    [upload]
  );

  const handleRemove = useCallback(async () => {
    const success = await remove();
    if (success) {
      field.onChange(null);
      setFileName(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }, [remove, field]);

  const acceptTypes = uploadConfig?.accept || ".pdf,.doc,.docx";
  const displayError = error || uploadError;
  const isUploading = status === "uploading";
  const hasFile = field.value || fileName;

  return (
    <div className="grid gap-2">
      <FieldLabel fieldKey={fieldKey} property={property} required={required} />

      <div className="space-y-3">
        {/* File display */}
        {hasFile && (
          <div className="bg-muted/50 flex items-center gap-2 rounded-lg border p-3">
            <FileText className="text-muted-foreground h-5 w-5 flex-shrink-0" />
            <span className="flex-1 truncate text-sm">{fileName || "Uploaded document"}</span>
            {field.value && (
              <a
                href={field.value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        )}

        {/* Controls */}
        <input
          ref={inputRef}
          type="file"
          id={fieldKey}
          accept={acceptTypes}
          onChange={handleFileSelect}
          disabled={property["x-ui-disabled"] || isUploading}
          className="hidden"
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={property["x-ui-disabled"] || isUploading}
          >
            <Upload className="mr-1 h-4 w-4" />
            {hasFile ? "Replace" : "Upload Document"}
          </Button>

          {hasFile && !isUploading && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={property["x-ui-disabled"]}
            >
              <X className="mr-1 h-4 w-4" />
              Remove
            </Button>
          )}
        </div>

        {isUploading && (
          <div className="w-full max-w-md">
            <Progress value={progress} />
            <p className="text-muted-foreground mt-1 text-xs">Uploading... {progress}%</p>
          </div>
        )}

        {uploadConfig?.maxSizeMB && (
          <p className="text-muted-foreground text-xs">Max size: {uploadConfig.maxSizeMB}MB</p>
        )}
      </div>

      {property.description && (
        <p className="text-muted-foreground text-xs">{property.description}</p>
      )}
      {displayError && <p className="text-destructive text-xs">{displayError}</p>}
    </div>
  );
}
