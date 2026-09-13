"use client";

import { useMemo, useState, useSyncExternalStore, type FormEvent } from "react";
import Link from "next/link";

import { ApiError } from "@/lib/api-client";
import {
  getAuthSessionSnapshot,
  getAuthToken,
  getServerAuthSessionSnapshot,
  parseStoredUser,
  subscribeToAuthSession,
} from "@/lib/auth-storage";
import { createReview } from "@/services/review-service";
import type { RatingType } from "@/types/review";

interface ReviewFormProps {
  restaurantId: number;
  ratingTypes: RatingType[];
}

export function ReviewForm({ restaurantId, ratingTypes }: ReviewFormProps) {
  const storedUser = useSyncExternalStore(
    subscribeToAuthSession,
    getAuthSessionSnapshot,
    getServerAuthSessionSnapshot,
  );
  const user = useMemo(() => parseStoredUser(storedUser), [storedUser]);

  const [title, setTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const token = getAuthToken();
    if (!token) {
      setErrorMessage("Please log in before submitting a review.");
      return;
    }

    const selectedRatings = ratingTypes
      .filter((ratingType) => ratings[ratingType.id] !== undefined)
      .map((ratingType) => ({
        ratingTypeId: ratingType.id,
        ratingValue: ratings[ratingType.id],
      }));

    if (selectedRatings.length !== ratingTypes.length) {
      setErrorMessage("Please select a score for every rating type.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createReview(
        {
          restaurantId,
          title: title.trim() || undefined,
          reviewText: reviewText.trim(),
          ratings: selectedRatings,
        },
        token,
      );

      setTitle("");
      setReviewText("");
      setRatings({});
      setSuccessMessage(
        "Your review was submitted successfully and is awaiting moderation.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Unable to submit your review. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user) {
    return (
      <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold text-zinc-950">Write a review</h2>
        <p className="mt-3 text-zinc-600">
          You need to log in with a customer account before sharing a review.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-flex rounded-full bg-orange-500 px-5 py-2.5 font-semibold text-white hover:bg-orange-600"
        >
          Log in to review
        </Link>
      </section>
    );
  }

  if (user.role !== "CUSTOMER") {
    return (
      <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold text-zinc-950">Write a review</h2>
        <p className="mt-3 text-zinc-600">
          Reviews can only be submitted from a customer account.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-bold text-zinc-950">Write a review</h2>
      <p className="mt-2 text-sm text-zinc-500">
        Your review will be published after moderation.
      </p>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        {errorMessage ? (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div role="status" className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </div>
        ) : null}

        <div>
          <label htmlFor="review-title" className="mb-2 block text-sm font-semibold text-zinc-800">
            Title <span className="font-normal text-zinc-500">(optional)</span>
          </label>
          <input
            id="review-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            minLength={2}
            maxLength={150}
            placeholder="Summarize your experience"
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none transition placeholder:text-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          />
        </div>

        <div>
          <label htmlFor="review-text" className="mb-2 block text-sm font-semibold text-zinc-800">
            Your review
          </label>
          <textarea
            id="review-text"
            required
            minLength={5}
            maxLength={2000}
            rows={5}
            value={reviewText}
            onChange={(event) => setReviewText(event.target.value)}
            placeholder="Tell the community about the food, service, and atmosphere."
            className="w-full resize-y rounded-xl border border-zinc-300 px-4 py-3 outline-none transition placeholder:text-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          />
        </div>

        {ratingTypes.length > 0 ? (
          <div className="space-y-4">
            {ratingTypes.map((ratingType) => (
              <fieldset key={ratingType.id}>
                <legend className="text-sm font-semibold text-zinc-800">
                  {ratingType.name}
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <label key={value} className="cursor-pointer">
                      <input
                        type="radio"
                        name={`rating-${ratingType.id}`}
                        value={value}
                        checked={ratings[ratingType.id] === value}
                        onChange={() =>
                          setRatings((currentRatings) => ({
                            ...currentRatings,
                            [ratingType.id]: value,
                          }))
                        }
                        className="peer sr-only"
                      />
                      <span className="inline-flex size-10 items-center justify-center rounded-full border border-orange-200 text-sm font-bold text-orange-600 transition peer-checked:border-orange-500 peer-checked:bg-orange-500 peer-checked:text-white">
                        {value}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Rating types are not available yet. Please try again later.
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || ratingTypes.length === 0}
          className="inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Submitting..." : "Submit review"}
        </button>
      </form>
    </section>
  );
}
