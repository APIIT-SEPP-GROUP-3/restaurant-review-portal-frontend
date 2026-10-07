import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RestaurantVisit } from "@/components/restaurants/restaurant-visit";
import { RestaurantGallery } from "@/components/restaurants/restaurant-gallery";
import { RestaurantMenu } from "@/components/menu/restaurant-menu";
import { RatingSummary } from "@/components/reviews/rating-summary";
import { ReviewForm } from "@/components/reviews/review-form";
import { ReviewList } from "@/components/reviews/review-list";
import { ApiError } from "@/lib/api-client";
import { getRestaurantMenuItems } from "@/services/menu-service";
import { getRestaurantById } from "@/services/restaurant-service";
import {
  getRatingTypes,
  getReviewComments,
  getRestaurantRatingSummary,
  getRestaurantReviews,
} from "@/services/review-service";
import type { ManagedMenuItem, RestaurantDetail } from "@/types/restaurant";
import type {
  RatingType,
  RestaurantRatingSummary,
  RestaurantReview,
  ReviewComment,
} from "@/types/review";

export const metadata: Metadata = {
  title: "Restaurant details",
  description: "View restaurant information on DineRate.",
};

interface RestaurantDetailPageProps {
  params: Promise<{ id: string }>;
}

interface RestaurantLoadResult {
  restaurant: RestaurantDetail | null;
  errorMessage: string;
  isNotFound: boolean;
}

interface ReviewData {
  reviews: RestaurantReview[];
  ratingSummary: RestaurantRatingSummary;
  ratingTypes: RatingType[];
  commentsByReviewId: Record<number, ReviewComment[]>;
  errorMessage: string;
}

interface MenuData {
  menuItems: ManagedMenuItem[];
  errorMessage: string;
}

async function loadRestaurant(
  restaurantId: number,
): Promise<RestaurantLoadResult> {
  try {
    return {
      restaurant: await getRestaurantById(restaurantId),
      errorMessage: "",
      isNotFound: false,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return {
        restaurant: null,
        errorMessage: "",
        isNotFound: true,
      };
    }

    return {
      restaurant: null,
      errorMessage:
        error instanceof ApiError
          ? error.message
          : "Unable to load this restaurant.",
      isNotFound: false,
    };
  }
}

async function loadReviewData(restaurantId: number): Promise<ReviewData> {
  const results = await Promise.allSettled([
    getRestaurantReviews(restaurantId),
    getRestaurantRatingSummary(restaurantId),
    getRatingTypes(),
  ]);

  const [reviewsResult, summaryResult, ratingTypesResult] = results;
  const hasError = results.some((result) => result.status === "rejected");

  const reviews =
    reviewsResult.status === "fulfilled" ? reviewsResult.value : [];
  const commentResults = await Promise.allSettled(
    reviews.map((review) => getReviewComments(review.id)),
  );
  const commentsByReviewId = Object.fromEntries(
    reviews.map((review, index) => [
      review.id,
      commentResults[index]?.status === "fulfilled"
        ? commentResults[index].value
        : [],
    ]),
  );
  const hasCommentError = commentResults.some(
    (result) => result.status === "rejected",
  );

  return {
    reviews,
    ratingSummary:
      summaryResult.status === "fulfilled"
        ? summaryResult.value
        : { overallAverage: null, reviewCount: 0, ratingTypes: [] },
    ratingTypes:
      ratingTypesResult.status === "fulfilled" ? ratingTypesResult.value : [],
    commentsByReviewId,
    errorMessage: hasError || hasCommentError
      ? "Some review information is temporarily unavailable."
      : "",
  };
}

async function loadMenuData(restaurantId: number): Promise<MenuData> {
  try {
    return {
      menuItems: await getRestaurantMenuItems(restaurantId),
      errorMessage: "",
    };
  } catch (error) {
    return {
      menuItems: [],
      errorMessage:
        error instanceof ApiError
          ? error.message
          : "The restaurant menu is temporarily unavailable.",
    };
  }
}

