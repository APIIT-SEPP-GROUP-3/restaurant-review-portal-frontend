"use client";
import { SystemCategories } from "@/components/admin/system-categories";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuthUser } from "@/hooks/use-auth-user";
import { getAuthToken } from "@/lib/auth-storage";
import { getAdminUsers, getOverview, getRoles, saveUser, type AdminUser, type AdminRole, type UserInput } from "@/services/admin-service";
import { WorkspaceShell, WorkspaceHeader } from "@/components/workspace/workspace-shell";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { WorkspaceDialog } from "@/components/workspace/workspace-dialog";
import { WorkspaceTable } from "@/components/workspace/workspace-table";
import { WorkspaceToast } from "@/components/workspace/workspace-toast";
import { Pagination } from "@/components/workspace/pagination";
import { TableSkeleton } from "@/components/ui/loading-layouts";
const labels = { CUSTOMER: "Customer", RESTAURANT_OWNER: "Restaurant owner", MODERATOR: "Moderator", ADMIN: "Administrator" };
export function AdminDashboard() {
  const user = useAuthUser();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [overview, setOverview] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1), [total, setTotal] = useState(0), [loading, setLoading] = useState(true);
  const [error, setError] = useState(""), [success, setSuccess] = useState("");
  const [editing, setEditing] = useState<AdminUser | "new" | null>(null);
  const [busy, setBusy] = useState(false), [refresh, setRefresh] = useState(0);
  const lock = useRef(false);
  useEffect(() => {
    const token = getAuthToken(); if (!token) return;
    let active = true;
    Promise.all([getAdminUsers(token, page), getRoles(token), getOverview(token)]).then(([result, roles, counts]) => {
      if (active) { setUsers(result.data); setTotal(result.pagination?.total ?? result.data.length); setRoles(roles); setOverview(counts); }
    }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, refresh]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (lock.current) return;
    const token = getAuthToken(); if (!token || !editing) return;
    const form = new FormData(event.currentTarget);
    const input: UserInput = { firstName: String(form.get("firstName")).trim(), lastName: String(form.get("lastName")).trim(), email: String(form.get("email")).trim(), role: String(form.get("role")) as UserInput["role"] };
    if (editing === "new") input.password = String(form.get("password"));
    else input.isActive = editing.id === user?.id ? true : form.get("isActive") === "on";
    lock.current = true; setBusy(true); setError("");
    try { await saveUser(token, input, editing === "new" ? undefined : editing.id); setEditing(null); setSuccess("User saved successfully."); setLoading(true); setRefresh(x => x + 1); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to save user."); }
    finally { lock.current = false; setBusy(false); }
  }
  const selected = editing && editing !== "new" ? editing : undefined;
  return <><WorkspaceShell label="Administrator content" sidebar={<AdminSidebar active="users" firstName={user?.firstName ?? ""} />} footer={<Pagination page={page} total={total} loading={loading} onPageChange={page => { setLoading(true); setPage(page); }} />}>
    <WorkspaceHeader breadcrumb="Administration / Users" title="Users & roles" description="Create accounts, assign responsibilities, and manage account access." actions={<button className="workspace-button workspace-button-primary" onClick={() => { setError(""); setEditing("new"); }}>Add user</button>} />
    <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">{Object.entries(overview).map(([name, count]) => <div key={name} className="workspace-card p-5"><p className="text-sm capitalize text-panel-muted">{name}</p><p className="mt-2 text-3xl font-bold">{count}</p></div>)}</div>
    {error && !editing ? <p role="alert" className="mt-4 text-danger-text">{error}<button className="workspace-button ml-3" onClick={() => { setError(""); setLoading(true); setRefresh(x => x + 1); }}>Retry</button></p> : null}
    {success ? <WorkspaceToast message={success} onDismiss={() => setSuccess("")} /> : null}
    <div className="workspace-card mt-6 overflow-hidden">{loading ? <TableSkeleton label="Loading users" /> : users.length ? <WorkspaceTable label="Users" header={<tr><th>User</th><th>Role</th><th>Status</th><th>Actions</th></tr>}>{users.map(account => <tr key={account.id}><td className="p-4"><p className="font-semibold">{account.firstName} {account.lastName}</p><p className="break-all text-xs text-panel-muted">{account.email}</p></td><td className="p-4">{labels[account.role.roleName]}</td><td className="p-4">{account.isActive ? "Active" : "Inactive"}</td><td className="p-4 text-right"><button className="workspace-button" onClick={() => { setError(""); setEditing(account); }}>View / edit</button></td></tr>)}</WorkspaceTable> : <p className="p-8 text-center text-panel-muted">No users to display.</p>}</div>
    <SystemCategories />
  </WorkspaceShell>
  {editing ? <WorkspaceDialog title={selected ? "User details & access" : "Add user"} busy={busy} onClose={() => { setEditing(null); setError(""); }}><form onSubmit={submit} className="space-y-4"><fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
    {(["firstName", "lastName", "email"] as const).map(field => <label key={field} className={field === "email" ? "sm:col-span-2" : ""}><span className="mb-2 block text-sm font-semibold">{field === "firstName" ? "First name" : field === "lastName" ? "Last name" : "Email"}</span><input name={field} required type={field === "email" ? "email" : "text"} minLength={field === "email" ? undefined : 2} maxLength={field === "email" ? undefined : 100} defaultValue={selected?.[field]} className="workspace-input" /></label>)}
    {!selected ? <label className="sm:col-span-2">Password<input name="password" type="password" autoComplete="new-password" required minLength={8} className="workspace-input mt-2" /><span className="text-xs text-panel-muted">At least 8 characters.</span></label> : null}
    <label className="sm:col-span-2">Role<select name="role" defaultValue={selected?.role.roleName ?? roles[0]?.roleName} className="workspace-input mt-2">{roles.filter(role => selected?.id !== user?.id || role.roleName === "ADMIN").map(role => <option key={role.id} value={role.roleName}>{labels[role.roleName]}</option>)}</select></label>
    {selected ? <label className="flex items-center gap-2 sm:col-span-2"><input name="isActive" type="checkbox" defaultChecked={selected.isActive} disabled={selected.id === user?.id} />Active account</label> : null}
    <p className="text-xs text-panel-muted sm:col-span-2">Reassign an owner’s restaurants before changing their role. Your own administrator account must remain active with its administrator role.</p>
    <button disabled={busy || !roles.length} className="workspace-button workspace-button-primary sm:col-span-2">{busy ? "Saving..." : "Save user"}</button>
  </fieldset>{error ? <p role="alert" className="text-sm text-danger-text">{error}</p> : null}</form></WorkspaceDialog> : null}</>;
}
