"use client";

import { useState, type FormEvent } from "react";

import type {
  CreateRestaurantInput,
  RestaurantRecord,
} from "@/types/restaurant";

interface RestaurantFormProps {
  restaurant?: RestaurantRecord;
  isSubmitting: boolean;
  onSubmit: (input: CreateRestaurantInput) => Promise<void>;
  onCancel?: () => void;
}

function optionalValue(value: string): string | undefined {
  const trimmedValue = value.trim();
  return trimmedValue || undefined;
}

export function RestaurantForm({
  restaurant,
  isSubmitting,
  onSubmit,
  onCancel,
}: RestaurantFormProps) {
  const [name, setName] = useState(restaurant?.name ?? "");
  const [description, setDescription] = useState(
    restaurant?.description ?? "",
  );
  const [address, setAddress] = useState(restaurant?.address ?? "");
  const [city, setCity] = useState(restaurant?.city ?? "");
  const [phone, setPhone] = useState(restaurant?.phone ?? "");
  const [email, setEmail] = useState(restaurant?.email ?? "");
  const [website, setWebsite] = useState(restaurant?.website ?? "");
  const [openingHours, setOpeningHours] = useState(
    restaurant?.openingHours ?? "",
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      name: name.trim(),
      description: optionalValue(description),
      address: address.trim(),
      city: city.trim(),
      phone: optionalValue(phone),
      email: optionalValue(email),
      website: optionalValue(website),
      openingHours: optionalValue(openingHours),
    });
  }

  const inputClassName =
    "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100";

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-zinc-800">
            Restaurant name
          </span>
          <input
            required
            minLength={2}
            maxLength={150}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClassName}
            placeholder="Restaurant name"
          />
        </label>

        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-zinc-800">
            Description <span className="font-normal text-zinc-500">(optional)</span>
          </span>
          <textarea
            rows={4}
            maxLength={1000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={`${inputClassName} resize-y`}
            placeholder="Describe the restaurant"
          />
        </label>

        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-zinc-800">
            Address
          </span>
          <input
            required
            minLength={3}
            maxLength={255}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            className={inputClassName}
            placeholder="Street address"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-zinc-800">
            City
          </span>
          <input
            required
            minLength={2}
            maxLength={100}
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className={inputClassName}
            placeholder="Colombo"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-zinc-800">
            Phone <span className="font-normal text-zinc-500">(optional)</span>
          </span>
          <input
            type="tel"
            maxLength={30}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={inputClassName}
            placeholder="+94 11 000 0000"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-zinc-800">
            Email <span className="font-normal text-zinc-500">(optional)</span>
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClassName}
            placeholder="restaurant@example.com"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-zinc-800">
            Website <span className="font-normal text-zinc-500">(optional)</span>
          </span>
          <input
            type="url"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            className={inputClassName}
            placeholder="https://example.com"
          />
        </label>

        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-zinc-800">
            Opening hours <span className="font-normal text-zinc-500">(optional)</span>
          </span>
          <input
            maxLength={500}
            value={openingHours}
            onChange={(event) => setOpeningHours(event.target.value)}
            className={inputClassName}
            placeholder="Monday–Sunday, 10:00 AM–10:00 PM"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Saving..."
            : restaurant
              ? "Save changes"
              : "Create restaurant"}
        </button>

        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
