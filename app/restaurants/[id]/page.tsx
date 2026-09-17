import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

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

  const primaryImage =
    restaurant.images.find((image) => image.isPrimary) ??
    restaurant.images[0];

  const [reviewData, menuData] = await Promise.all([
    loadReviewData(restaurant.id),
    loadMenuData(restaurant.id),
  ]);

  return (
    <section className="flex-1 bg-gradient-to-b from-orange-50/70 to-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
          <Link
            href="/restaurants"
            className="inline-flex font-semibold text-orange-600 hover:text-orange-700"
          >
            ← Back to restaurants
          </Link>

          <div className="mt-6 overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-lg">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
              <div className="min-h-80 bg-gradient-to-br from-orange-100 to-amber-100">
                {primaryImage ? (
                  // Images are supplied dynamically by the backend.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={primaryImage.imageUrl}
                    alt={
                      primaryImage.altText ??
                      `${restaurant.name} restaurant`
                    }
                    className="h-full min-h-80 w-full object-cover"
                  />
                ) : (
                  <div className="flex min-h-80 items-center justify-center">
                    <span className="flex size-24 items-center justify-center rounded-3xl bg-orange-500 text-4xl font-bold text-white">
                      {restaurant.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-7 sm:p-10">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
                  {restaurant.city}
                </p>

                <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-950">
                  {restaurant.name}
                </h1>

                <p className="mt-5 leading-7 text-zinc-600">
                  {restaurant.description ??
                    "Restaurant information and dining details."}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {restaurant.categories.map(({ category }) => (
                    <span
                      key={category.id}
                      className="rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>

                <dl className="mt-8 space-y-4 text-sm">
                  <div>
                    <dt className="font-semibold text-zinc-950">Address</dt>
                    <dd className="mt-1 text-zinc-600">
                      {restaurant.address}, {restaurant.city}
                    </dd>
                  </div>

                  {restaurant.openingHours ? (
                    <div>
                      <dt className="font-semibold text-zinc-950">
                        Opening hours
                      </dt>
                      <dd className="mt-1 text-zinc-600">
                        {restaurant.openingHours}
                      </dd>
                    </div>
                  ) : null}

                  {restaurant.phone ? (
                    <div>
                      <dt className="font-semibold text-zinc-950">Phone</dt>
                      <dd className="mt-1">
                        <a
                          href={`tel:${restaurant.phone}`}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          {restaurant.phone}
                        </a>
                      </dd>
                    </div>
                  ) : null}

                  {restaurant.website ? (
                    <div>
                      <dt className="font-semibold text-zinc-950">Website</dt>
                      <dd className="mt-1">
                        <a
                          href={restaurant.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-orange-600 hover:text-orange-700"
                        >
                          Visit website
                        </a>
                      </dd>
                    </div>
                  ) : null}
                </dl>

                <p className="mt-8 text-xs text-zinc-500">
                  Managed by {restaurant.owner.firstName}{" "}
                  {restaurant.owner.lastName}
                </p>
              </div>
            </div>
        </div>

        {menuData.errorMessage ? (
          <p className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            {menuData.errorMessage}
          </p>
        ) : (
          <RestaurantMenu menuItems={menuData.menuItems} />
        )}

        {reviewData.errorMessage ? (
          <p className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            {reviewData.errorMessage}
          </p>
        ) : null}

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-8">
            <RatingSummary summary={reviewData.ratingSummary} />
            <ReviewForm
              restaurantId={restaurant.id}
              ratingTypes={reviewData.ratingTypes}
            />
          </div>

          <ReviewList
            reviews={reviewData.reviews}
            commentsByReviewId={reviewData.commentsByReviewId}
          />
        </div>
      </div>
    </section>
  );
}
