"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";

import { ApiError } from "@/lib/api-client";
import {
  getAuthSessionSnapshot,
  getAuthToken,
  getServerAuthSessionSnapshot,
  parseStoredUser,
  subscribeToAuthSession,
} from "@/lib/auth-storage";
import {
  createRestaurant,
  updateRestaurant,
} from "@/services/restaurant-management-service";
import { getRestaurants } from "@/services/restaurant-service";
import type {
  CreateRestaurantInput,
  RestaurantRecord,
  RestaurantSummary,
} from "@/types/restaurant";

import { RestaurantForm } from "@/components/management/restaurant-form";

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Unable to complete the restaurant request.";
}

export function RestaurantManagementDashboard() {
  const storedUser = useSyncExternalStore(
    subscribeToAuthSession,
    getAuthSessionSnapshot,
    getServerAuthSessionSnapshot,
  );
  const user = useMemo(() => parseStoredUser(storedUser), [storedUser]);

  const [restaurants, setRestaurants] = useState<RestaurantSummary[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<RestaurantRecord | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const canManage =
    user?.role === "RESTAURANT_OWNER" || user?.role === "ADMIN";

  useEffect(() => {
    if (!canManage || !user) {
      return;
    }

    let isActive = true;

    void getRestaurants({ limit: 50, sortBy: "name", sortOrder: "asc" })
      .then((result) => {
        if (!isActive) {
          return;
        }

        setRestaurants(
          user.role === "ADMIN"
            ? result.restaurants
            : result.restaurants.filter(
                (restaurant) => restaurant.ownerId === user.id,
              ),
        );
      })
      .catch((error: unknown) => {
        if (isActive) {
          setErrorMessage(getErrorMessage(error));
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [canManage, user]);

  async function reloadRestaurants() {
    if (!user) {
      return;
    }

    const result = await getRestaurants({
      limit: 50,
      sortBy: "name",
      sortOrder: "asc",
    });

    setRestaurants(
      user.role === "ADMIN"
        ? result.restaurants
        : result.restaurants.filter(
            (restaurant) => restaurant.ownerId === user.id,
          ),
    );
  }

  async function handleCreate(input: CreateRestaurantInput) {
    const token = getAuthToken();
    if (!token) {
      setErrorMessage("Your session has expired. Please log in again.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await createRestaurant(input, token);
      await reloadRestaurants();
      setShowCreateForm(false);
      setSuccessMessage("Restaurant created successfully.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate(input: CreateRestaurantInput) {
    const token = getAuthToken();
    if (!token || !selectedRestaurant) {
      setErrorMessage("Your session has expired. Please log in again.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await updateRestaurant(selectedRestaurant.id, input, token);
      await reloadRestaurants();
      setSelectedRestaurant(null);
      setSuccessMessage("Restaurant updated successfully.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user) {
    return (
      <AccessMessage
        title="Owner login required"
        message="Log in with a restaurant owner or administrator account to manage restaurants."
        showLogin
      />
    );
  }

  if (!canManage) {
    return (
      <AccessMessage
        title="Access restricted"
        message="Your account does not have permission to manage restaurants."
      />
    );
  }

  return (
    <section className="flex-1 bg-gradient-to-b from-orange-50/70 to-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
              Restaurant management
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
              Manage your restaurants
            </h1>
            <p className="mt-4 text-lg text-zinc-600">
              Create restaurant profiles and keep their information current.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowCreateForm(true);
              setSelectedRestaurant(null);
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className="rounded-full bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
          >
            Add restaurant
          </button>
        </div>

        {errorMessage ? (
          <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p role="status" className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </p>
        ) : null}

        {showCreateForm || selectedRestaurant ? (
          <div className="mt-8 rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold text-zinc-950">
              {selectedRestaurant ? "Edit restaurant" : "Create restaurant"}
            </h2>
            <div className="mt-6">
              <RestaurantForm
                key={selectedRestaurant?.id ?? "new"}
                restaurant={selectedRestaurant ?? undefined}
                isSubmitting={isSubmitting}
                onSubmit={selectedRestaurant ? handleUpdate : handleCreate}
                onCancel={() => {
                  setShowCreateForm(false);
                  setSelectedRestaurant(null);
                }}
              />
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-8 rounded-3xl border border-orange-100 bg-white p-10 text-center text-zinc-600">
            Loading restaurants...
          </div>
        ) : restaurants.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-orange-200 bg-white p-10 text-center">
            <h2 className="text-2xl font-bold text-zinc-950">
              No restaurants to manage
            </h2>
            <p className="mt-2 text-zinc-600">
              Create your first restaurant to begin managing its menu and images.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {restaurants.map((restaurant) => (
              <article
                key={restaurant.id}
                className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm"
              >
                <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
                  {restaurant.city}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-zinc-950">
                  {restaurant.name}
                </h2>
                <p className="mt-3 line-clamp-2 text-zinc-600">
                  {restaurant.description ?? restaurant.address}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/manage/restaurants/${restaurant.id}`}
                    className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                  >
                    Manage menu
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRestaurant(restaurant);
                      setShowCreateForm(false);
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    className="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50"
                  >
                    Edit details
                  </button>
                  <Link
                    href={`/restaurants/${restaurant.id}`}
                    className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-50"
                  >
                    View public page
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function AccessMessage({
  title,
  message,
  showLogin = false,
}: {
  title: string;
  message: string;
  showLogin?: boolean;
}) {
  return (
    <section className="flex flex-1 items-center justify-center bg-orange-50/60 px-4 py-16">
      <div className="max-w-lg rounded-3xl border border-orange-100 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-zinc-950">{title}</h1>
        <p className="mt-3 text-zinc-600">{message}</p>
        <Link
          href={showLogin ? "/login" : "/"}
          className="mt-6 inline-flex rounded-full bg-orange-500 px-5 py-2.5 font-semibold text-white hover:bg-orange-600"
        >
          {showLogin ? "Log in" : "Return home"}
        </Link>
      </div>
    </section>
  );
}
