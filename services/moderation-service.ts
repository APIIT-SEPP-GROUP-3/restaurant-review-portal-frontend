import { apiRequest } from "@/lib/api-client";
import type {
  ModerationComment,
  ModerationReview,
  ModerationStatus,
} from "@/types/moderation";

export function getReviewsForModeration(
  status: ModerationStatus,
  token: string,
): Promise<ModerationReview[]> {
  return apiRequest<ModerationReview[]>(
    `/moderation/reviews?status=${status}`,
    { token },
  );
}

export function approveReview(
  reviewId: number,
  token: string,
): Promise<ModerationReview> {
  return apiRequest<ModerationReview>(
    `/moderation/reviews/${reviewId}/approve`,
    { method: "PATCH", token },
  );
}

export function rejectReview(
  reviewId: number,
  rejectionReason: string,
  token: string,
): Promise<ModerationReview> {
  return apiRequest<ModerationReview>(
    `/moderation/reviews/${reviewId}/reject`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify({ rejectionReason }),
    },
  );
}

export function getCommentsForModeration(
  status: ModerationStatus,
  token: string,
): Promise<ModerationComment[]> {
  return apiRequest<ModerationComment[]>(
    `/moderation/comments?status=${status}`,
    { token },
  );
}

export function approveComment(
  commentId: number,
  token: string,
): Promise<ModerationComment> {
  return apiRequest<ModerationComment>(
    `/moderation/comments/${commentId}/approve`,
    { method: "PATCH", token },
  );
}

export function rejectComment(
  commentId: number,
  rejectionReason: string,
  token: string,
): Promise<ModerationComment> {
  return apiRequest<ModerationComment>(
    `/moderation/comments/${commentId}/reject`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify({ rejectionReason }),
    },
  );
}
