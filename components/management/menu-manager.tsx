"use client";

import { useRef, useState, type FormEvent } from "react";

import { MenuItemForm, menuInputClass } from "@/components/management/menu-item-form";
import { ImageUploader } from "@/components/management/image-uploader";
import { ApiError } from "@/lib/api-client";
import {
  createMenuCategory,
  deleteMenuItemImage,
  updateMenuCategory,
  updateMenuItemAvailability,
} from "@/services/restaurant-management-service";
import type {
  ManagedMenuItem,
  MenuCategory,
} from "@/types/restaurant";

interface MenuManagerProps {
  restaurantId: number;
  menuCategories: MenuCategory[];
  menuItems: ManagedMenuItem[];
  token: string;
  onChanged: () => Promise<void>;
}

function messageFrom(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Unable to complete the menu request.";
}

export function MenuManager({
  restaurantId,
  menuCategories,
  menuItems,
  token,
  onChanged,
}: MenuManagerProps) {
  const [categoryName, setCategoryName] = useState("");
  const [categoryOrder, setCategoryOrder] = useState("0");
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const working = useRef(false);

  async function runAction(action: () => Promise<unknown>, success: string) {
    if (working.current) return false;
    working.current = true;
    setIsWorking(true);
    setError("");
    setFeedback("");
    try {
      await action();
      await onChanged();
      setFeedback(success);
      return true;
    } catch (requestError) {
      setError(messageFrom(requestError));
      return false;
    } finally {
      working.current = false;
      setIsWorking(false);
    }
  }

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const succeeded = await runAction(
      () =>
        createMenuCategory(
          restaurantId,
          {
            name: categoryName.trim(),
            displayOrder: Number(categoryOrder),
          },
          token,
        ),
      "Menu category created successfully.",
    );
    if (succeeded) {
      setCategoryName("");
      setCategoryOrder("0");
    }
  }

  async function handleUpdateCategory(
    event: FormEvent<HTMLFormElement>,
    categoryId: number,
  ) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await runAction(
      () =>
        updateMenuCategory(
          categoryId,
          {
            name: String(formData.get("name") ?? "").trim(),
            displayOrder: Number(formData.get("displayOrder")),
          },
          token,
        ),
      "Menu category updated successfully.",
    );
  }

  return (
    <section className="rounded-3xl border border-orange-100 bg-white p-6 text-zinc-950 shadow-sm sm:p-8">
      <h2 className="text-2xl font-bold text-zinc-950">Menu management</h2>
      <p className="mt-2 text-sm text-zinc-500">
        Organize menu categories and keep item information available to customers.
      </p>

      {error ? <p role="alert" className="mt-4 text-sm text-red-700">{error}</p> : null}
      {feedback ? <p role="status" className="mt-4 text-sm text-green-700">{feedback}</p> : null}

      <div className="mt-6 space-y-6">
        <form className="rounded-2xl bg-orange-50 p-5" onSubmit={handleCreateCategory}>
          <h3 className="font-bold text-zinc-950">Add menu category</h3>
          <label className="mt-3 block text-sm font-semibold text-zinc-800">Category name
          <input
            required
            minLength={2}
            maxLength={100}
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            placeholder="e.g. Main dishes"
            className={`${menuInputClass} mt-2`}
          />
          </label>
          <label className="mt-3 block text-sm font-semibold text-zinc-800">Display order
          <input
            type="number"
            min={0}
            step={1}
            required
            value={categoryOrder}
            onChange={(event) => setCategoryOrder(event.target.value)}
            className={`${menuInputClass} mt-2`}
            aria-label="Display order"
          />
          </label>
          <button disabled={isWorking} className="mt-3 rounded-xl bg-orange-500 px-5 py-2.5 font-semibold text-white disabled:opacity-60">
            Add category
          </button>
        </form>

        <div className="rounded-2xl bg-zinc-50 p-5">
          <h3 className="mb-4 font-bold text-zinc-950">Add menu item</h3>
          <MenuItemForm restaurantId={restaurantId} categories={menuCategories} token={token} onChanged={onChanged} />
        </div>
      </div>

      {menuCategories.length > 0 ? (
        <div className="mt-8">
          <h3 className="font-bold text-zinc-950">Menu categories</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {menuCategories.map((category) => (
              <form key={category.id} onSubmit={(event) => void handleUpdateCategory(event, category.id)} className="grid grid-cols-[1fr_6rem_auto] gap-2 rounded-xl border border-zinc-200 p-3">
                <input name="name" required minLength={2} maxLength={100} defaultValue={category.name} className="min-w-0 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-950" aria-label="Menu category name" />
                <input name="displayOrder" type="number" min={0} required defaultValue={category.displayOrder} className="min-w-0 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-950" aria-label="Display order" />
                <button disabled={isWorking} className="font-semibold text-orange-600 disabled:opacity-60">Save</button>
              </form>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-8 space-y-4">
        <h3 className="font-bold text-zinc-950">Menu items</h3>
        {menuItems.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-500">No menu items added yet.</p>
        ) : (
          menuItems.map((item) => (
            <article key={item.id} className="rounded-2xl border border-zinc-200 p-5">
              {item.images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={(item.images.find(image => image.isPrimary) ?? item.images[0]).imageUrl} alt={(item.images.find(image => image.isPrimary) ?? item.images[0]).altText ?? item.name} className="mb-4 h-40 w-full rounded-xl object-cover sm:w-56" />
              ) : null}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">{item.menuCategory.name}</p>
                  <h4 className="mt-1 text-xl font-bold text-zinc-950">{item.name}</h4>
                  {item.description ? <p className="mt-2 text-sm text-zinc-600">{item.description}</p> : null}
                  <p className="mt-1 text-sm text-zinc-500">LKR {Number(item.price).toFixed(2)}</p>
                </div>
                <button
                  type="button"
                  disabled={isWorking}
                  onClick={() => void runAction(() => updateMenuItemAvailability(item.id, !item.isAvailable, token), "Menu item availability updated.")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${item.isAvailable ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-600"}`}
                >
                  {item.isAvailable ? "Available" : "Unavailable"}
                </button>
              </div>

              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-semibold text-orange-600">Edit item</summary>
                <div className="mt-4">
                  <MenuItemForm restaurantId={restaurantId} categories={menuCategories} item={item} token={token} onChanged={onChanged} />
                </div>
              </details>

              <MenuItemImages item={item} token={token} isWorking={isWorking} runAction={runAction} onChanged={onChanged} />
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function MenuItemImages({
  item,
  token,
  isWorking,
  runAction,
  onChanged,
}: {
  item: ManagedMenuItem;
  token: string;
  isWorking: boolean;
  onChanged: () => Promise<void>;
  runAction: (action: () => Promise<unknown>, success: string) => Promise<boolean>;
}) {
  return (
    <details className="mt-4 border-t border-zinc-100 pt-4">
      <summary className="cursor-pointer text-sm font-semibold text-orange-600">Manage item images ({item.images.length})</summary>
      <div className="mt-3 flex flex-wrap gap-2">
        {item.images.map((image) => (
          <span key={image.id} className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.imageUrl} alt={image.altText ?? item.name} className="h-12 w-12 rounded-lg object-cover" />
            {image.isPrimary ? "Primary" : "Image"} #{image.id}
            <button
              type="button"
              aria-label={`Delete image of ${item.name}`}
              disabled={isWorking}
              onClick={() => {
                if (window.confirm("Delete this menu item image?")) {
                  void runAction(() => deleteMenuItemImage(item.id, image.id, token), "Menu item image deleted successfully.");
                }
              }}
              className="font-bold text-red-600"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <ImageUploader resource="menu-items" resourceId={item.id} token={token} disabled={isWorking} onChanged={onChanged} />
    </details>
  );
}
