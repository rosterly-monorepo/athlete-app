"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFileUpload } from "@/hooks/use-file-upload";
import { cn } from "@/lib/utils";
import { AlertCircle, ImageIcon, Upload, X } from "lucide-react";

interface ProfilePhotoFieldProps {
  avatarUrl: string | null | undefined;
  required?: boolean;
}

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_MB = 5;

export function ProfilePhotoField({ avatarUrl, required }: ProfilePhotoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Transient local preview during upload (blob URL). When null, we fall back to
  // the persisted avatarUrl prop from the profile fetch.
  const [blobPreview, setBlobPreview] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  // Revoke the blob URL when it's replaced or the component unmounts.
  useEffect(() => {
    return () => {
      if (blobPreview) URL.revokeObjectURL(blobPreview);
    };
  }, [blobPreview]);

  // Reset error state on URL change — React-docs pattern for derived state.
  const displayUrl = blobPreview ?? avatarUrl ?? null;
  const [lastUrl, setLastUrl] = useState(displayUrl);
  if (lastUrl !== displayUrl) {
    setLastUrl(displayUrl);
    setImgError(false);
  }

  const { status, progress, error, upload, remove } = useFileUpload({
    field: "avatar",
    uploadConfig: { accept: ACCEPT, maxSizeMB: MAX_MB },
    onSuccess: () => setBlobPreview(null),
    onError: () => setBlobPreview(null),
  });

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const localPreview = URL.createObjectURL(file);
      setBlobPreview(localPreview);
      await upload(file);
    },
    [upload]
  );

  const handleRemove = useCallback(async () => {
    await remove();
    setBlobPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [remove]);

  const isUploading = status === "uploading";
  const showImage = displayUrl && !imgError;
  const missing = !displayUrl && required;

  return (
    <div className="border-border bg-card mb-6 flex items-start gap-4 rounded-md border p-4">
      <div
        className={cn(
          "relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full",
          showImage ? "bg-muted" : "bg-primary/10 text-primary"
        )}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayUrl}
            alt="Profile photo"
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : imgError ? (
          <AlertCircle className="text-muted-foreground h-8 w-8" />
        ) : (
          <ImageIcon className="text-muted-foreground h-8 w-8" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div>
          <p className="text-sm font-medium">
            Profile photo
            {required && <span className="text-destructive ml-1">*</span>}
          </p>
          <p className="text-muted-foreground text-xs">
            {missing
              ? "Required — coaches see this in search results."
              : `Max size: ${MAX_MB}MB · JPEG, PNG, or WebP`}
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="mr-1 h-4 w-4" />
            {displayUrl ? "Change" : "Upload"}
          </Button>
          {displayUrl && !isUploading && (
            <Button type="button" variant="outline" size="sm" onClick={handleRemove}>
              <X className="mr-1 h-4 w-4" />
              Remove
            </Button>
          )}
        </div>

        {isUploading && (
          <div className="w-48">
            <Progress value={progress} />
            <p className="text-muted-foreground mt-1 text-xs">Uploading... {progress}%</p>
          </div>
        )}

        {error && <p className="text-destructive text-xs">{error}</p>}
        {imgError && displayUrl && (
          <p className="text-destructive text-xs">
            Image saved but can&apos;t be displayed. The URL may not be publicly accessible:{" "}
            <a href={displayUrl} target="_blank" rel="noreferrer" className="underline">
              {displayUrl}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
