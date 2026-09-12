export interface RatingType {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewRating {
  id: number;
  reviewId: number;
  ratingTypeId: number;
  ratingValue: number;
  createdAt: string;
  updatedAt: string;
  ratingType: RatingType;
}

export interface ReviewAuthor {
  id: number;
  firstName: string;
  lastName: string;
}

export interface ReviewMenuItem {
  id: number;
  name: string;
}

export interface RestaurantReview {
  id: number;
  userId: number;
  restaurantId: number;
  menuItemId: number | null;
  title: string | null;
  reviewText: string;
  overallRating: number | string | null;
  moderationStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  user: ReviewAuthor;
  menuItem: ReviewMenuItem | null;
  ratings: ReviewRating[];
}

export interface RatingSummaryItem {
  ratingTypeId: number;
  name: string;
  average: number;
}

export interface RestaurantRatingSummary {
  overallAverage: number | null;
  reviewCount: number;
  ratingTypes: RatingSummaryItem[];
}

export interface RatingInput {
  ratingTypeId: number;
  ratingValue: number;
}

export interface CreateReviewInput {
  restaurantId: number;
  menuItemId?: number;
  title?: string;
  reviewText: string;
  ratings: RatingInput[];
}
