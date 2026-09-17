"use client";

import { useState, type FormEvent } from "react";

import { ApiError } from "@/lib/api-client";
import {
  addRestaurantImage,
  deleteRestaurantImage,
} from "@/services/restaurant-management-service";
import type { RestaurantImage } from "@/types/restaurant";

interface ImageManagerProps {
  restaurantId: number;
  images: RestaurantImage[];
  token: string;
  onChanged: () => Promise<void>;
}

export function ImageManager({
  restaurantId,
  images,
  token,
  onChanged,
}: ImageManagerProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsWorking(true);
    setError("");
    setFeedback("");
    try {
      await addRestaurantImage(
        restaurantId,
        {
          imageUrl: imageUrl.trim(),
          altText: altText.trim() || undefined,
          isPrimary,
        },
        token,
      );
      setImageUrl("");
      setAltText("");
      setIsPrimary(false);
      await onChanged();
      setFeedback("Restaurant image added successfully.");
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Unable to add the restaurant image.",
      );
    } finally {
      setIsWorking(false);
    }
  }

  async function handleDelete(imageId: number) {
    if (!window.confirm("Delete this restaurant image link?")) {
      return;
    }

    setIsWorking(true);
    setError("");
    setFeedback("");
    try {
      await deleteRestaurantImage(restaurantId, imageId, token);
      await onChanged();
      setFeedback("Restaurant image deleted successfully.");
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Unable to delete the restaurant image.",
      );
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-bold text-zinc-950">Restaurant images</h2>
      <p className="mt-2 text-sm text-zinc-500">
        The backend currently stores image URLs rather than uploaded files.
      </p>

      {error ? <p role="alert" className="mt-4 text-sm text-red-700">{error}</p> : null}
      {feedback ? <p role="status" className="mt-4 text-sm text-green-700">{feedback}</p> : null}

      {images.length > 0 ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <div key={image.id} className="overflow-hidden rounded-2xl border border-zinc-200">
              {/* Images are supplied dynamically by the backend. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.imageUrl} alt={image.altText ?? "Restaurant"} className="h-40 w-full object-cover" />
              <div className="flex items-center justify-between gap-3 p-3">
                <span className="text-xs font-medium text-zinc-500">{image.isPrimary ? "Primary image" : "Gallery image"}</span>
                <button
                  type="button"
                  disabled={isWorking}
                  onClick={() => void handleDelete(image.id)}
                  className="text-xs font-semibold text-red-600 disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-zinc-500">No restaurant images added yet.</p>
      )}

      <form className="mt-6 grid gap-3 sm:grid-cols-2" onSubmit={handleAdd}>
        <input
          type="url"
          required
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="https://example.com/restaurant.jpg"
          className="rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-orange-500 sm:col-span-2"
        />
        <input
          maxLength={255}
          value={altText}
          onChange={(event) => setAltText(event.target.value)}
          placeholder="Alternative text (optional)"
          className="rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-orange-500"
        />
        <label className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700">
          <input type="checkbox" checked={isPrimary} onChange={(event) => setIsPrimary(event.target.checked)} className="accent-orange-500" />
          Set as primary image
        </label>
        <button disabled={isWorking} className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60 sm:col-span-2">
          {isWorking ? "Saving..." : "Add restaurant image"}
        </button>
      </form>
    </section>
  );
}
