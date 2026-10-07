"use client";

import { useState, type FormEvent } from "react";
import type { CreateMenuCategoryInput, MenuCategory } from "@/types/restaurant";

export function MenuCategoryForm({ category, busy, formId, onSave }: {
  category?: MenuCategory; busy: boolean; formId: string;
  onSave: (input: CreateMenuCategoryInput) => Promise<void>;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [order, setOrder] = useState(String(category?.displayOrder ?? 0));
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!busy) void onSave({ name: name.trim(), displayOrder: Number(order) });
  }
  return <form id={formId} onSubmit={submit}>
    <fieldset disabled={busy} className="space-y-4">
      <label className="block space-y-2 text-sm font-semibold">Category name
        <input required minLength={2} maxLength={100} value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Main dishes" className="workspace-input" />
      </label>
      <label className="block space-y-2 text-sm font-semibold">Display order
        <input type="number" min={0} step={1} required value={order} onChange={event => setOrder(event.target.value)} className="workspace-input" />
      </label>
    </fieldset>
  </form>;
}
