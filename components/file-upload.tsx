"use client"

import { UploadDropzone } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface FileUploadProps {
  onChange: (url?: string) => void;
  value?: string;
  endpoint: "messageFile" | "serverImage";
  disabled?: boolean;
  className?: string;
}

export const FileUpload = ({
  onChange,
  value,
  endpoint,
  disabled,
  className
}: FileUploadProps) => {
  const hasValue = Boolean(value);
  const getFileName = (url: string) => {
    const lastSegment = url.split("/").pop() ?? "file";
    const name = lastSegment.split("?")[0];
    try {
      return decodeURIComponent(name);
    } catch {
      return name;
    }
  };
  const fileName = value ? getFileName(value) : "";
  const isImage = !!value && endpoint === "serverImage";


  const labelText = hasValue
    ? "Drop a new file or click to replace"
    : "Drop a file here or click to upload";
  const allowedText =
    endpoint === "serverImage"
      ? "PNG, JPG, or WEBP up to 2MB."
      : "Images or PDF.";

  return (
    <div className={cn("w-full space-y-3", className)}>

      {/* 1️⃣ IMAGE PREVIEW */}
      {value && isImage && (
        <div className="group relative mx-auto h-32 w-32 overflow-hidden rounded-full border border-border bg-background">
          <Image
            src={value}
            alt="Uploaded image preview"
            fill
            sizes="128px"
            className="object-cover"
          />

          {/* Hover Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
            <button
              type="button"
              onClick={() => onChange("")}
              disabled={disabled}
              className="rounded-md bg-background/90 px-3 py-1 text-xs font-medium text-foreground shadow hover:bg-background"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* 2️⃣ NON-IMAGE FILE PREVIEW */}
      {value && !isImage && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-background text-xs font-semibold uppercase text-muted-foreground">
            File
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {fileName}
            </p>
            <p className="text-xs text-muted-foreground">
              Attached file
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange("")}
            disabled={disabled}
          >
            Remove
          </Button>
        </div>
      )}

      {/* 3️⃣ UPLOAD ZONE (only when no file exists) */}
      {!value && (
        <UploadDropzone
          endpoint={endpoint}
          disabled={disabled}
          config={{ cn }}
          appearance={{
            container: cn(
              "w-full rounded-xl border-2 border-dashed border-border bg-muted/30 px-3 py-4 transition",
              "hover:border-primary/60 hover:bg-muted/40",
              "data-[state=uploading]:border-primary data-[state=uploading]:bg-muted/60"
            ),
            uploadIcon: "h-8 w-8 text-muted-foreground",
            label: "text-sm font-medium text-foreground",
            allowedContent: "text-xs text-muted-foreground",
            button:
              "mt-2 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90",
          }}
          content={{
            label: labelText,
            allowedContent: allowedText,
          }}
          onClientUploadComplete={(res) => {
            onChange(res?.[0]?.url);
          }}
          onUploadError={(error: Error) => {
            console.error(error);
          }}
        />
      )}
    </div>
);
}
