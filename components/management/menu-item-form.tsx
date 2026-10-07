"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api-client";
import { createMenuItem, updateMenuItem } from "@/services/restaurant-management-service";
import { IMAGE_CONTENT_TYPES, uploadImage, validateImageFile } from "@/services/image-upload-service";
import type { ManagedMenuItem, MenuCategory } from "@/types/restaurant";

export const menuInputClass = "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 placeholder:text-zinc-400 focus:border-orange-500 focus:outline-none";

export function MenuItemForm({ restaurantId, categories, item, token, onChanged }: {
  restaurantId: number;
  categories: MenuCategory[];
  item?: ManagedMenuItem;
  token: string;
  onChanged: () => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const savedId = useRef(item?.id);
  const submitting = useRef(false);
  useEffect(() => {
    if (preview) return () => URL.revokeObjectURL(preview);
  }, [preview]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || categories.length === 0) return;
    submitting.current = true;
    const form = event.currentTarget;
    const data = new FormData(form);
    setError("");
    setFeedback("");
    setStatus("Saving menu item...");
    let detailsSaved = false;
    try {
      const input = {
        menuCategoryId: Number(data.get("menuCategoryId")),
        name: String(data.get("name") ?? "").trim(),
        description: String(data.get("description") ?? "").trim(),
        price: Number(data.get("price")),
        isAvailable: data.get("isAvailable") === "on",
      };
      const saved = savedId.current
        ? await updateMenuItem(savedId.current, input, token)
        : await createMenuItem(restaurantId, input, token);
      savedId.current = saved.id;
      detailsSaved = true;
      if (file) {
        await uploadImage("menu-items", saved.id, file, {
          altText: String(data.get("altText") ?? "").trim() || undefined,
          isPrimary: true,
        }, token, setStatus);
        setFile(null);
        setPreview("");
      }
      // Refresh after both the item and its photo are saved.
      await onChanged();
      if (!item) {
        form.reset();
        savedId.current = undefined;
      }
      setFeedback(item ? "Menu item updated successfully." : "Menu item added successfully.");
    } catch (requestError) {
      const message = requestError instanceof ApiError ? requestError.message : "Unable to save the menu item. Please try again.";
      setError(detailsSaved ? `Menu item details are saved. ${message} Retry to finish without adding a duplicate item.` : message);
    } finally {
      submitting.current = false;
      setStatus("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-busy={Boolean(status)}>
      {!categories.length ? <p className="rounded-xl bg-orange-50 p-3 text-sm text-orange-800">Add a menu category first, then add your dishes below.</p> : null}
      <fieldset disabled={Boolean(status) || !categories.length} className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-semibold text-zinc-800">Menu category
          <select name="menuCategoryId" required defaultValue={item?.menuCategoryId ?? ""} className={menuInputClass}>
            <option value="" disabled>Select a menu category</option>
            {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label className="space-y-2 text-sm font-semibold text-zinc-800">Item name
          <input name="name" required minLength={2} maxLength={150} defaultValue={item?.name ?? ""} placeholder="e.g. Chicken kottu" className={menuInputClass} />
        </label>
        <label className="space-y-2 text-sm font-semibold text-zinc-800 sm:col-span-2">Description (optional)
          <textarea name="description" maxLength={1000} rows={3} defaultValue={item?.description ?? ""} placeholder="Describe the dish" className={menuInputClass} />
        </label>
        <label className="space-y-2 text-sm font-semibold text-zinc-800">Price (LKR)
          <input name="price" type="number" required min="0.01" step="0.01" defaultValue={item ? Number(item.price) : ""} placeholder="0.00" className={menuInputClass} />
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
          <input name="isAvailable" type="checkbox" defaultChecked={item?.isAvailable ?? true} className="accent-orange-500" /> Available to order
        </label>
        <label className="space-y-2 text-sm font-semibold text-zinc-800 sm:col-span-2">{item ? "New primary dish photo (optional)" : "Dish photo (optional)"}
          <input name="photo" type="file" accept={IMAGE_CONTENT_TYPES.join(",")} className={menuInputClass} onChange={event => {
            setFile(null); setPreview(""); setError(""); setFeedback("");
            const selected = event.target.files?.[0];
            if (!selected) return;
            try {
              validateImageFile(selected);
              setFile(selected); setPreview(URL.createObjectURL(selected));
            } catch (validationError) {
              setError(validationError instanceof Error ? validationError.message : "Choose a supported image.");
              event.target.value = "";
            }
          }} />
          <span className="block font-normal text-zinc-500">JPEG, PNG or WebP. The photo uploads when you save this item.</span>
        </label>
        {file && preview ? <div className="space-y-3 sm:col-span-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Selected dish photo preview" className="h-40 max-w-full rounded-xl object-contain" />
          <label className="block space-y-2 text-sm font-semibold text-zinc-800">Alternative text (optional)
            <input name="altText" maxLength={255} placeholder="Describe the dish photo" className={menuInputClass} />
          </label>
        </div> : null}
        <button className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60 sm:col-span-2">{status || (item ? "Save item changes" : "Add menu item")}</button>
      </fieldset>
      {status ? <p role="status" className="text-sm text-zinc-600">{status}</p> : null}
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
      {feedback ? <p role="status" className="text-sm text-green-700">{feedback}</p> : null}
    </form>
  );
}