export default async function RestaurantDetailPage({
  params,
}: RestaurantDetailPageProps) {
  const { id } = await params;
  const restaurantId = Number(id);

  if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
    notFound();
  }

  const { restaurant, errorMessage, isNotFound } =
    await loadRestaurant(restaurantId);

  if (isNotFound) {
    notFound();
  }

  if (!restaurant) {
    return (
      <section className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="max-w-lg rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-950">
            Restaurant unavailable
          </h1>
          <p className="mt-3 text-red-700">{errorMessage}</p>
          <Link
            href="/restaurants"
            className="mt-6 inline-flex font-semibold text-orange-600"
          >
            Return to restaurants
          </Link>
        </div>
      </section>
    );
  }

  const [reviewData, menuData] = await Promise.all([
    loadReviewData(restaurant.id),
    loadMenuData(restaurant.id),
  ]);

  const rating = reviewData.ratingSummary.overallAverage;
  const reviewCount = reviewData.ratingSummary.reviewCount;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.name}, ${restaurant.address}, ${restaurant.city}`)}`;

  return (
    <div className="flex-1 bg-[#faf6f2] text-zinc-950">
        <RestaurantGallery images={restaurant.images} name={restaurant.name}>
        <header className={`mx-auto flex max-w-6xl flex-col justify-center px-4 pt-8 text-white sm:px-6 sm:pt-12 lg:px-8 ${restaurant.images.length > 1 ? "pb-24" : "pb-8 sm:pb-12"}`}>
          <div className="max-w-2xl rounded-3xl border border-white/25 bg-zinc-950/40 p-6 shadow-2xl shadow-black/15 backdrop-blur-xl sm:p-9">
          <Link href="/restaurants" className="mb-4 inline-flex text-xs font-medium text-white/80 hover:text-white">← All restaurants</Link>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-white">{restaurant.city}</span>
            {restaurant.categories.map(({ category }) => (
              <span key={category.id} className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-white/90">{category.name}</span>
            ))}
          </div>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">{restaurant.name}</h1>
          <div className="mt-3 flex max-w-xl flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/80">
            <a href="#reviews" className="inline-flex items-center gap-2 hover:text-white">
              <span aria-hidden="true" className="text-lg text-orange-500">★</span>
              {rating !== null ? <span><strong className="text-white">{rating.toFixed(1)}</strong> / 5 · {reviewCount} {reviewCount === 1 ? "review" : "reviews"}</span> : <span>No ratings yet</span>}
            </a>
          </div>
          <p className="mt-4 max-w-xl whitespace-pre-line text-base leading-7 text-white/80 sm:text-lg">
            {restaurant.description ?? "Explore the menu and discover your next dining experience."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#menu" className="rounded-full bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600">Explore the menu ↓</a>
            <a href="#write-review" className="rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/20">Write a review</a>
            <a href={directionsUrl} target="_blank" rel="noreferrer" className="rounded-full px-4 py-3.5 text-sm font-semibold text-white/90 hover:bg-white/10">Get directions ↗</a>
          </div>
          </div>
        </header>
        </RestaurantGallery>

        <div id="menu" className="scroll-mt-24 bg-[#faf6f2]">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          {menuData.errorMessage ? (
            <section>
              <h2 className="text-3xl font-bold">Explore the menu</h2>
              <p role="status" className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">{menuData.errorMessage}</p>
            </section>
          ) : <RestaurantMenu menuItems={menuData.menuItems} />}
          </div>
        </div>

        <section id="visit" aria-labelledby="visit-heading" className="scroll-mt-24 bg-[#f2eae3]">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <RestaurantVisit restaurant={restaurant} directionsUrl={directionsUrl} />
          </div>
        </section>

        <section id="reviews" aria-label="Ratings and customer reviews" className="scroll-mt-24 bg-[#faf6f2]">
          <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          {reviewData.errorMessage ? <p role="status" className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">{reviewData.errorMessage}</p> : null}
          <RatingSummary summary={reviewData.ratingSummary} />
          <ReviewList reviews={reviewData.reviews} commentsByReviewId={reviewData.commentsByReviewId} />
          </div>
        </section>

        <div id="write-review" className="scroll-mt-24 bg-[#f2eae3]">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <ReviewForm restaurantId={restaurant.id} ratingTypes={reviewData.ratingTypes} />
          </div>
        </div>
    </div>
  );
}
