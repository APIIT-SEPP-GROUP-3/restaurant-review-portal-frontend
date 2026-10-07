"use client";

import { useState } from "react";

import { ImageUploader } from "@/components/management/image-uploader";
import { ApiError } from "@/lib/api-client";
import {
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
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  async function handleDelete(imageId: number) {
    if (!window.confirm("Delete this restaurant image?")) {
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
        Upload photos of your restaurant and choose a primary image.
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

      <ImageUploader resource="restaurants" resourceId={restaurantId} token={token} disabled={isWorking} onChanged={onChanged} />
    </section>
  );
}
