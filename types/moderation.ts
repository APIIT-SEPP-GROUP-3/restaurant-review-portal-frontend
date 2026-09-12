import type { ReviewRating } from "@/types/review";

export type ModerationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ModerationUser {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  role?: {
    roleName: string;
  };
}

export interface ModerationRestaurant {
  id: number;
  name: string;
  city?: string;
}

export interface ModerationReview {
  id: number;
  userId: number;
  restaurantId: number;
  menuItemId: number | null;
  title: string | null;
  reviewText: string;
  overallRating: number | string | null;
  moderationStatus: ModerationStatus;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  user: ModerationUser;
  restaurant: ModerationRestaurant;
  menuItem: { id: number; name: string } | null;
  ratings: ReviewRating[];
}

export interface ModerationComment {
  id: number;
  reviewId: number;
  userId: number;
  parentCommentId: number | null;
  commentText: string;
  moderationStatus: ModerationStatus;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  user: ModerationUser;
  review: {
    id: number;
    title: string | null;
    reviewText?: string;
    restaurant: ModerationRestaurant;
  };
  parentComment: {
    id: number;
    commentText: string;
  } | null;
}
