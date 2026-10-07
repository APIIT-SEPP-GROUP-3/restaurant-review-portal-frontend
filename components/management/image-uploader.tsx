"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api-client";
import { IMAGE_CONTENT_TYPES, uploadImage, validateImageFile, type ImageUploadStage } from "@/services/image-upload-service";

interface ImageUploaderProps {
  resource: "restaurants" | "menu-items";
  resourceId: number;
  token: string;
  disabled?: boolean;
  onChanged: () => Promise<void>;
  onBusy?: (busy: boolean) => void;
}

export function ImageUploader({ resource, resourceId, token, disabled = false, onChanged, onBusy }: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [stage, setStage] = useState<ImageUploadStage | null>(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const submitting = useRef(false);

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || disabled || submitting.current) return;
    submitting.current = true;
    onBusy?.(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    setError("");
    setFeedback("");
    try {
      await uploadImage(resource, resourceId, file, {
        altText: String(data.get("altText") ?? "").trim() || undefined,
        isPrimary: data.get("isPrimary") === "on",
      }, token, setStage);
      form.reset();
      setFile(null);
      setPreview("");
      setFeedback("Image uploaded successfully.");
      await onChanged();
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "Unable to save the image. Please try again.");
    } finally {
      submitting.current = false;
      onBusy?.(false);
      setStage(null);
    }
  }

  return (
    <form onSubmit={handleUpload} className="mt-6 space-y-3" aria-busy={stage !== null}>
      <fieldset disabled={disabled || stage !== null} className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-zinc-700 sm:col-span-2">
          Choose an image (JPEG, PNG or WebP)
          <input type="file" required accept={IMAGE_CONTENT_TYPES.join(",")} className="workspace-input file:mr-3 file:rounded-lg file:border-0 file:bg-brand-soft file:px-3 file:py-2 file:text-brand-hover" onChange={(event) => {
            const selected = event.target.files?.[0] ?? null;
            setError("");
            setFeedback("");
            setFile(null);
            setPreview("");
            if (!selected) return;
            try {
              validateImageFile(selected);
              setFile(selected);
              setPreview(URL.createObjectURL(selected));
            } catch (validationError) {
              setError(validationError instanceof Error ? validationError.message : "Choose a supported image.");
              event.target.value = "";
            }
          }} />
        </label>
        {file && preview ? (
          <div className="sm:col-span-2">
            {/* Local file previews use temporary blob URLs. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Selected image preview" className="h-40 max-w-full rounded-xl object-contain" />
            <p className="mt-1 break-all text-xs text-panel-muted">{file.name}</p>
          </div>
        ) : null}
        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          Alternative text (optional)
          <input name="altText" maxLength={255} placeholder="Describe the image" className="workspace-input" />
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
          <input name="isPrimary" type="checkbox" className="accent-brand" /> Set as primary image
        </label>
        <button disabled={!file} className="rounded-xl bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-hover disabled:opacity-60 sm:col-span-2">
          {stage ?? "Upload image"}
        </button>
      </fieldset>
      {stage ? <p role="status" className="text-sm text-zinc-600">{stage}</p> : null}
      {error ? <p role="alert" className="text-sm text-danger-text">{error}</p> : null}
      {feedback ? <p role="status" className="text-sm text-success-hover">{feedback}</p> : null}
    </form>
  );
}
