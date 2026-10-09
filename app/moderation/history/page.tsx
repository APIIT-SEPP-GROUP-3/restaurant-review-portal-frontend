import { RouteGuard } from "@/components/auth/route-guard";
import { AccountReviews } from "@/components/reviews/account-reviews";
export default function Page() { return <RouteGuard allowedRoles={["MODERATOR"]} returnPath="/moderation/history"><AccountReviews history /></RouteGuard>; }
