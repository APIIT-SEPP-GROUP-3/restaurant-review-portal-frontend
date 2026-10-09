import { RouteGuard } from "@/components/auth/route-guard";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
export const metadata = { title: "Administration" };
export default function AdminPage() { return <RouteGuard allowedRoles={["ADMIN"]} returnPath="/admin"><AdminDashboard /></RouteGuard>; }
