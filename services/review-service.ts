import { apiRequest } from "@/lib/api-client";
import type {
  CreateReviewInput,
  RatingType,
  RestaurantRatingSummary,
  RestaurantReview,
} from "@/types/review";

export function getRestaurantReviews(
  restaurantId: number,
): Promise<RestaurantReview[]> {
  return apiRequest<RestaurantReview[]>(
    `/restaurants/${restaurantId}/reviews`,
  );
}

export function getRestaurantRatingSummary(
  restaurantId: number,
): Promise<RestaurantRatingSummary> {
  return apiRequest<RestaurantRatingSummary>(
    `/restaurants/${restaurantId}/rating-summary`,
  );
}

export function getRatingTypes(): Promise<RatingType[]> {
  return apiRequest<RatingType[]>("/rating-types");
}

export function createReview(
  input: CreateReviewInput,
  token: string,
): Promise<RestaurantReview> {
  return apiRequest<RestaurantReview>("/reviews", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
}
