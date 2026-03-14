"use client";

import { useCallback, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useFileUpload } from "@/hooks/use-file-upload";
import { Upload, X, ImageIcon } from "lucide-react";
import type { ControllerRenderProps } from "react-hook-form";
import type { FormSchemaProperty } from "@/types/form-schema";

interface ImageUploadWidgetProps {
  field: ControllerRenderProps;
  property: FormSchemaProperty;
  fieldKey: string;
  error?: string;
  required?: boolean;
}

export function ImageUploadWidget({
  field,
  property,
  fieldKey,
  error,
  required,
}: ImageUploadWidgetProps) {
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

      // Show local preview immediately
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      const url = await upload(file);
      if (!url) {
        // Upload failed, revert preview
        setPreviewUrl(field.value || null);
      }

      // Cleanup local preview URL
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

  const acceptTypes = uploadConfig?.accept || "image/*";
  const displayError = error || uploadError;
  const isUploading = status === "uploading";

  return (
    <div className="grid gap-2">
      <Label htmlFor={fieldKey}>
        {property.title || fieldKey}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <div className="flex items-start gap-4">
        {/* Preview */}
        <Avatar className="h-20 w-20">
          {previewUrl ? (
            <AvatarImage src={previewUrl} alt="Preview" />
          ) : (
            <AvatarFallback>
              <ImageIcon className="text-muted-foreground h-8 w-8" />
            </AvatarFallback>
          )}
        </Avatar>

        {/* Controls */}
        <div className="flex flex-col gap-2">
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
              {previewUrl ? "Change" : "Upload"}
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

          {/* Progress bar */}
          {isUploading && (
            <div className="w-48">
              <Progress value={progress} />
              <p className="text-muted-foreground mt-1 text-xs">Uploading... {progress}%</p>
            </div>
          )}

          {/* Size hint */}
          {uploadConfig?.maxSizeMB && (
            <p className="text-muted-foreground text-xs">Max size: {uploadConfig.maxSizeMB}MB</p>
          )}
        </div>
      </div>

      {property.description && (
        <p className="text-muted-foreground text-xs">{property.description}</p>
      )}
      {displayError && <p className="text-destructive text-xs">{displayError}</p>}
    </div>
  );
}
