"use client";

import { useCallback, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFileUpload } from "@/hooks/use-file-upload";
import { Upload, X, Video } from "lucide-react";
import type { ControllerRenderProps } from "react-hook-form";
import type { FormSchemaProperty } from "@/types/form-schema";

interface VideoUploadWidgetProps {
  field: ControllerRenderProps;
  property: FormSchemaProperty;
  fieldKey: string;
  error?: string;
}

export function VideoUploadWidget({ field, property, fieldKey, error }: VideoUploadWidgetProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(field.value || null);

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
      setPreviewUrl(url);
    },
  });

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      const url = await upload(file);
      if (!url) {
        setPreviewUrl(field.value || null);
      }

      URL.revokeObjectURL(localPreview);
    },
    [upload, field.value]
  );

  const handleRemove = useCallback(async () => {
    const success = await remove();
    if (success) {
      field.onChange(null);
      setPreviewUrl(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }, [remove, field]);

  const acceptTypes = uploadConfig?.accept || "video/*";
  const displayError = error || uploadError;
  const isUploading = status === "uploading";

  return (
    <div className="grid gap-2">
      <Label htmlFor={fieldKey}>{property.title || fieldKey}</Label>

      <div className="space-y-3">
        {/* Video preview */}
        {previewUrl ? (
          <video src={previewUrl} controls className="w-full max-w-md rounded-lg border" />
        ) : (
          <div className="bg-muted/50 flex h-40 w-full max-w-md items-center justify-center rounded-lg border border-dashed">
            <Video className="text-muted-foreground h-12 w-12" />
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
            {previewUrl ? "Change Video" : "Upload Video"}
          </Button>

          {previewUrl && !isUploading && (
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
