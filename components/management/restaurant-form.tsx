"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { ApiError } from "@/lib/api-client";
import { IMAGE_CONTENT_TYPES, uploadImage, validateImageFile } from "@/services/image-upload-service";

import type {
  CreateRestaurantInput,
  RestaurantRecord,
  RestaurantImage,
} from "@/types/restaurant";

interface RestaurantFormProps {
  allowImages?: boolean;
  canSubmit?: boolean;
  restaurant?: RestaurantRecord;
  images?: RestaurantImage[];
  isSubmitting: boolean;
  onSubmit: (input: CreateRestaurantInput, savedId?: number) => Promise<RestaurantRecord>;
  token: string;
  onSaved: () => Promise<void>;
  onBusy?: (busy: boolean) => void;
  onCancel?: () => void;
}

function optionalValue(value: string): string | undefined {
  const trimmedValue = value.trim();
  return trimmedValue || undefined;
}

export function RestaurantForm({
  restaurant,
  allowImages = true,
  canSubmit = true,
  images = [],
  isSubmitting,
  onSubmit,
  onCancel,
  onBusy,
  token,
  onSaved,
}: RestaurantFormProps) {
  const [name, setName] = useState(restaurant?.name ?? "");
  const [description, setDescription] = useState(
    restaurant?.description ?? "",
  );
  const [address, setAddress] = useState(restaurant?.address ?? "");
  const [city, setCity] = useState(restaurant?.city ?? "");
  const [phone, setPhone] = useState(restaurant?.phone ?? "");
  const [email, setEmail] = useState(restaurant?.email ?? "");
  const [website, setWebsite] = useState(restaurant?.website ?? "");
  const [openingHours, setOpeningHours] = useState(
    restaurant?.openingHours ?? "",
  );

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [altText, setAltText] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const savedId = useRef<number | undefined>(restaurant?.id);
  const submitting = useRef(false);
  const busy = isSubmitting || Boolean(status);

  useEffect(() => {
    if (preview) return () => URL.revokeObjectURL(preview);
  }, [preview]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting.current || busy || !canSubmit) return;
    submitting.current = true;
    onBusy?.(true);
    setError("");
    setStatus("Saving restaurant...");
    try {
      const saved = await onSubmit({
        name: name.trim(),
        description: optionalValue(description),
        address: address.trim(),
        city: city.trim(),
        phone: optionalValue(phone),
        email: optionalValue(email),
        website: optionalValue(website),
        openingHours: optionalValue(openingHours),
      }, savedId.current);
      savedId.current = saved.id;
      if (image) {
        await uploadImage("restaurants", saved.id, image, {
          altText: optionalValue(altText),
          isPrimary: true,
        }, token, setStatus);
        setImage(null);
        setPreview("");
      }
      await onSaved();
    } catch (requestError) {
      const message = requestError instanceof ApiError ? requestError.message : "Unable to save your changes. Please try again.";
      setError(savedId.current ? `Restaurant details are saved. ${message} You can retry without creating another restaurant.` : message);
    } finally {
      submitting.current = false;
      onBusy?.(false);
      setStatus("");
    }
  }

  const inputClassName =
    "workspace-input";

  return (
    <form className="space-y-5" onSubmit={handleSubmit} aria-busy={busy}>
      <fieldset disabled={busy} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-zinc-800">
            Restaurant name
          </span>
          <input
            required
            minLength={2}
            maxLength={150}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClassName}
            placeholder="Restaurant name"
          />
        </label>

        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-zinc-800">
            Description <span className="font-normal text-panel-muted">(optional)</span>
          </span>
          <textarea
            rows={4}
            maxLength={1000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={`${inputClassName} resize-y`}
            placeholder="Describe the restaurant"
          />
        </label>

        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-zinc-800">
            Address
          </span>
          <input
            required
            minLength={3}
            maxLength={255}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            className={inputClassName}
            placeholder="Street address"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-zinc-800">
            City
          </span>
          <input
            required
            minLength={2}
            maxLength={100}
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className={inputClassName}
            placeholder="Colombo"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-zinc-800">
            Phone <span className="font-normal text-panel-muted">(optional)</span>
          </span>
          <input
            type="tel"
            maxLength={30}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={inputClassName}
            placeholder="+94 11 000 0000"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-zinc-800">
            Email <span className="font-normal text-panel-muted">(optional)</span>
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClassName}
            placeholder="restaurant@example.com"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-zinc-800">
            Website <span className="font-normal text-panel-muted">(optional)</span>
          </span>
          <input
            type="url"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            className={inputClassName}
            placeholder="https://example.com"
          />
        </label>

        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-zinc-800">
            Opening hours <span className="font-normal text-panel-muted">(optional)</span>
          </span>
          <input
            maxLength={500}
            value={openingHours}
            onChange={(event) => setOpeningHours(event.target.value)}
            className={inputClassName}
            placeholder="Monday–Sunday, 10:00 AM–10:00 PM"
          />
        </label>
      </div>

      {allowImages ? <div className="space-y-3 rounded-2xl border border-panel-border bg-brand-soft/40 p-4">
        {restaurant && images.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {images.map((existingImage) => (
              <div key={existingImage.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={existingImage.imageUrl} alt={existingImage.altText ?? restaurant.name} className="h-24 w-32 rounded-xl object-cover" />
                <p className="mt-1 text-xs text-panel-muted">{existingImage.isPrimary ? "Current primary image" : "Gallery image"}</p>
              </div>
            ))}
          </div>
        ) : null}
        <label className="block text-sm font-semibold text-zinc-800">
          {restaurant ? "Upload a new primary image" : "Restaurant image (optional)"}
          <input type="file" accept={IMAGE_CONTENT_TYPES.join(",")} className={`${inputClassName} mt-2`} onChange={(event) => {
            setImage(null);
            setPreview("");
            setError("");
            const file = event.target.files?.[0];
            if (!file) return;
            try {
              validateImageFile(file);
              setImage(file);
              setPreview(URL.createObjectURL(file));
            } catch (validationError) {
              setError(validationError instanceof Error ? validationError.message : "Choose a supported image.");
              event.target.value = "";
            }
          }} />
        </label>
        <p className="text-xs text-panel-muted">Choose a JPEG, PNG or WebP photo. It will be uploaded when you save.</p>
        {image && preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Selected restaurant image preview" className="h-40 max-w-full rounded-xl object-contain" />
            <label className="block text-sm font-semibold text-zinc-800">
              Alternative text (optional)
              <input value={altText} onChange={(event) => setAltText(event.target.value)} maxLength={255} className={`${inputClassName} mt-2`} placeholder="Describe the photo" />
            </label>
          </>
        ) : null}
      </div> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={busy || !canSubmit}
          className="rounded-full bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy
            ? status || "Saving..."
            : restaurant
              ? "Save changes"
              : "Create restaurant"}
        </button>

        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Cancel
          </button>
        ) : null}
      </div>
      </fieldset>
      {error ? <p role="alert" className="text-sm text-danger-text">{error}</p> : null}
      {status ? <p role="status" className="text-sm text-zinc-600">{status}</p> : null}
    </form>
  );
}
