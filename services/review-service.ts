import { apiRequest } from "@/lib/api-client";
import type {
  CreateReviewInput,
  CreateReviewCommentInput,
  RatingType,
  RestaurantRatingSummary,
  RestaurantReview,
  ReviewComment,
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

export function getReviewComments(
  reviewId: number,
): Promise<ReviewComment[]> {
  return apiRequest<ReviewComment[]>(`/reviews/${reviewId}/comments`);
}

export function createReviewComment(
  reviewId: number,
  input: CreateReviewCommentInput,
  token: string,
): Promise<ReviewComment> {
  return apiRequest<ReviewComment>(`/reviews/${reviewId}/comments`, {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
}
