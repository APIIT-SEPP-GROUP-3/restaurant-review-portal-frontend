import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PhotoCarousel } from "@/components/ui/photo-carousel";
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

  const reviewData = await loadReviewData(item.id);

  return (
    <div className="flex-1 bg-brand-soft text-panel-text">
      <PhotoCarousel images={item.images} name={item.name}>
        <header className={`mx-auto flex min-h-[28rem] max-w-6xl items-center px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8 ${item.images.length > 1 ? "pb-24" : "pb-8 sm:pb-10"}`}>
          <div className="w-full max-w-xl rounded-3xl border border-white/25 bg-zinc-950/55 p-6 text-white shadow-2xl backdrop-blur-xl sm:p-8">
            <Link href="/menu" className="inline-flex rounded-full border border-white/25 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15">← Back to menu</Link>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white">{item.menuCategory.name}</span>
              <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold">{item.isAvailable ? "Available now" : "Currently unavailable"}</span>
            </div>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{item.name}</h1>
            <p className="mt-4 whitespace-pre-line leading-7 text-zinc-100">{item.description ?? "Menu item information from the restaurant."}</p>
            <p className="mt-5 text-3xl font-bold">LKR {Number(item.price).toFixed(2)}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#write-review" className="workspace-button workspace-button-primary rounded-full">Review this dish</a>
              <Link href={`/restaurants/${item.restaurant.id}`} className="rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/20">Visit restaurant ↗</Link>
            </div>
            <p className="mt-4 text-sm text-zinc-200">Served by {item.restaurant.name} · {item.restaurant.city}</p>
          </div>
        </header>
      </PhotoCarousel>

      <section id="reviews" aria-label="Dish ratings and reviews" className="scroll-mt-24 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {reviewData.errorMessage ? <p role="status" className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">{reviewData.errorMessage}</p> : null}
          <RatingSummary summary={reviewData.ratingSummary} />
          <MenuItemReviewList reviews={reviewData.reviews} />
        </div>
      </section>
      <section id="write-review" aria-label="Review this dish" className="scroll-mt-24 bg-panel-subtle px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <ReviewForm restaurantId={item.restaurantId} menuItemId={item.id} ratingTypes={reviewData.ratingTypes} />
        </div>
      </section>
    </div>
  );
}
