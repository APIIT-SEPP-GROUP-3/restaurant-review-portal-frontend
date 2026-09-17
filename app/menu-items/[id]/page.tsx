import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MenuItemReviewList } from "@/components/menu/menu-item-review-list";
import { RatingSummary } from "@/components/reviews/rating-summary";
import { ReviewForm } from "@/components/reviews/review-form";
import { ApiError } from "@/lib/api-client";
import { getMenuItemById } from "@/services/menu-service";
import {
  getMenuItemRatingSummary,
  getMenuItemReviews,
  getRatingTypes,
} from "@/services/review-service";
import type { PublicMenuItem } from "@/types/menu";
import type {
  MenuItemReview,
  RatingType,
  RestaurantRatingSummary,
} from "@/types/review";

export const metadata: Metadata = {
  title: "Menu item details",
  description: "View menu item information, ratings, and reviews on DineRate.",
};

interface MenuItemPageProps {
  params: Promise<{ id: string }>;
}

interface ItemLoadResult {
  item: PublicMenuItem | null;
  errorMessage: string;
  isNotFound: boolean;
}

interface ReviewData {
  reviews: MenuItemReview[];
  ratingSummary: RestaurantRatingSummary;
  ratingTypes: RatingType[];
  errorMessage: string;
}

async function loadMenuItem(menuItemId: number): Promise<ItemLoadResult> {
  try {
    return {
      item: await getMenuItemById(menuItemId),
      errorMessage: "",
      isNotFound: false,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { item: null, errorMessage: "", isNotFound: true };
    }

    return {
      item: null,
      errorMessage:
        error instanceof ApiError
          ? error.message
          : "Unable to load this menu item.",
      isNotFound: false,
    };
  }
}

async function loadReviewData(menuItemId: number): Promise<ReviewData> {
  const results = await Promise.allSettled([
    getMenuItemReviews(menuItemId),
    getMenuItemRatingSummary(menuItemId),
    getRatingTypes(),
  ]);
  const [reviewsResult, summaryResult, ratingTypesResult] = results;

  return {
    reviews: reviewsResult.status === "fulfilled" ? reviewsResult.value : [],
    ratingSummary:
      summaryResult.status === "fulfilled"
        ? summaryResult.value
        : { overallAverage: null, reviewCount: 0, ratingTypes: [] },
    ratingTypes:
      ratingTypesResult.status === "fulfilled" ? ratingTypesResult.value : [],
    errorMessage: results.some((result) => result.status === "rejected")
      ? "Some rating or review information is temporarily unavailable."
      : "",
  };
}

export default async function MenuItemPage({ params }: MenuItemPageProps) {
  const { id } = await params;
  const menuItemId = Number(id);

  if (!Number.isInteger(menuItemId) || menuItemId <= 0) {
    notFound();
  }

  const { item, errorMessage, isNotFound } = await loadMenuItem(menuItemId);

  if (isNotFound) {
    notFound();
  }

  if (!item) {
    return (
      <section className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="max-w-lg rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-950">
            Menu item unavailable
          </h1>
          <p className="mt-3 text-red-700">{errorMessage}</p>
          <Link href="/menu" className="mt-6 inline-flex font-semibold text-orange-600">
            Return to menu
          </Link>
        </div>
      </section>
    );
  }

  const primaryImage =
    item.images.find((image) => image.isPrimary) ?? item.images[0];
  const reviewData = await loadReviewData(item.id);

  return (
    <section className="flex-1 bg-gradient-to-b from-orange-50/70 to-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/menu"
          className="inline-flex font-semibold text-orange-600 hover:text-orange-700"
        >
          ← Back to menu
        </Link>

        <div className="mt-6 overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-lg">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="min-h-96 bg-gradient-to-br from-orange-100 to-amber-100">
              {primaryImage ? (
                // Images are supplied dynamically by the backend.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={primaryImage.imageUrl}
                  alt={primaryImage.altText ?? item.name}
                  className="h-full min-h-96 w-full object-cover"
                />
              ) : (
                <div className="flex min-h-96 items-center justify-center">
                  <span className="flex size-28 items-center justify-center rounded-3xl bg-orange-500 text-5xl font-bold text-white">
                    {item.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="p-7 sm:p-10">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
                    {item.menuCategory.name}
                  </p>
                  <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-950">
                    {item.name}
                  </h1>
                </div>
                <span className="rounded-2xl bg-orange-50 px-4 py-2 text-xl font-bold text-orange-600">
                  LKR {Number(item.price).toFixed(2)}
                </span>
              </div>

              <p className="mt-6 leading-7 text-zinc-600">
                {item.description ?? "Menu item information from the restaurant."}
              </p>

              <span
                className={`mt-6 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                  item.isAvailable
                    ? "bg-green-100 text-green-700"
                    : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {item.isAvailable ? "Available now" : "Currently unavailable"}
              </span>

              <div className="mt-8 border-t border-zinc-100 pt-6">
                <p className="text-sm text-zinc-500">Served by</p>
                <Link
                  href={`/restaurants/${item.restaurant.id}`}
                  className="mt-1 inline-flex text-xl font-bold text-zinc-950 hover:text-orange-600"
                >
                  {item.restaurant.name}
                </Link>
                <p className="mt-1 text-sm text-zinc-500">
                  {item.restaurant.city}
                </p>
              </div>
            </div>
          </div>
        </div>

        {reviewData.errorMessage ? (
          <p className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            {reviewData.errorMessage}
          </p>
        ) : null}

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-8">
            <RatingSummary summary={reviewData.ratingSummary} />
            <ReviewForm
              restaurantId={item.restaurantId}
              menuItemId={item.id}
              ratingTypes={reviewData.ratingTypes}
            />
          </div>

          <MenuItemReviewList reviews={reviewData.reviews} />
        </div>
      </div>
    </section>
  );
}
