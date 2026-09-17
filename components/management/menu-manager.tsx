"use client";

import { useState, type FormEvent } from "react";

import { ApiError } from "@/lib/api-client";
import {
  addMenuItemImage,
  createMenuCategory,
  createMenuItem,
  deleteMenuItemImage,
  updateMenuCategory,
  updateMenuItem,
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
  const [itemCategoryId, setItemCategoryId] = useState(
    menuCategories[0] ? String(menuCategories[0].id) : "",
  );
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  async function runAction(action: () => Promise<unknown>, success: string) {
    setIsWorking(true);
    setError("");
    setFeedback("");
    try {
      await action();
      await onChanged();
      setFeedback(success);
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      setIsWorking(false);
    }
  }

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction(
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
    setCategoryName("");
    setCategoryOrder("0");
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

  async function handleCreateItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction(
      () =>
        createMenuItem(
          restaurantId,
          {
            menuCategoryId: Number(itemCategoryId),
            name: itemName.trim(),
            description: itemDescription.trim() || undefined,
            price: Number(itemPrice),
            isAvailable: true,
          },
          token,
        ),
      "Menu item created successfully.",
    );
    setItemName("");
    setItemDescription("");
    setItemPrice("");
  }

  async function handleUpdateItem(
    event: FormEvent<HTMLFormElement>,
    item: ManagedMenuItem,
  ) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await runAction(
      () =>
        updateMenuItem(
          item.id,
          {
            menuCategoryId: Number(formData.get("menuCategoryId")),
            name: String(formData.get("name") ?? "").trim(),
            description:
              String(formData.get("description") ?? "").trim() || undefined,
            price: Number(formData.get("price")),
          },
          token,
        ),
      "Menu item updated successfully.",
    );
  }

  return (
    <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-bold text-zinc-950">Menu management</h2>
      <p className="mt-2 text-sm text-zinc-500">
        Organize menu categories and keep item information available to customers.
      </p>

      {error ? <p role="alert" className="mt-4 text-sm text-red-700">{error}</p> : null}
      {feedback ? <p role="status" className="mt-4 text-sm text-green-700">{feedback}</p> : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form className="rounded-2xl bg-orange-50 p-5" onSubmit={handleCreateCategory}>
          <h3 className="font-bold text-zinc-950">Add menu category</h3>
          <input
            required
            minLength={2}
            maxLength={100}
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            placeholder="e.g. Main dishes"
            className="mt-3 w-full rounded-xl border border-orange-200 bg-white px-4 py-3 outline-none focus:border-orange-500"
          />
          <input
            type="number"
            min={0}
            required
            value={categoryOrder}
            onChange={(event) => setCategoryOrder(event.target.value)}
            className="mt-3 w-full rounded-xl border border-orange-200 bg-white px-4 py-3 outline-none focus:border-orange-500"
            aria-label="Display order"
          />
          <button disabled={isWorking} className="mt-3 rounded-xl bg-orange-500 px-5 py-2.5 font-semibold text-white disabled:opacity-60">
            Add category
          </button>
        </form>

        <form className="rounded-2xl bg-zinc-50 p-5" onSubmit={handleCreateItem}>
          <h3 className="font-bold text-zinc-950">Add menu item</h3>
          <select
            required
            value={itemCategoryId}
            onChange={(event) => setItemCategoryId(event.target.value)}
            className="mt-3 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3"
          >
            <option value="">Select menu category</option>
            {menuCategories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <input required minLength={2} maxLength={150} value={itemName} onChange={(event) => setItemName(event.target.value)} placeholder="Item name" className="mt-3 w-full rounded-xl border border-zinc-300 px-4 py-3" />
          <input maxLength={1000} value={itemDescription} onChange={(event) => setItemDescription(event.target.value)} placeholder="Description (optional)" className="mt-3 w-full rounded-xl border border-zinc-300 px-4 py-3" />
          <input type="number" required min="0.01" step="0.01" value={itemPrice} onChange={(event) => setItemPrice(event.target.value)} placeholder="Price" className="mt-3 w-full rounded-xl border border-zinc-300 px-4 py-3" />
          <button disabled={isWorking || menuCategories.length === 0} className="mt-3 rounded-xl bg-orange-500 px-5 py-2.5 font-semibold text-white disabled:opacity-60">
            Add menu item
          </button>
        </form>
      </div>

      {menuCategories.length > 0 ? (
        <div className="mt-8">
          <h3 className="font-bold text-zinc-950">Menu categories</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {menuCategories.map((category) => (
              <form key={category.id} onSubmit={(event) => void handleUpdateCategory(event, category.id)} className="grid grid-cols-[1fr_6rem_auto] gap-2 rounded-xl border border-zinc-200 p-3">
                <input name="name" required minLength={2} maxLength={100} defaultValue={category.name} className="min-w-0 rounded-lg border border-zinc-200 px-3 py-2" aria-label="Menu category name" />
                <input name="displayOrder" type="number" min={0} required defaultValue={category.displayOrder} className="min-w-0 rounded-lg border border-zinc-200 px-3 py-2" aria-label="Display order" />
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
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">{item.menuCategory.name}</p>
                  <h4 className="mt-1 text-xl font-bold text-zinc-950">{item.name}</h4>
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
                <form onSubmit={(event) => void handleUpdateItem(event, item)} className="mt-3 grid gap-3 sm:grid-cols-2">
                  <select name="menuCategoryId" defaultValue={item.menuCategoryId} className="rounded-xl border border-zinc-300 px-4 py-3">
                    {menuCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                  <input name="name" required minLength={2} maxLength={150} defaultValue={item.name} className="rounded-xl border border-zinc-300 px-4 py-3" />
                  <input name="description" maxLength={1000} defaultValue={item.description ?? ""} placeholder="Description" className="rounded-xl border border-zinc-300 px-4 py-3" />
                  <input name="price" type="number" required min="0.01" step="0.01" defaultValue={Number(item.price)} className="rounded-xl border border-zinc-300 px-4 py-3" />
                  <button disabled={isWorking} className="rounded-xl border border-orange-200 px-5 py-3 font-semibold text-orange-600 disabled:opacity-60 sm:col-span-2">Save item changes</button>
                </form>
              </details>

              <MenuItemImages item={item} token={token} isWorking={isWorking} runAction={runAction} />
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
}: {
  item: ManagedMenuItem;
  token: string;
  isWorking: boolean;
  runAction: (action: () => Promise<unknown>, success: string) => Promise<void>;
}) {
  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    await runAction(
      () =>
        addMenuItemImage(
          item.id,
          {
            imageUrl: String(formData.get("imageUrl") ?? "").trim(),
            altText: String(formData.get("altText") ?? "").trim() || undefined,
            isPrimary: formData.get("isPrimary") === "on",
          },
          token,
        ),
      "Menu item image added successfully.",
    );
    form.reset();
  }

  return (
    <details className="mt-4 border-t border-zinc-100 pt-4">
      <summary className="cursor-pointer text-sm font-semibold text-orange-600">Manage item images ({item.images.length})</summary>
      <div className="mt-3 flex flex-wrap gap-2">
        {item.images.map((image) => (
          <span key={image.id} className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
            {image.isPrimary ? "Primary" : "Image"} #{image.id}
            <button
              type="button"
              disabled={isWorking}
              onClick={() => {
                if (window.confirm("Delete this menu item image link?")) {
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
      <form className="mt-3 grid gap-2 sm:grid-cols-2" onSubmit={handleAdd}>
        <input name="imageUrl" type="url" required placeholder="Image URL" className="rounded-xl border border-zinc-300 px-3 py-2 sm:col-span-2" />
        <input name="altText" maxLength={255} placeholder="Alternative text" className="rounded-xl border border-zinc-300 px-3 py-2" />
        <label className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm"><input name="isPrimary" type="checkbox" className="accent-orange-500" /> Primary image</label>
        <button disabled={isWorking} className="rounded-xl bg-orange-500 px-4 py-2 font-semibold text-white disabled:opacity-60 sm:col-span-2">Add item image</button>
      </form>
    </details>
  );
}
