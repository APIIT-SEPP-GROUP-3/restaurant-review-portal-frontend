"use client";

import { useState, type FormEvent } from "react";

import { ApiError } from "@/lib/api-client";
import {
  createRestaurantCategory,
  updateRestaurantCategories,
} from "@/services/restaurant-management-service";
import type { RestaurantCategory } from "@/types/restaurant";

interface CategoryManagerProps {
  restaurantId: number;
  categories: RestaurantCategory[];
  selectedCategoryIds: number[];
  token: string;
  isAdmin: boolean;
  onChanged: () => Promise<void>;
}

function messageFrom(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Unable to update restaurant categories.";
}

export function CategoryManager({
  restaurantId,
  categories,
  selectedCategoryIds,
  token,
  isAdmin,
  onChanged,
}: CategoryManagerProps) {
  const [selectedIds, setSelectedIds] = useState(selectedCategoryIds);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  async function saveCategories() {
    if (selectedIds.length === 0) {
      setError("Select at least one restaurant category.");
      return;
    }

    setIsSaving(true);
    setError("");
    setFeedback("");
    try {
      await updateRestaurantCategories(restaurantId, selectedIds, token);
      await onChanged();
      setFeedback("Restaurant categories updated successfully.");
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setFeedback("");
    try {
      await createRestaurantCategory(
        {
          name: newName.trim(),
          description: newDescription.trim() || undefined,
        },
        token,
      );
      setNewName("");
      setNewDescription("");
      await onChanged();
      setFeedback("Restaurant category created successfully.");
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-bold text-zinc-950">Restaurant categories</h2>
      <p className="mt-2 text-sm text-zinc-500">
        Choose the categories customers can use to discover this restaurant.
      </p>

      {error ? <p role="alert" className="mt-4 text-sm text-red-700">{error}</p> : null}
      {feedback ? <p role="status" className="mt-4 text-sm text-green-700">{feedback}</p> : null}

      {categories.length > 0 ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <label key={category.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 p-4 hover:border-orange-200">
              <input
                type="checkbox"
                checked={selectedIds.includes(category.id)}
                onChange={(event) =>
                  setSelectedIds((currentIds) =>
                    event.target.checked
                      ? [...currentIds, category.id]
                      : currentIds.filter((id) => id !== category.id),
                  )
                }
                className="mt-1 size-4 accent-orange-500"
              />
              <span>
                <span className="block font-semibold text-zinc-900">{category.name}</span>
                {category.description ? (
                  <span className="mt-1 block text-xs text-zinc-500">{category.description}</span>
                ) : null}
              </span>
            </label>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No restaurant categories are available.
        </p>
      )}

      <button
        type="button"
        disabled={isSaving || categories.length === 0}
        onClick={() => void saveCategories()}
        className="mt-5 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
      >
        {isSaving ? "Saving..." : "Save categories"}
      </button>

      {isAdmin ? (
        <form className="mt-8 border-t border-zinc-100 pt-6" onSubmit={handleCreateCategory}>
          <h3 className="font-bold text-zinc-950">Create a global category</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1.5fr_auto]">
            <input
              required
              minLength={2}
              maxLength={100}
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="Category name"
              className="rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-orange-500"
            />
            <input
              maxLength={500}
              value={newDescription}
              onChange={(event) => setNewDescription(event.target.value)}
              placeholder="Description (optional)"
              className="rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-orange-500"
            />
            <button disabled={isSaving} className="rounded-xl border border-orange-200 px-5 py-3 font-semibold text-orange-600 disabled:opacity-60">
              Create
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
