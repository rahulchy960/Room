"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { FileIcon, X } from "lucide-react";

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
  className,
}: FileUploadProps) => {
  const hasValue = Boolean(value);

  const getFileExtension = (url: string) => {
    const cleanUrl = url.split("?")[0];
    return cleanUrl.split(".").pop()?.toLowerCase() ?? "";
  };

  const fileExtension = value ? getFileExtension(value) : "";

  const isImage =
    !!value &&
    ["jpg", "jpeg", "png", "webp", "gif"].includes(fileExtension);

  const isPdf = !!value && fileExtension === "pdf";

  const labelText = hasValue
    ? "Drop a new file or click to replace"
    : "Drop a file here or click to upload";

  const allowedText =
    endpoint === "serverImage"
      ? "PNG, JPG, or WEBP up to 2MB."
      : "Images or PDF.";

  return (
    <div className={cn("w-full min-w-0 space-y-3", className)}>
      {value && isImage && (
        <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-md border border-border bg-background">
          <Image
            src={value}
            alt="Uploaded image preview"
            fill
            sizes="160px"
            className="object-cover"
          />

          <button
            type="button"
            onClick={() => onChange("")}
            disabled={disabled}
            className="absolute right-2 top-2 rounded-full bg-background/90 p-1 text-foreground shadow hover:bg-background"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {value && !isImage && (
        <div className="flex w-full min-w-0 items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border bg-background">
            <FileIcon className="h-6 w-6 text-muted-foreground" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {isPdf ? "PDF attached" : "File attached"}
            </p>

            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary underline"
            >
              View attachment
            </a>
          </div>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onChange("")}
            disabled={disabled}
            className="shrink-0"
          >
            Remove
          </Button>
        </div>
      )}

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
};