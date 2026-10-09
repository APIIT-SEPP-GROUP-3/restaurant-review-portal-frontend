"use client";
import { useEffect, useState, type FormEvent } from "react";
import { getRestaurantCategories } from "@/services/restaurant-service";
import { createRestaurantCategory } from "@/services/restaurant-management-service";
import { getAuthToken } from "@/lib/auth-storage";
import type { RestaurantCategory } from "@/types/restaurant";
export function SystemCategories() {
  const [categories, setCategories] = useState<RestaurantCategory[]>([]), [error, setError] = useState(""), [busy, setBusy] = useState(false), [success, setSuccess] = useState("");
  useEffect(() => { let active = true; getRestaurantCategories().then(data => { if (active) setCategories(data); }).catch(e => { if (active) setError(e.message); }); return () => { active = false; }; }, []);
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    const token = getAuthToken(); if (!token) return;
    const form = event.currentTarget, data = new FormData(form);
    setBusy(true); setError(""); setSuccess("");
    try { const category = await createRestaurantCategory({ name: String(data.get("name")).trim(), description: String(data.get("description")).trim() || undefined }, token); setCategories(current => [...current, category]); form.reset(); setSuccess("Category created successfully."); }
    catch(e) { setError(e instanceof Error ? e.message : "Unable to create category."); } finally { setBusy(false); }
  }
  return <section className="workspace-card mt-6 p-5"><h3 className="font-semibold">System restaurant categories</h3><p className="mt-2 text-sm text-panel-muted">Create categories for owners to assign to their restaurants.</p><div className="mt-4 flex flex-wrap gap-2">{categories.map(category => <span key={category.id} className="rounded-full bg-brand-soft px-3 py-1 text-xs">{category.name}</span>)}</div><form className="mt-4" onSubmit={create}><fieldset disabled={busy} className="grid gap-3 sm:grid-cols-2"><label><span className="text-sm">Category name</span><input required name="name" minLength={2} maxLength={100} className="workspace-input mt-2" /></label><label><span className="text-sm">Description (optional)</span><input name="description" maxLength={500} className="workspace-input mt-2" /></label><button className="workspace-button sm:col-span-2">{busy ? "Creating..." : "Create category"}</button></fieldset></form>{error ? <p role="alert" className="mt-3 text-sm text-danger-text">{error}</p> : null}{success ? <p role="status" className="mt-3 text-sm text-success-text">{success}</p> : null}</section>;
}
